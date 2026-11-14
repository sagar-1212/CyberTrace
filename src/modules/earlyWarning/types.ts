/**
 * Financial Crime Prevention and Early Warning System - Domain Types
 * 
 * Strict Prevention Principles:
 * 1. Consequential actions (freezes, blocks, dispatch) ALWAYS require authorized human review.
 * 2. Automated early warnings alert investigators but do NOT auto-execute legal freezes.
 * 3. Incorporates multi-rail intelligence: Core Banking, Mule Networks, Crypto Taint, and ATM Cashout Predictions.
 */

export type EarlyWarningCategory =
  | 'NEW_SUSPICIOUS_TRANSACTION'
  | 'POTENTIAL_MULE_ACCOUNT'
  | 'SUSPICIOUS_NETWORK'
  | 'RAPID_MONEY_MOVEMENT'
  | 'CRYPTO_FORENSICS_WARNING'
  | 'SUSPICIOUS_CONNECTED_NETWORK'
  | 'POTENTIAL_CASHOUT_ACTIVITY';

export type EarlyWarningRiskLevel = 'High' | 'Medium' | 'Low' | 'Informational';

export type EarlyWarningStatus =
  | 'New'
  | 'Acknowledged'
  | 'Under Review'
  | 'Resolved'
  | 'Dismissed';

export type EarlyWarningEntityType =
  | 'Banking Account'
  | 'Crypto Wallet'
  | 'Transaction'
  | 'Mule Network'
  | 'ATM Cashout Kiosk';

export interface AlertAuditEntry {
  auditId: string;
  timestamp: string;
  action: 'Created' | 'Acknowledged' | 'Status Changed' | 'Note Added' | 'Investigator Assigned' | 'Dismissed';
  actorName: string;
  actorRole: string;
  notes: string;
}

export interface EarlyWarningAlert {
  alertId: string;
  detectionTimestamp: string;
  category: EarlyWarningCategory;
  title: string;
  
  // Entity Reference
  relatedEntity: string;
  entityType: EarlyWarningEntityType;
  associatedCaseId?: string;
  complaintNumber?: string;
  
  // Risk & Prioritization
  riskLevel: EarlyWarningRiskLevel;
  riskScore: number; // 0 to 100
  priorityRank: number; // 1 = highest urgency
  
  // Explainability & Evidence
  detectionReason: string;
  supportingEvidence: string[];
  confidenceScore: number; // 0 to 100
  uncertaintyLevel: 'Low' | 'Medium' | 'High';
  
  // Prevention & Actionable Next Steps
  recommendedAction: string;
  requiresHumanAuthorization: true; // Hard-coded prevention guardrail
  
  // Lifecycle
  status: EarlyWarningStatus;
  assignedOfficer?: string;
  auditHistory: AlertAuditEntry[];
  
  // Deduplication Fingerprint
  deduplicationHash: string;
}

export interface IngestTransactionWarningRequest {
  transactionReference: string;
  sourceAccountOrWallet: string;
  destinationAccountOrWallet: string;
  amount: number;
  currency: 'INR' | 'BTC';
  timestamp: string;
  rail: 'Banking' | 'Crypto';
  flags?: string[];
  complaintId?: string;
}

export interface CasePrioritizationScore {
  caseId: string;
  complaintNumber: string;
  compositeRiskScore: number; // 0 - 100
  activeAlertCount: number;
  criticalAlertCount: number;
  highestRiskLevel: EarlyWarningRiskLevel;
  fundsAtRiskINR: number;
  primaryRiskReason: string;
  recommendedUrgency: 'IMMEDIATE_ACTION' | 'EXPEDITED_REVIEW' | 'ROUTINE_MONITORING';
}
