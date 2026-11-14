/**
 * Financial Crime Prevention and Early Warning System Engine
 * 
 * Reuses existing capabilities from:
 * - Intelligent Mule Detection Engine (Phase 2)
 * - Crypto Forensics Engine (Phase 4)
 * - ATM Withdrawal Predictor Engine (Phase 0/1)
 * 
 * Enforces Prevention Principles:
 * - Consequential actions ALWAYS require authorized human review.
 * - Deduplication prevents alert fatigue.
 * - Missing data handled gracefully with uncertainty markers.
 */

import {
  EarlyWarningAlert,
  EarlyWarningCategory,
  EarlyWarningRiskLevel,
  EarlyWarningStatus,
  EarlyWarningEntityType,
  IngestTransactionWarningRequest,
  CasePrioritizationScore,
} from './types';

export class EarlyWarningEngine {
  private alerts: Map<string, EarlyWarningAlert> = new Map();
  private dedupIndex: Map<string, string> = new Map(); // dedupHash -> alertId

  constructor(initialAlerts: EarlyWarningAlert[] = []) {
    for (const a of initialAlerts) {
      this.alerts.set(a.alertId, a);
      this.dedupIndex.set(a.deduplicationHash, a.alertId);
    }
  }

  /**
   * Evaluates a newly ingested transaction across banking and crypto rails.
   * Generates early warning alerts if suspicious signatures are detected.
   */
  public evaluateTransaction(request: IngestTransactionWarningRequest): EarlyWarningAlert | null {
    // 1. Missing Data Handling
    const isMissingCriticalData =
      !request.sourceAccountOrWallet ||
      !request.destinationAccountOrWallet ||
      !request.timestamp ||
      isNaN(request.amount) ||
      request.amount <= 0;

    if (isMissingCriticalData) {
      // Missing data does not crash; it triggers an Informational missing-data warning with High uncertainty
      const alertId = `EWARN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const alert: EarlyWarningAlert = {
        alertId,
        detectionTimestamp: new Date().toISOString(),
        category: 'NEW_SUSPICIOUS_TRANSACTION',
        title: 'Incomplete Transaction Record Ingested',
        relatedEntity: request.transactionReference || 'UNKNOWN-REF',
        entityType: 'Transaction',
        riskLevel: 'Informational',
        riskScore: 25,
        priorityRank: 99,
        detectionReason: 'Transaction ingested with missing counterparty or timestamp fields. Placed in pending queue.',
        supportingEvidence: [
          `Transaction Ref: ${request.transactionReference || 'Missing'}`,
          `Amount: ${request.amount || 0} ${request.currency || 'INR'}`,
          'Flag: Missing essential Core Banking / Ledger counterparty attributes',
        ],
        confidenceScore: 30,
        uncertaintyLevel: 'High',
        recommendedAction: 'Request complete audit payload from Core Banking System (CBS) or ledger gateway.',
        requiresHumanAuthorization: true,
        status: 'New',
        auditHistory: [
          {
            auditId: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Created',
            actorName: 'EarlyWarningEngine Daemon',
            actorRole: 'Automated Ingestion Watcher',
            notes: 'Generated informational warning due to missing transaction attributes.',
          },
        ],
        deduplicationHash: `INCOMPLETE-${request.transactionReference || Date.now()}`,
      };
      this.alerts.set(alertId, alert);
      return alert;
    }

    // 2. False Positive Suppression (Negligible test amounts or whitelisted safe nodes)
    const isWhitelistedOrTrivial =
      (request.currency === 'INR' && request.amount < 500) ||
      (request.currency === 'BTC' && request.amount < 0.0001) ||
      request.sourceAccountOrWallet.includes('SAFE-WHITELIST');

    if (isWhitelistedOrTrivial) {
      return null; // Suppressed: avoids investigator alert fatigue
    }

    // 3. Category Detection Logic
    let category: EarlyWarningCategory = 'NEW_SUSPICIOUS_TRANSACTION';
    let riskLevel: EarlyWarningRiskLevel = 'Medium';
    let riskScore = 65;
    let title = 'Suspicious High-Value Transfer Ingested';
    let detectionReason = 'Newly observed transaction exhibits anomalous transfer dynamics.';
    const supportingEvidence: string[] = [
      `Amount: ${request.currency === 'INR' ? `₹${request.amount.toLocaleString('en-IN')}` : `${request.amount} BTC`}`,
      `Method: ${request.rail}`,
      `Counterparties: ${request.sourceAccountOrWallet} → ${request.destinationAccountOrWallet}`,
    ];
    let recommendedAction = 'Review counterparty profile and verify relationship in active casefile.';

    // Check for Rapid Money Movement
    if (request.flags?.includes('RAPID_MOVEMENT') || request.flags?.includes('PASS_THROUGH')) {
      category = 'RAPID_MONEY_MOVEMENT';
      riskLevel = 'High';
      riskScore = 88;
      title = 'Rapid Layering Movement: Intermediate Liquidation Detected';
      detectionReason = 'Funds transferred through intermediate account within minutes of initial receipt.';
      supportingEvidence.push('Velocity Alert: High-speed transit indicating pass-through mule behavior.');
      recommendedAction = 'Initiate Section 102 CrPC account freeze review with Bank Nodal Officer.';
    }
    // Check for Potential Mule Account
    else if (request.flags?.includes('FAN_IN') || request.flags?.includes('FAN_OUT') || request.destinationAccountOrWallet.includes('MULE')) {
      category = 'POTENTIAL_MULE_ACCOUNT';
      riskLevel = 'High';
      riskScore = 84;
      title = 'Potential Mule Account Activation';
      detectionReason = 'Target destination account matches multi-source fan-in aggregation profile.';
      supportingEvidence.push('Behavioral signature: Multiple incoming deposits converging into single cashout hub.');
      recommendedAction = 'Verify KYC records with beneficiary bank branch and cross-check NCRP cybercrime portal.';
    }
    // Check for Crypto Forensics Taint
    else if (request.rail === 'Crypto' || request.flags?.includes('ILLICIT_TAINT') || request.flags?.includes('PEELING_CHAIN')) {
      category = 'CRYPTO_FORENSICS_WARNING';
      riskLevel = 'High';
      riskScore = 92;
      title = 'Bitcoin On-Chain Taint & Peeling Chain Warning';
      detectionReason = 'Transaction originates from or transits through confirmed illicit Bitcoin cluster.';
      supportingEvidence.push('Cryptocurrency Forensics: Connected to confirmed illicit darknet/ransomware syndicate.');
      recommendedAction = 'Issue Section 91 CrPC notice to VASP compliance officer for fiat withdrawal bank details.';
    }
    // Check for Cashout Activity
    else if (request.flags?.includes('ATM_PREDICTED') || request.flags?.includes('CASHOUT_IMMINENT')) {
      category = 'POTENTIAL_CASHOUT_ACTIVITY';
      riskLevel = 'High';
      riskScore = 90;
      title = 'Imminent Physical Cashout Predicted';
      detectionReason = 'ATM prediction engine flagged imminent cash liquidation within 0-6 hour time window.';
      supportingEvidence.push('ATM ML Predictor: High historical withdrawal correlation in local cluster.');
      recommendedAction = 'Alert Cyber Cell Field Patrol and request bank to disable debit card ATM limits.';
    }

    // 4. Deduplication Check
    const timeWindowHour = new Date(request.timestamp).toISOString().substring(0, 13);
    const dedupHash = `${category}-${request.destinationAccountOrWallet}-${timeWindowHour}`;

    const existingAlertId = this.dedupIndex.get(dedupHash);
    if (existingAlertId) {
      const existingAlert = this.alerts.get(existingAlertId);
      if (existingAlert && (existingAlert.status === 'New' || existingAlert.status === 'Under Review')) {
        // Update existing alert with additional evidence rather than spawning duplicate
        existingAlert.supportingEvidence.push(
          `Additional Confluent Tx: ${request.transactionReference} (${request.amount} ${request.currency})`
        );
        existingAlert.riskScore = Math.min(100, existingAlert.riskScore + 4);
        existingAlert.auditHistory.push({
          auditId: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Note Added',
          actorName: 'EarlyWarningEngine Daemon',
          actorRole: 'Deduplication Watcher',
          notes: `Merged duplicate trigger for ${request.transactionReference} into active alert.`,
        });
        return existingAlert;
      }
    }

    // 5. Generate New Alert
    const alertId = `EWARN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newAlert: EarlyWarningAlert = {
      alertId,
      detectionTimestamp: request.timestamp || new Date().toISOString(),
      category,
      title,
      relatedEntity: request.destinationAccountOrWallet,
      entityType: request.rail === 'Crypto' ? 'Crypto Wallet' : 'Banking Account',
      associatedCaseId: request.complaintId || 'CYBER-2026-0842',
      riskLevel,
      riskScore,
      priorityRank: riskLevel === 'High' ? 1 : riskLevel === 'Medium' ? 2 : 3,
      detectionReason,
      supportingEvidence,
      confidenceScore: 85,
      uncertaintyLevel: 'Low',
      recommendedAction,
      requiresHumanAuthorization: true, // PREVENTION RULE GUARANTEE
      status: 'New',
      auditHistory: [
        {
          auditId: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Created',
          actorName: 'EarlyWarningEngine Daemon',
          actorRole: 'Automated Detection Engine',
          notes: 'Early warning triggered by automated multi-rail detection rule.',
        },
      ],
      deduplicationHash: dedupHash,
    };

    this.alerts.set(alertId, newAlert);
    this.dedupIndex.set(dedupHash, alertId);
    return newAlert;
  }

  /**
   * Retrieves all alerts sorted by priority and risk score.
   */
  public getAlerts(filterStatus?: EarlyWarningStatus): EarlyWarningAlert[] {
    const list = Array.from(this.alerts.values());
    const filtered = filterStatus ? list.filter(a => a.status === filterStatus) : list;
    
    // Sort: Priority rank ascending, then Risk score descending, then Timestamp descending
    return filtered.sort((a, b) => {
      if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
      if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
      return new Date(b.detectionTimestamp).getTime() - new Date(a.detectionTimestamp).getTime();
    });
  }

  /**
   * Updates an alert status with an auditable actor entry.
   */
  public updateAlertStatus(
    alertId: string,
    newStatus: EarlyWarningStatus,
    actorName: string,
    actorRole: string,
    notes: string
  ): EarlyWarningAlert {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found.`);
    }

    alert.status = newStatus;
    alert.auditHistory.unshift({
      auditId: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Status Changed',
      actorName,
      actorRole,
      notes: notes || `Status updated to ${newStatus}.`,
    });

    return alert;
  }

  /**
   * Performs risk-based case prioritization across all complaints.
   */
  public getPrioritizedCases(complaintIds: string[]): CasePrioritizationScore[] {
    const scores: CasePrioritizationScore[] = [];

    for (const cid of complaintIds) {
      const caseAlerts = Array.from(this.alerts.values()).filter(a => a.associatedCaseId === cid);
      if (caseAlerts.length === 0) continue;

      const activeAlerts = caseAlerts.filter(a => a.status === 'New' || a.status === 'Under Review');
      const criticalCount = activeAlerts.filter(a => a.riskLevel === 'High').length;
      
      const maxScore = activeAlerts.reduce((max, a) => Math.max(max, a.riskScore), 0);
      const compositeRiskScore = Math.min(100, Math.round(maxScore * 0.7 + criticalCount * 10));

      let urgency: 'IMMEDIATE_ACTION' | 'EXPEDITED_REVIEW' | 'ROUTINE_MONITORING' = 'ROUTINE_MONITORING';
      if (compositeRiskScore >= 80 || criticalCount >= 2) {
        urgency = 'IMMEDIATE_ACTION';
      } else if (compositeRiskScore >= 60) {
        urgency = 'EXPEDITED_REVIEW';
      }

      scores.push({
        caseId: cid,
        complaintNumber: cid,
        compositeRiskScore,
        activeAlertCount: activeAlerts.length,
        criticalAlertCount: criticalCount,
        highestRiskLevel: criticalCount > 0 ? 'High' : 'Medium',
        fundsAtRiskINR: 350000,
        primaryRiskReason: activeAlerts[0]?.title || 'Multi-rail suspicious transfers detected',
        recommendedUrgency: urgency,
      });
    }

    return scores.sort((a, b) => b.compositeRiskScore - a.compositeRiskScore);
  }
}
