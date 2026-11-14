/**
 * Cryptocurrency Forensics Module - Domain Types & Schemas
 * Strictly maintains research dataset integrity and disclaims real-world identity attribution.
 */

export type CryptoClassification = 'illicit' | 'licit' | 'unknown';

export type CryptoTaintLevel = 'Critical Taint' | 'High Taint' | 'Moderate Taint' | 'Clean / Licit' | 'Unclassified';

export interface CryptoTransactionProfile {
  txId: string;
  timeStep: number; // 1 to 49
  classLabel: CryptoClassification;
  rawClass: string; // '1' | '2' | 'unknown'
  
  // Risk & Taint Analytics
  riskScore: number; // 0 - 100 calibrated risk
  taintScore: number; // 0 - 100 proximity to illicit anchors
  taintLevel: CryptoTaintLevel;
  hopsToNearestIllicit: number; // 0 = self is illicit, 1 = direct neighbor, 2 = 2-hops away, etc.
  
  // Graph Structural Attributes
  inDegree: number;
  outDegree: number;
  totalDegree: number;
  volumeBtcProxy: number;
  feeBtcProxy: number;
  
  // Behavioral Archetypes
  isPeelingChain: boolean;
  isConsolidation: boolean;
  isDispersion: boolean;
  
  // Explainable Forensics
  explainableFindings: string[];
  investigativeRecommendations: string[];
  
  // Graph Adjacency
  predecessorTxIds: string[]; // incoming inputs
  successorTxIds: string[];   // outgoing outputs
  
  provenance: {
    dataset: 'Elliptic Bitcoin Transaction Dataset';
    source: 'Kaggle (ellipticco/elliptic-data-set)';
    isResearchData: true;
    analyzedAt: string;
  };
}

export interface CryptoPathwayHop {
  hopNumber: number;
  fromTxId: string;
  toTxId: string;
  sourceClass: CryptoClassification;
  targetClass: CryptoClassification;
  flowVolumeProxy: number;
  timeStep: number;
}

export interface CryptoPathwayResult {
  sourceTxId: string;
  targetTxId: string;
  pathFound: boolean;
  hopsCount: number;
  pathTxIds: string[];
  hops: CryptoPathwayHop[];
  accumulatedRiskScore: number;
  pathSummary: string;
}

export interface CryptoCluster {
  clusterId: string;
  clusterName: string;
  illicitNodesCount: number;
  totalNodesCount: number;
  timeStep: number;
  centralHubTxId: string;
  totalVolumeProxy: number;
  nodes: string[];
}

export interface ModelBenchmarkMetrics {
  model_name: string;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  pr_auc: number;
  confusion_matrix: {
    true_positives: number;
    false_positives: number;
    true_negatives: number;
    false_negatives: number;
    total_tested: number;
  };
}

export interface CryptoForensicsOverview {
  totalTransactions: number;
  illicitCount: number;
  licitCount: number;
  unknownCount: number;
  timeStepsCount: number;
  totalEdges: number;
  activeClustersCount: number;
  topIllicitTransactions: CryptoTransactionProfile[];
  topClusters: CryptoCluster[];
  benchmark: {
    models: ModelBenchmarkMetrics[];
    evaluationProtocol: string;
    leakageProtection: string;
    scientificDisclaimer: string;
  };
}

