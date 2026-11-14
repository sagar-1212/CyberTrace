/**
 * Cross-Rail Financial Pathway Reconstruction Engine
 * 
 * Enforces strict architectural separation:
 * 1. Banking entities and transactions are kept isolated from Crypto entities and transactions.
 * 2. Mandatory Evidence Rule: Reject cross-rail connections based merely on amount similarity,
 *    temporal proximity, co-occurrence in complaint, or pattern resemblance.
 * 3. Formalizes relationship classifications: Confirmed, Probable, Inferred, Unverified, Unknown.
 * 4. Models incomplete transaction pathways and law enforcement evidentiary gaps.
 */

import {
  BankingAccountEntity,
  CryptoWalletEntity,
  BankingTransactionRecord,
  CryptoTransactionRecord,
  CrossRailBridgeLink,
  IncompletePathwaySegment,
  UnifiedTimelineEvent,
  CrossRailPathwayCase,
  RelationshipClassification,
  EvidenceType,
  VerificationStatus,
} from './types';

export interface EvaluateBridgeRequest {
  caseId: string;
  bankingAccountId: string;
  cryptoWalletId: string;
  evidenceType: EvidenceType;
  evidenceReference?: string;
  fiatAmountINR?: number;
  cryptoAmountBTC?: number;
  fiatTimestamp?: string;
  cryptoTimestamp?: string;
  evidentiaryDocumentNotes?: string;
  relyingSolelyOnHeuristics?: boolean;
}

export class CrossRailEngine {
  /**
   * Evaluates a proposed bridge between a bank account and a crypto wallet.
   * Strictly enforces the EVIDENCE RULE.
   */
  public static evaluateBridge(
    request: EvaluateBridgeRequest,
    bankingAccount?: BankingAccountEntity,
    cryptoWallet?: CryptoWalletEntity
  ): CrossRailBridgeLink {
    const bridgeId = `BRIDGE-${request.bankingAccountId}-${request.cryptoWalletId}`;
    
    // Check if the link relies solely on heuristics (amounts, timestamps, similarity, co-occurrence)
    const isHeuristicOnly = 
      request.relyingSolelyOnHeuristics === true ||
      request.evidenceType === 'No Supporting Evidence' ||
      !request.evidenceReference ||
      request.evidenceReference.trim() === '';

    if (isHeuristicOnly) {
      // VIOLATION OF EVIDENCE RULE: Must not connect merely on heuristics
      return {
        bridgeId,
        caseId: request.caseId,
        fromBankingAccountId: request.bankingAccountId,
        toCryptoWalletId: request.cryptoWalletId,
        classification: 'Unknown',
        evidenceType: 'No Supporting Evidence',
        evidenceReference: 'NONE',
        verificationStatus: 'No Supporting Evidence',
        confidenceScore: 0,
        isEvidenceSufficient: false,
        insufficientReason:
          'EVIDENCE RULE ENFORCED: Banking account and crypto wallet cannot be linked merely because amounts are similar, timestamps are close, or transaction patterns resemble each other. Formal documentary or cryptographic proof is required.',
        evidentiaryNotes:
          request.evidentiaryDocumentNotes ||
          'Unverified hypothesis. No subpoenaed VASP records, bank deposit memos, or device telemetry found.',
        fiatDepositAmountINR: request.fiatAmountINR || 0,
        cryptoSettledAmountBTC: request.cryptoAmountBTC || 0,
        conversionTimestamp: request.cryptoTimestamp || new Date().toISOString(),
      };
    }

    // Determine classification based on verifiable evidence types
    let classification: RelationshipClassification = 'Unverified';
    let verificationStatus: VerificationStatus = 'Under VASP Nodal Review';
    let confidenceScore = 15;
    let isEvidenceSufficient = false;

    switch (request.evidenceType) {
      case 'Subpoenaed VASP Record':
      case 'Court-Ordered Seizure Log':
        classification = 'Confirmed';
        verificationStatus = 'Verified by Law Enforcement';
        confidenceScore = 98;
        isEvidenceSufficient = true;
        break;

      case 'Bank UTR Memo Match':
      case 'Section 91 CrPC Summons Response':
        classification = 'Confirmed';
        verificationStatus = 'Verified by Law Enforcement';
        confidenceScore = 92;
        isEvidenceSufficient = true;
        break;

      case 'IP & Device Telemetry':
        classification = 'Probable';
        verificationStatus = 'Verified by Law Enforcement';
        confidenceScore = 80;
        isEvidenceSufficient = true;
        break;

      case 'Complainant Assertion':
        classification = 'Unverified';
        verificationStatus = 'Unverified / Disputed';
        confidenceScore = 35;
        isEvidenceSufficient = false;
        break;

      default:
        classification = 'Inferred';
        verificationStatus = 'Under VASP Nodal Review';
        confidenceScore = 50;
        isEvidenceSufficient = false;
        break;
    }

    return {
      bridgeId,
      caseId: request.caseId,
      fromBankingAccountId: request.bankingAccountId,
      toCryptoWalletId: request.cryptoWalletId,
      classification,
      evidenceType: request.evidenceType,
      evidenceReference: request.evidenceReference || 'UNSPECIFIED-REF',
      verificationStatus,
      confidenceScore,
      isEvidenceSufficient,
      insufficientReason: isEvidenceSufficient ? undefined : 'Evidence provides circumstantial indicator but requires VASP nodal verification.',
      evidentiaryNotes: request.evidentiaryDocumentNotes || `Evidence filed under reference ${request.evidenceReference}.`,
      exchangeOrVaspName: cryptoWallet?.knownEntityTag || 'Regulated Virtual Asset Service Provider (VASP)',
      fiatDepositAmountINR: request.fiatAmountINR || 0,
      cryptoSettledAmountBTC: request.cryptoAmountBTC || 0,
      conversionTimestamp: request.cryptoTimestamp || request.fiatTimestamp || new Date().toISOString(),
    };
  }

