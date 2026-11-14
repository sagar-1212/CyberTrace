import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';
import {
  CryptoDatasetMetadata,
  CryptoTransactionEdge,
  CryptoTransactionNode,
  CryptoValidationReport,
  EllipticNormalizedClass,
  EllipticRawClass,
} from './types';
import { EllipticDatasetValidator } from './validator';

export interface IngestionOptions {
  sourceDir?: string;
  outputDir?: string;
  metadataDir?: string;
  maxNodesLimit?: number; // Optional memory cap for sample / fast testing
}

export interface IngestionResult {
  success: boolean;
  metadata: CryptoDatasetMetadata;
  validation: CryptoValidationReport;
  summary: {
    totalNodesIngested: number;
    totalEdgesIngested: number;
    illicitCount: number;
    licitCount: number;
    unknownCount: number;
    timeStepsCovered: number;
  };
  outputFiles: string[];
}

export async function ingestEllipticDataset(options: IngestionOptions = {}): Promise<IngestionResult> {
  const defaultRawDir = path.resolve(process.cwd(), 'data', 'crypto', 'raw');
  const defaultSampleDir = path.resolve(process.cwd(), 'data', 'crypto', 'samples');
  const defaultProcessedDir = path.resolve(process.cwd(), 'data', 'crypto', 'processed');
  const defaultMetadataDir = path.resolve(process.cwd(), 'data', 'crypto', 'metadata');

  // Determine active source directory (prefer raw if present, else fallback to sample)
  const rawClasses = path.join(defaultRawDir, 'elliptic_txs_classes.csv');
  const hasRaw = fs.existsSync(rawClasses);
  const activeSourceDir = options.sourceDir || (hasRaw ? defaultRawDir : defaultSampleDir);
  const prefix = activeSourceDir === defaultSampleDir ? '.sample' : '';

  const classesFile = path.join(activeSourceDir, `elliptic_txs_classes${prefix}.csv`);
  const edgelistFile = path.join(activeSourceDir, `elliptic_txs_edgelist${prefix}.csv`);
  const featuresFile = path.join(activeSourceDir, `elliptic_txs_features${prefix}.csv`);

  const outputDir = options.outputDir || defaultProcessedDir;
  const metadataDir = options.metadataDir || defaultMetadataDir;

  // Ensure target directories exist
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(metadataDir, { recursive: true });

  console.log(`[Elliptic Ingest] Starting dataset ingestion from: ${activeSourceDir}`);

  // Step 1: Pre-Ingestion Validation
  const validator = new EllipticDatasetValidator({
    classesPath: classesFile,
    edgelistPath: edgelistFile,
    featuresPath: featuresFile,
  });
  const validationReport = await validator.validate();

  // Save validation report
  const validationReportPath = path.join(metadataDir, 'validation_report.json');
  fs.writeFileSync(validationReportPath, JSON.stringify(validationReport, null, 2), 'utf-8');

  if (!validationReport.isValid) {
    console.error('[Elliptic Ingest] Validation failed. See validation_report.json for error trace.');
    throw new Error(`Elliptic dataset validation failed with ${validationReport.errors.length} errors.`);
  }

  // Step 2: Ingest Classes & Normalize Labels
  console.log('[Elliptic Ingest] Streaming classes and normalizing categorical labels...');
  const nodesMap = new Map<string, Partial<CryptoTransactionNode>>();
  let illicitCount = 0;
  let licitCount = 0;
  let unknownCount = 0;

  const classesStream = readline.createInterface({
    input: fs.createReadStream(classesFile),
    crlfDelay: Infinity,
  });

  let isFirstLine = true;
  for await (const line of classesStream) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    const [txId, rawClassStr] = trimmed.split(',');
    const rawClass = rawClassStr as EllipticRawClass;

    let classLabel: EllipticNormalizedClass = 'unknown';
    let isIllicit = false;
    let isLicit = false;
    let isUnknown = true;
    let heuristicRiskScore = 50;

    if (rawClass === '1') {
      classLabel = 'illicit';
      isIllicit = true;
      isUnknown = false;
      illicitCount++;
      heuristicRiskScore = 95;
    } else if (rawClass === '2') {
      classLabel = 'licit';
      isLicit = true;
      isUnknown = false;
      licitCount++;
      heuristicRiskScore = 12;
    } else {
      unknownCount++;
    }

    nodesMap.set(txId, {
      txId,
      timeStep: 1, // updated by features stream
      classLabel,
      rawClass,
      inDegree: 0,
      outDegree: 0,
      isIllicit,
      isLicit,
      isUnknown,
      heuristicRiskScore,
      provenance: {
        dataset: 'Elliptic Bitcoin Transaction Dataset',
        source: 'Kaggle (ellipticco/elliptic-data-set)',
        isResearchData: true,
        verifiedAt: new Date().toISOString(),
      },
    });

    if (options.maxNodesLimit && nodesMap.size >= options.maxNodesLimit) {
      break;
    }
  }

  // Step 3: Stream Edges & Calculate Degree Centralities
  console.log('[Elliptic Ingest] Parsing graph adjacency & computing degrees...');
  const edges: CryptoTransactionEdge[] = [];
  const edgeListStream = readline.createInterface({
    input: fs.createReadStream(edgelistFile),
    crlfDelay: Infinity,
  });

  isFirstLine = true;
  for await (const line of edgeListStream) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    const [src, dst] = trimmed.split(',');
    // If nodes are within registry, increment degree
    const srcNode = nodesMap.get(src);
    const dstNode = nodesMap.get(dst);

    if (srcNode) srcNode.outDegree = (srcNode.outDegree || 0) + 1;
    if (dstNode) dstNode.inDegree = (dstNode.inDegree || 0) + 1;

    if (srcNode || dstNode) {
      edges.push({ sourceTxId: src, targetTxId: dst });
    }
  }

  // Step 4: Stream Features (Time Steps & Numerical Embeddings)
  console.log('[Elliptic Ingest] Extracting temporal time-steps and numerical feature summaries...');
  const timeStepsSet = new Set<number>();
  const featuresStream = readline.createInterface({
    input: fs.createReadStream(featuresFile),
    crlfDelay: Infinity,
  });

  for await (const line of featuresStream) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(',');
    const txId = parts[0];
    const node = nodesMap.get(txId);

    if (node) {
      const timeStep = parseInt(parts[1], 10) || 1;
      node.timeStep = timeStep;
      timeStepsSet.add(timeStep);

      // Extract sample vector (first 5 numerical proxies)
      const featureVectorSample = parts.slice(2, 7).map((p) => parseFloat(p) || 0);
      node.localFeaturesSummary = {
        feeProxy: featureVectorSample[0],
        inflowProxy: featureVectorSample[1],
        outflowProxy: featureVectorSample[2],
        featureVectorSample,
      };
    }
  }

  // Step 5: Compute File Checksums for Provenance
  const fileChecksums: Record<string, string> = {};
  [classesFile, edgelistFile, featuresFile].forEach((fpath) => {
    if (fs.existsSync(fpath)) {
      const content = fs.readFileSync(fpath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      fileChecksums[path.basename(fpath)] = hash;
    }
  });

  const totalNodes = nodesMap.size;
  const totalEdges = edges.length;
  const timeStepsArray = Array.from(timeStepsSet).sort((a, b) => a - b);

  // Step 6: Generate Metadata Object
  const metadata: CryptoDatasetMetadata = {
    datasetName: 'Elliptic Bitcoin Transaction Graph Dataset',
    version: '1.0.0 (Research)',
    sourceUrl: 'https://www.kaggle.com/datasets/ellipticco/elliptic-data-set',
    paperCitation: 'Mark Weber et al., "Anti-Money Laundering in Bitcoin", KDD 2019',
    isResearchDataset: true,
    totalTransactions: totalNodes,
    totalEdges: totalEdges,
    classDistribution: {
      illicit: illicitCount,
      licit: licitCount,
      unknown: unknownCount,
      illicitPercentage: `${((illicitCount / Math.max(totalNodes, 1)) * 100).toFixed(2)}%`,
      licitPercentage: `${((licitCount / Math.max(totalNodes, 1)) * 100).toFixed(2)}%`,
      unknownPercentage: `${((unknownCount / Math.max(totalNodes, 1)) * 100).toFixed(2)}%`,
    },
    timeStepRange: {
      min: timeStepsArray[0] || 1,
      max: timeStepsArray[timeStepsArray.length - 1] || 1,
      totalTimeSteps: timeStepsArray.length,
    },
    featureDimensions: {
      totalColumns: 167,
      localFeatures: 93,
      aggregatedFeatures: 72,
    },
    fileChecksums,
    importedAt: new Date().toISOString(),
    provenance: `Processed via FinTrace Elliptic Ingestion Pipeline v1.0.0 from ${path.basename(activeSourceDir)}`,
    license: 'CC BY-NC 4.0 (Non-Commercial Research)',
    complianceNotice:
      'CRITICAL: Research dataset labels do not establish real-world guilt, identity, or legal liability of wallet owners. Cryptocurrency forensics entities are maintained strictly isolated from banking records.',
  };

  // Step 7: Write Processed Artifacts
  const metadataPath = path.join(metadataDir, 'dataset_metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

  // Convert nodes map to clean array
  const processedNodes: CryptoTransactionNode[] = Array.from(nodesMap.values()) as CryptoTransactionNode[];

  // Save full graph processed artifact
  const processedGraphPath = path.join(outputDir, 'elliptic_graph.json');
  fs.writeFileSync(
    processedGraphPath,
    JSON.stringify(
      {
        metadata,
        nodesCount: processedNodes.length,
        edgesCount: edges.length,
        nodes: processedNodes,
        edges,
      },
      null,
      2
    ),
    'utf-8'
  );

  // Save time-step index artifact for rapid slice querying
  const timeStepIndex: Record<number, { nodesCount: number; illicitCount: number; sampleTxIds: string[] }> = {};
  timeStepsArray.forEach((ts) => {
    const atStep = processedNodes.filter((n) => n.timeStep === ts);
    timeStepIndex[ts] = {
      nodesCount: atStep.length,
      illicitCount: atStep.filter((n) => n.isIllicit).length,
      sampleTxIds: atStep.slice(0, 5).map((n) => n.txId),
    };
  });

  const timeStepIndexPath = path.join(outputDir, 'time_step_index.json');
  fs.writeFileSync(timeStepIndexPath, JSON.stringify(timeStepIndex, null, 2), 'utf-8');

  console.log(`[Elliptic Ingest] Ingestion complete. Processed ${totalNodes} nodes and ${totalEdges} edges.`);

  return {
    success: true,
    metadata,
    validation: validationReport,
    summary: {
      totalNodesIngested: totalNodes,
      totalEdgesIngested: totalEdges,
      illicitCount,
      licitCount,
      unknownCount,
      timeStepsCovered: timeStepsArray.length,
    },
    outputFiles: [validationReportPath, metadataPath, processedGraphPath, timeStepIndexPath],
  };
}

// CLI runner capability
if (process.argv[1] && process.argv[1].includes('ingestElliptic')) {
  ingestEllipticDataset()
    .then((res) => {
      console.log('Result summary:', res.summary);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Ingestion failed:', err);
      process.exit(1);
    });
}

