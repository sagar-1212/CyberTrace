import { AccountRiskStatus, TransactionType } from '../../types';

export type MulePatternType =
  | 'fan_in'
  | 'fan_out'
  | 'rapid_movement'
  | 'multi_transfer'
  | 'fragmentation_structuring'
  | 'circular_roundtrip'
  | 'layered_transit'
  | 'velocity_spike'
  | 'shared_counterparty'
  | 'syndicate_cluster';

export type MuleRiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Benign';

export type MuleArchetype =
  | 'Pass-Through Transit Mule'
  | 'Dispersion / Fan-Out Hub'
  | 'Aggregation / Cashout Hub'
  | 'Circular Layering Node'
  | 'Legitimate / High-Volume Entity';

export type MuleVerificationStatus =
  | 'Algorithmic Suspicion (Unconfirmed)'
  | 'Under Investigator Review'
  | 'Confirmed Mule Syndicate'
  | 'Cleared / False Positive'
  | 'Section 91 Frozen';

export interface DetectedPattern {
  id: string;
  patternType: MulePatternType;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidenceScore: number; // 0 - 100
  description: string;
  evidence: {
    transactionIds: string[];
    accountRefs: string[];
    timeSpanMinutes?: number;
    amountInvolved: number;
    metrics: Record<string, number | string>;
  };
}

export interface MuleRiskFactor {
  name: string;
  category: 'Velocity' | 'Topology' | 'Behavioral' | 'Entity Discrepancy';
  score: number; // 0 - 100
  weight: number; // percentage (e.g., 0.20)
  weightedScore: number;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
}

export interface ConnectedAccountSummary {
  accountId: string;
  accountReference: string;
  holderName: string;
  bankName: string;
  relationshipType: 'Incoming Source' | 'Outgoing Recipient' | 'Circular Counterparty' | 'Mutual Intermediary';
  totalTransferred: number;
  transactionCount: number;
  firstInteraction: string;
  lastInteraction: string;
  riskScore: number;
  riskStatus: AccountRiskStatus;
}

export interface MoneyMovementHop {
  hopNumber: number;
  senderAccountId: string;
  senderName: string;
  receiverAccountId: string;
  receiverName: string;
  amount: number;
  timestamp: string;
  transactionType: TransactionType;
  transitDelayMinutes: number;
  transactionRef: string;
}

export interface SuspiciousAccountProfile {
  accountId: string;
  accountReference: string;
  holderName: string;
  bankName: string;
  branch: string;
  city: string;
  accountType: string;
  kycStatus: string;
  openedDate: string;
  
  // Scoring & Classification
  overallRiskScore: number; // 0 - 100
  riskLevel: MuleRiskLevel;
  primaryArchetype: MuleArchetype;
  verificationStatus: MuleVerificationStatus;
  isConfirmedCriminal: boolean; // strictly false by default per security guideline
  
  // Velocity & Flow Metrics
  totalInflow: number;
  totalOutflow: number;
  turnoverRatio: number; // Outflow / Inflow
  netRetentionRatio: number;
  averageHoldingTimeMinutes: number;
  peakVelocityTxnsPerHour: number;
  
  // Topology Metrics
  inDegree: number; // unique incoming senders
  outDegree: number; // unique outgoing receivers
  totalConnectedAccounts: number;
  layerIndex: number;
  hopsFromVictim: number;
  
  // Detected Patterns & Explanations
  detectedPatterns: DetectedPattern[];
  riskFactors: MuleRiskFactor[];
  explainableReasons: string[];
  investigativeRecommendations: string[];
  
  // Relations & Evidence
  connectedAccounts: ConnectedAccountSummary[];
  suspiciousTransactions: Array<{
    id: string;
    transactionReference: string;
    amount: number;
    timestamp: string;
    direction: 'INFLOW' | 'OUTFLOW';
    counterpartyName: string;
    counterpartyRef: string;
    flagReason: string;
  }>;
  movementPaths: MoneyMovementHop[][];
  
  // Audit trail for this account
  lastAnalyzedAt: string;
  actionTakenNotes?: string[];
}

export interface MuleSyndicateCluster {
  clusterId: string;
  clusterName: string;
  primaryZone: string;
  totalAccountsCount: number;
  totalMuleAccountsCount: number;
  totalVolumeINR: number;
  centralHubAccountId: string;
  centralHubAccountName: string;
  identifiedPatterns: MulePatternType[];
  averageRiskScore: number;
  involvedAccountIds: string[];
}

export interface MuleDetectionSummary {
  totalAnalyzedAccounts: number;
  criticalMuleCount: number;
  highRiskMuleCount: number;
  suspiciousCount: number;
  clearedLegitimateCount: number;
  totalFlaggedVolumeINR: number;
  topDetectedPatterns: { patternType: MulePatternType; count: number; label: string }[];
  syndicateClusters: MuleSyndicateCluster[];
}

