/**
 * Elliptic Bitcoin Transaction Dataset — Domain Types & Schemas
 * Strictly preserves research dataset semantics and keeps crypto separate from banking entities.
 */

export type EllipticRawClass = '1' | '2' | 'unknown';

export type EllipticNormalizedClass = 'illicit' | 'licit' | 'unknown';

export interface CryptoTransactionNode {
  txId: string;
  timeStep: number; // 1 to 49 (roughly two-week intervals)
  classLabel: EllipticNormalizedClass;
  rawClass: EllipticRawClass;
  
  // Graph topology
  inDegree: number;
  outDegree: number;
  
  // Categorical flags
  isIllicit: boolean;
  isLicit: boolean;
  isUnknown: boolean;
  
  // Baseline Risk Score (Research categorization, not real-world criminal conviction)
  heuristicRiskScore: number; // 0 - 100
  
  // Numerical Feature vectors (165 features excluding txId and time_step)
  localFeaturesSummary?: {
    feeProxy?: number;
    inflowProxy?: number;
    outflowProxy?: number;
    featureVectorSample: number[];
  };
  
  provenance: {
    dataset: 'Elliptic Bitcoin Transaction Dataset';
    source: 'Kaggle (ellipticco/elliptic-data-set)';
    isResearchData: true;
    verifiedAt: string;
  };
}

export interface CryptoTransactionEdge {
  sourceTxId: string; // txId1
  targetTxId: string; // txId2
  timeStep?: number;
}

export interface CryptoDatasetMetadata {
  datasetName: string;
  version: string;
  sourceUrl: string;
  paperCitation: string;
  isResearchDataset: true;
  totalTransactions: number;
  totalEdges: number;
  classDistribution: {
    illicit: number;
    licit: number;
    unknown: number;
    illicitPercentage: string;
    licitPercentage: string;
    unknownPercentage: string;
  };
  timeStepRange: {
    min: number;
    max: number;
    totalTimeSteps: number;
  };
  featureDimensions: {
    totalColumns: number;
    localFeatures: number;
    aggregatedFeatures: number;
  };
  fileChecksums: Record<string, string>;
  importedAt: string;
  provenance: string;
  license: string;
  complianceNotice: string;
}

export interface CryptoValidationReport {
  isValid: boolean;
  checkedAt: string;
  filesChecked: {
    fileName: string;
    exists: boolean;
    sizeBytes: number;
    lineCount: number;
    path: string;
  }[];
  headerValidations: {
    fileName: string;
    expectedHeader: string;
    actualHeader: string;
    matches: boolean;
  }[];
  columnValidations: {
    fileName: string;
    expectedColumns: number;
    actualColumns: number;
    matches: boolean;
  }[];
  integrityMetrics: {
    totalNodes: number;
    totalEdges: number;
    danglingEdgesCount: number;
    invalidClassesCount: number;
    nullOrNanFeaturesCount: number;
  };
  errors: string[];
  warnings: string[];
  executionDurationMs: number;
}

