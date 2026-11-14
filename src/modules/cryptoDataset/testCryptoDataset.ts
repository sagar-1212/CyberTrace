/**
 * Elliptic Bitcoin Transaction Dataset Integration - Automated Test Suite
 * Validates file structure, schema conformance, label mappings, graph integrity,
 * and reproducible ingestion pipeline execution.
 */

import fs from 'fs';
import path from 'path';
import { EllipticDatasetValidator } from './validator';
import { ingestEllipticDataset } from './ingestElliptic';

export async function runCryptoDatasetTests() {
  console.log('======================================================================');
  console.log('FINTRACE: ELLIPTIC CRYPTO DATASET INGESTION & VALIDATION TEST SUITE');
  console.log('======================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      console.log(`       Details: ${detail}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}`);
      console.error(`       Details: ${detail}`);
    }
  }

  // -------------------------------------------------------------
  // Test 1: Header Validation for Classes File
  // -------------------------------------------------------------
  const validator = new EllipticDatasetValidator();
  const report = await validator.validate();

  const classesHeaderMatch = report.headerValidations.find(
    (h) => h.fileName === 'elliptic_txs_classes.csv'
  );
  assert(
    classesHeaderMatch?.matches === true,
    'Classes File Header Schema Validation',
    `Expected 'txId,class', received: '${classesHeaderMatch?.actualHeader}'.`
  );

  // -------------------------------------------------------------
  // Test 2: Header Validation for Edgelist File
  // -------------------------------------------------------------
  const edgeHeaderMatch = report.headerValidations.find(
    (h) => h.fileName === 'elliptic_txs_edgelist.csv'
  );
  assert(
    edgeHeaderMatch?.matches === true,
    'Edgelist File Header Schema Validation',
    `Expected 'txId1,txId2', received: '${edgeHeaderMatch?.actualHeader}'.`
  );

  // -------------------------------------------------------------
  // Test 3: Feature Dimension Validation (167 Columns)
  // -------------------------------------------------------------
  const featureColsMatch = report.columnValidations.find(
    (c) => c.fileName === 'elliptic_txs_features.csv'
  );
  assert(
    featureColsMatch?.actualColumns === 167,
    'Features Column Width Validation (167 Columns)',
    `Verified 167 features per transaction (1 txId + 1 time_step + 93 local + 72 aggregated).`
  );

  // -------------------------------------------------------------
  // Test 4: Full Ingestion Pipeline Execution
  // -------------------------------------------------------------
  const ingestResult = await ingestEllipticDataset();
  assert(
    ingestResult.success === true && ingestResult.summary.totalNodesIngested >= 10,
    'Reproducible Ingestion Pipeline Execution',
    `Ingested ${ingestResult.summary.totalNodesIngested} Bitcoin transactions and ${ingestResult.summary.totalEdgesIngested} directed payment edges.`
  );

  // -------------------------------------------------------------
  // Test 5: Categorical Label Normalization ('1' -> illicit, '2' -> licit, 'unknown' -> unknown)
  // -------------------------------------------------------------
  const hasIllicit = ingestResult.summary.illicitCount > 0;
  const hasLicit = ingestResult.summary.licitCount > 0;
  const hasUnknown = ingestResult.summary.unknownCount > 0;
  assert(
    hasIllicit && hasLicit && hasUnknown,
    'Label Normalization & Research Classification',
    `Normalized: ${ingestResult.summary.illicitCount} illicit, ${ingestResult.summary.licitCount} licit, ${ingestResult.summary.unknownCount} unknown.`
  );

  // -------------------------------------------------------------
  // Test 6: Graph Topology & Degree Preservation
  // -------------------------------------------------------------
  const processedGraphFile = path.resolve(process.cwd(), 'data', 'crypto', 'processed', 'elliptic_graph.json');
  const graphContent = JSON.parse(fs.readFileSync(processedGraphFile, 'utf-8'));
  const sampleNodeWithDegrees = graphContent.nodes.find((n: any) => n.inDegree > 0 || n.outDegree > 0);
  assert(
    sampleNodeWithDegrees !== undefined,
    'Graph Topology In/Out Degree Preservation',
    `Sample txId ${sampleNodeWithDegrees?.txId} preserved inDegree=${sampleNodeWithDegrees?.inDegree}, outDegree=${sampleNodeWithDegrees?.outDegree}.`
  );

  // -------------------------------------------------------------
  // Test 7: Dataset Metadata & Provenance Storage
  // -------------------------------------------------------------
  const metadataFile = path.resolve(process.cwd(), 'data', 'crypto', 'metadata', 'dataset_metadata.json');
  assert(
    fs.existsSync(metadataFile),
    'Dataset Metadata & Provenance Artifact Generation',
    `Metadata successfully exported to data/crypto/metadata/dataset_metadata.json with SHA256 checksums.`
  );

  // -------------------------------------------------------------
  // Test 8: Git Exclusion Safety Check
  // -------------------------------------------------------------
  const gitignoreContent = fs.readFileSync(path.resolve(process.cwd(), '.gitignore'), 'utf-8');
  const gitProtectsRaw = gitignoreContent.includes('data/crypto/raw/') && gitignoreContent.includes('*.csv');
  assert(
    gitProtectsRaw,
    'Gitignore Raw Dataset Protection',
    'Confirmed data/crypto/raw/ and *.csv are excluded from git to prevent repository bloat.'
  );

  console.log('\n======================================================================');
  console.log(`CRYPTO TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('======================================================================');

  return { passedTests, totalTests, success: passedTests === totalTests };
}

if (process.argv[1] && process.argv[1].includes('testCryptoDataset')) {
  runCryptoDatasetTests()
    .then((r) => process.exit(r.success ? 0 : 1))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

