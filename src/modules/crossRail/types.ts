/**
 * Cross-Rail Financial Pathway Reconstruction - Domain Types
 * 
 * Strict Architectural Separation:
 * 1. Banking entities and transactions are kept isolated from Crypto entities and transactions.
 * 2. Cross-rail relationships require explicit documentary or cryptographic evidence.
 * 3. Never connects a bank account and crypto wallet on similarity alone.
 */

export type RailType = 'Banking' | 'Crypto' | 'Cross-Rail Bridge';

export type RelationshipClassification =
  | 'Confirmed'
  | 'Probable'
  | 'Inferred'
  | 'Unverified'
  | 'Unknown';

export type EvidenceType =
  | 'Subpoenaed VASP Record'
  | 'Bank UTR Memo Match'
  | 'Section 91 CrPC Summons Response'
  | 'IP & Device Telemetry'
  | 'Court-Ordered Seizure Log'
  | 'Complainant Assertion'
  | 'No Supporting Evidence';

export type VerificationStatus =
  | 'Verified by Law Enforcement'
  | 'Under VASP Nodal Review'
  | 'Unverified / Disputed'
  | 'No Supporting Evidence';

export type PathwayGapType =
  | 'Off-Ramp Blindspot'
  | 'Missing VASP Subpoena'
  | 'Unidentified P2P Escrow'
  | 'Cross-Chain Bridge Break'
  | 'Unconfirmed Beneficiary';

// Separate Banking Account Entity
export interface BankingAccountEntity {
  accountId: string;
  accountReference: string;
  holderName: string;
  bankName: string;
  accountType: 'Victim Account' | 'Mule Candidate' | 'Beneficiary' | 'Exchange Escrow';
  kycStatus: 'Verified' | 'Unverified / Forged' | 'Flagged';
  branchCity: string;
  totalInflowINR: number;
  totalOutflowINR: number;
}

// Separate Crypto Wallet / Cluster Entity
export interface CryptoWalletEntity {
  walletId: string;
  addressOrClusterId: string;
  blockchain: 'Bitcoin' | 'Ethereum' | 'Tron' | 'Monero (Untraceable)';
  clusterLabel: 'VASP / Exchange Deposit' | 'Darknet Entity' | 'P2P Trader' | 'Unknown Private Wallet';
  knownEntityTag?: string; // e.g. "WazirX Hot Wallet", "Binance Deposit Hub"
  inDegree: number;
  outDegree: number;
  estimatedVolumeBtc: number;
  researchDatasetId?: string; // Link to Elliptic transaction id if applicable
}

// Separate Banking Transaction Record
export interface BankingTransactionRecord {
  transactionId: string;
  transactionReference: string; // e.g. UTR / IMPS ref
  senderAccountId: string;
  receiverAccountId: string;
  amountINR: number;
  timestamp: string;
  method: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'Card / POS';
  status: 'Completed' | 'Pending' | 'Flagged' | 'Frozen';
  narrativeDescription: string;
}

// Separate Crypto Blockchain Transaction Record
export interface CryptoTransactionRecord {
  txHash: string;
  sourceAddressOrTxId: string;
  destinationAddressOrTxId: string;
  amountBTC: number;
  approxValueINR: number;
  timestamp: string;
  timeStep?: number;
  blockHeight?: number;
  classLabel: 'illicit' | 'licit' | 'unknown';
  miningFeeBTC: number;
  status: 'Confirmed On-Chain' | 'Unconfirmed' | 'Orphaned';
}

// Cross-Rail Connection with Evidentiary Proof
export interface CrossRailBridgeLink {
  bridgeId: string;
  caseId: string;
  fromBankingAccountId: string;
  toCryptoWalletId: string;
  
  // Strict Relationship Classification
  classification: RelationshipClassification;
  
  // Mandatory Evidence Structure
  evidenceType: EvidenceType;
  evidenceReference: string;
  verificationStatus: VerificationStatus;
  confidenceScore: number; // 0 to 100
  
  // Auditable Legal & Technical Justifications
  evidentiaryNotes: string;
  isEvidenceSufficient: boolean; // false if connected on heuristics alone
  insufficientReason?: string;
  
  // Gateway Context
  exchangeOrVaspName?: string;
  fiatDepositAmountINR: number;
  cryptoSettledAmountBTC: number;
  conversionTimestamp: string;
}

// Incomplete Pathway Gap Representation
export interface IncompletePathwaySegment {
  gapId: string;
  gapType: PathwayGapType;
  lastKnownEntityId: string;
  lastKnownRail: 'Banking' | 'Crypto';
  missingEvidenceDescription: string;
  status: 'Broken Pathway' | 'Pending Law Enforcement Subpoena' | 'Dead End';
  recommendedAction: string;
  estimatedFundsAtRiskINR: number;
}

// Unified Investigation Timeline Event
export interface UnifiedTimelineEvent {
  eventId: string;
  timestamp: string;
  railType: RailType;
  eventTitle: string;
  description: string;
  sourceSystem: string;
  evidenceReference?: string;
  amountFormatted: string;
  confidence: RelationshipClassification;
  isFlaggedOrSuspicious: boolean;
  associatedEntities: string[];
}

// Cross-Rail Investigation Pathway Case
export interface CrossRailPathwayCase {
  caseId: string;
  caseTitle: string;
  complaintNumber: string;
  victimReference: string;
  investigatorBadge: string;
  createdAt: string;
  
  // Isolated Domain Records
  bankingAccounts: BankingAccountEntity[];
  cryptoWallets: CryptoWalletEntity[];
  bankingTransactions: BankingTransactionRecord[];
  cryptoTransactions: CryptoTransactionRecord[];
  
  // Verified & Unverified Cross-Rail Bridges
  bridges: CrossRailBridgeLink[];
  
  // Incomplete / Broken Pathway Segments
  incompleteSegments: IncompletePathwaySegment[];
  
  // Common Timeline
  timeline: UnifiedTimelineEvent[];
  
  // Summary Analytics
  totalBankingFlowINR: number;
  totalCryptoFlowBTC: number;
  totalCrossRailBridgedINR: number;
  untracedGapAmountINR: number;
}