  /**
   * Generates a unified investigation timeline blending banking and crypto records.
   */
  public static buildUnifiedTimeline(
    bankingTransactions: BankingTransactionRecord[],
    cryptoTransactions: CryptoTransactionRecord[],
    bridges: CrossRailBridgeLink[]
  ): UnifiedTimelineEvent[] {
    const events: UnifiedTimelineEvent[] = [];

    // 1. Add Banking Transactions
    for (const bTx of bankingTransactions) {
      events.push({
        eventId: `TIMELINE-BANK-${bTx.transactionId}`,
        timestamp: bTx.timestamp,
        railType: 'Banking',
        eventTitle: `Banking Transfer (${bTx.method}): ${bTx.senderAccountId} → ${bTx.receiverAccountId}`,
        description: `${bTx.narrativeDescription} | Ref: ${bTx.transactionReference}`,
        sourceSystem: 'Core Banking System (CBS) / NPCI',
        evidenceReference: bTx.transactionReference,
        amountFormatted: `₹${bTx.amountINR.toLocaleString('en-IN')}`,
        confidence: 'Confirmed',
        isFlaggedOrSuspicious: bTx.status === 'Flagged' || bTx.status === 'Frozen',
        associatedEntities: [bTx.senderAccountId, bTx.receiverAccountId],
      });
    }

    // 2. Add Cross-Rail Bridge On-Ramp / Off-Ramp Events
    for (const bridge of bridges) {
      events.push({
        eventId: `TIMELINE-BRIDGE-${bridge.bridgeId}`,
        timestamp: bridge.conversionTimestamp,
        railType: 'Cross-Rail Bridge',
        eventTitle: `Cross-Rail Gateway: Bank Account ${bridge.fromBankingAccountId} ⇄ Crypto Wallet ${bridge.toCryptoWalletId}`,
        description: `Gateway: ${bridge.exchangeOrVaspName || 'VASP'} | Evidence: ${bridge.evidenceType} (${bridge.evidenceReference}) | Status: ${bridge.verificationStatus}`,
        sourceSystem: bridge.exchangeOrVaspName || 'VASP Fiat On-Ramp Gateway',
        evidenceReference: bridge.evidenceReference,
        amountFormatted: `₹${bridge.fiatDepositAmountINR.toLocaleString('en-IN')} ⇄ ${bridge.cryptoSettledAmountBTC} BTC`,
        confidence: bridge.classification,
        isFlaggedOrSuspicious: bridge.classification === 'Unknown' || bridge.classification === 'Unverified' || !bridge.isEvidenceSufficient,
        associatedEntities: [bridge.fromBankingAccountId, bridge.toCryptoWalletId],
      });
    }

    // 3. Add Crypto Blockchain Transactions
    for (const cTx of cryptoTransactions) {
      events.push({
        eventId: `TIMELINE-CRYPTO-${cTx.txHash}`,
        timestamp: cTx.timestamp,
        railType: 'Crypto',
        eventTitle: `Blockchain Transfer: ${cTx.sourceAddressOrTxId} → ${cTx.destinationAddressOrTxId}`,
        description: `On-chain transfer of ${cTx.amountBTC} BTC (approx ₹${cTx.approxValueINR.toLocaleString('en-IN')}) | Class: ${cTx.classLabel.toUpperCase()}`,
        sourceSystem: 'Bitcoin Public Ledger',
        evidenceReference: cTx.txHash,
        amountFormatted: `${cTx.amountBTC} BTC (₹${cTx.approxValueINR.toLocaleString('en-IN')})`,
        confidence: 'Confirmed',
        isFlaggedOrSuspicious: cTx.classLabel === 'illicit',
        associatedEntities: [cTx.sourceAddressOrTxId, cTx.destinationAddressOrTxId],
      });
    }

    // Sort chronologically ascending
    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Detects broken pathways, missing links, and un-subpoenaed conduits.
   */
  public static detectIncompletePathways(
    bankingAccounts: BankingAccountEntity[],
    cryptoWallets: CryptoWalletEntity[],
    bankingTransactions: BankingTransactionRecord[],
    cryptoTransactions: CryptoTransactionRecord[],
    bridges: CrossRailBridgeLink[]
  ): IncompletePathwaySegment[] {
    const gaps: IncompletePathwaySegment[] = [];

    // Check for banking mule outflow that terminates at an exchange without a confirmed bridge
    const exchangeEscrowAccounts = bankingAccounts.filter(a => a.accountType === 'Exchange Escrow' || a.holderName.toLowerCase().includes('escrow') || a.holderName.toLowerCase().includes('vasp'));
    
    for (const escrow of exchangeEscrowAccounts) {
      const hasConfirmedBridge = bridges.some(b => b.fromBankingAccountId === escrow.accountId && b.classification === 'Confirmed');
      if (!hasConfirmedBridge) {
        gaps.push({
          gapId: `GAP-BANK-${escrow.accountId}`,
          gapType: 'Missing VASP Subpoena',
          lastKnownEntityId: escrow.accountId,
          lastKnownRail: 'Banking',
          missingEvidenceDescription: `Funds entered VASP deposit account (${escrow.holderName} - ${escrow.accountReference}), but no Section 91 CrPC response or subpoenaed internal VASP ledger links it to a specific crypto wallet ID.`,
          status: 'Pending Law Enforcement Subpoena',
          recommendedAction: 'Serve Section 91 CrPC notice on VASP Nodal Officer requesting customer KYC, internal deposit logs, and beneficiary wallet hash.',
          estimatedFundsAtRiskINR: escrow.totalInflowINR,
        });
      }
    }

    // Check for crypto transactions that hop into darknet entities or unverified mixers
    for (const cTx of cryptoTransactions) {
      if (cTx.destinationAddressOrTxId.includes('darknet') || cTx.classLabel === 'illicit') {
        const hasSubsequentHop = cryptoTransactions.some(t => t.sourceAddressOrTxId === cTx.destinationAddressOrTxId);
        if (!hasSubsequentHop) {
          gaps.push({
            gapId: `GAP-CRYPTO-${cTx.txHash}`,
            gapType: 'Off-Ramp Blindspot',
            lastKnownEntityId: cTx.destinationAddressOrTxId,
            lastKnownRail: 'Crypto',
            missingEvidenceDescription: `UTXO split terminates in darknet cluster / unhosted address (${cTx.destinationAddressOrTxId}). No outbound broadcast or off-chain exchange cashout registered.`,
            status: 'Broken Pathway',
            recommendedAction: 'Tag UTXO cluster in blockchain intelligence watcher. Monitor mempool for subsequent consolidation to regulated VASP deposit addresses.',
            estimatedFundsAtRiskINR: cTx.approxValueINR,
          });
        }
      }
    }

    return gaps;
  }
}
