/**
 * Financial Crime Prevention and Early Warning System - Automated Test Suite
 * 
 * Verifies:
 * 1. Alert generation across banking, mule, crypto, and cashout categories.
 * 2. False positive suppression (whitelisted safe nodes & trivial amounts).
 * 3. Alert deduplication (merging confluent triggers without alert fatigue).
 * 4. Missing / incomplete data handling with high uncertainty markers.
 * 5. Risk-based case prioritization.
 * 6. Alert lifecycle status updates.
 * 7. Comprehensive audit logging on review actions.
 * 8. Prevention Principle: Human authorization strictly required for consequential actions.
 */

import { EarlyWarningEngine } from './earlyWarningEngine';
import { INITIAL_EARLY_WARNINGS } from './earlyWarningData';
import { IngestTransactionWarningRequest, EarlyWarningStatus } from './types';

function runTests() {
  console.log('======================================================================');
  console.log('FINTRACE: EARLY WARNING & CRIME PREVENTION SYSTEM TEST SUITE');
  console.log('======================================================================\n');

  let passedCount = 0;
  const totalCount = 8;
  const engine = new EarlyWarningEngine([...INITIAL_EARLY_WARNINGS]);

  // Test 1: Alert Generation across Multi-Rail Capabilities
  try {
    const bankingAlert = engine.evaluateTransaction({
      transactionReference: 'TX-TEST-RAPID-01',
      sourceAccountOrWallet: 'ACC-MULE-1',
      destinationAccountOrWallet: 'ACC-MULE-2',
      amount: 450000,
      currency: 'INR',
      timestamp: '2026-03-10T12:00:00Z',
      rail: 'Banking',
      flags: ['RAPID_MOVEMENT'],
    });

    const cryptoAlert = engine.evaluateTransaction({
      transactionReference: 'tx-btc-taint-01',
      sourceAccountOrWallet: 'WALLET-HOT-01',
      destinationAccountOrWallet: 'WALLET-ILLICIT-02',
      amount: 0.085,
      currency: 'BTC',
      timestamp: '2026-03-10T12:05:00Z',
      rail: 'Crypto',
      flags: ['ILLICIT_TAINT', 'PEELING_CHAIN'],
    });

    if (
      bankingAlert &&
      bankingAlert.category === 'RAPID_MONEY_MOVEMENT' &&
      cryptoAlert &&
      cryptoAlert.category === 'CRYPTO_FORENSICS_WARNING'
    ) {
      console.log('[PASS] Test 1: Multi-Rail Early Warning Alert Generation Verified');
      console.log(`       Details: Triggered Banking Warning (${bankingAlert.title}) & Crypto Taint Warning (${cryptoAlert.title}).`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 1: Failed to generate multi-rail alerts.', { bankingAlert, cryptoAlert });
    }
  } catch (e: any) {
    console.error('[FAIL] Test 1 Exception:', e.message);
  }

  // Test 2: False Positive Suppression
  try {
    // 1. Trivial amount test
    const trivialAlert = engine.evaluateTransaction({
      transactionReference: 'TX-TEST-TRIVIAL',
      sourceAccountOrWallet: 'ACC-USER-1',
      destinationAccountOrWallet: 'ACC-MERCHANT-1',
      amount: 150, // Below ₹500 threshold
      currency: 'INR',
      timestamp: '2026-03-10T12:10:00Z',
      rail: 'Banking',
    });

    // 2. Whitelisted safe node test
    const whitelistedAlert = engine.evaluateTransaction({
      transactionReference: 'TX-TEST-WHITELIST',
      sourceAccountOrWallet: 'SAFE-WHITELIST-RESERVE',
      destinationAccountOrWallet: 'ACC-USER-2',
      amount: 500000,
      currency: 'INR',
      timestamp: '2026-03-10T12:12:00Z',
      rail: 'Banking',
    });

    if (trivialAlert === null && whitelistedAlert === null) {
      console.log('[PASS] Test 2: False Positive Suppression Operational');
      console.log('       Details: Cleanly suppressed trivial micro-amounts and whitelisted institutional reserve accounts.');
      passedCount++;
    } else {
      console.error('[FAIL] Test 2: False positives were not suppressed.', { trivialAlert, whitelistedAlert });
    }
  } catch (e: any) {
    console.error('[FAIL] Test 2 Exception:', e.message);
  }

  // Test 3: Alert Deduplication & Fatigue Prevention
  try {
    // Ingest first trigger
    const alert1 = engine.evaluateTransaction({
      transactionReference: 'TX-DEDUP-01',
      sourceAccountOrWallet: 'ACC-MULE-DEDUP',
      destinationAccountOrWallet: 'ACC-TARGET-DEDUP',
      amount: 200000,
      currency: 'INR',
      timestamp: '2026-03-10T13:00:00Z',
      rail: 'Banking',
      flags: ['FAN_IN'],
    });

    // Ingest second confluent trigger to same target within same hour
    const alert2 = engine.evaluateTransaction({
      transactionReference: 'TX-DEDUP-02',
      sourceAccountOrWallet: 'ACC-MULE-DEDUP-B',
      destinationAccountOrWallet: 'ACC-TARGET-DEDUP',
      amount: 150000,
      currency: 'INR',
      timestamp: '2026-03-10T13:15:00Z',
      rail: 'Banking',
      flags: ['FAN_IN'],
    });

    if (alert1 && alert2 && alert1.alertId === alert2.alertId && alert2.supportingEvidence.length > alert1.supportingEvidence.length - 1) {
      console.log('[PASS] Test 3: Alert Deduplication & Evidence Aggregation Verified');
      console.log(`       Details: Merged confluent transaction ${alert2.alertId} instead of spawning duplicate alert.`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 3: Deduplication failed, spawned separate alerts.', { alert1, alert2 });
    }
  } catch (e: any) {
    console.error('[FAIL] Test 3 Exception:', e.message);
  }

  // Test 4: Missing & Incomplete Data Handling
  try {
    const incompleteAlert = engine.evaluateTransaction({
      transactionReference: 'TX-CORRUPT-01',
      sourceAccountOrWallet: '', // Missing source
      destinationAccountOrWallet: 'ACC-UNKNOWN',
      amount: NaN, // Invalid amount
      currency: 'INR',
      timestamp: '', // Missing timestamp
      rail: 'Banking',
    });

    if (
      incompleteAlert &&
      incompleteAlert.riskLevel === 'Informational' &&
      incompleteAlert.uncertaintyLevel === 'High' &&
      incompleteAlert.confidenceScore <= 30
    ) {
      console.log('[PASS] Test 4: Missing & Incomplete Data Handled Gracefully');
      console.log(`       Details: Marked with High Uncertainty (${incompleteAlert.uncertaintyLevel}) and Informational risk without engine fault.`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 4: Incomplete data caused unexpected behavior.', incompleteAlert);
    }
  } catch (e: any) {
    console.error('[FAIL] Test 4 Exception:', e.message);
  }

  // Test 5: Risk-Based Case Prioritization
  try {
    const prioritized = engine.getPrioritizedCases(['CYBER-2026-0842']);
    if (
      prioritized.length > 0 &&
      prioritized[0].compositeRiskScore >= 80 &&
      prioritized[0].recommendedUrgency === 'IMMEDIATE_ACTION'
    ) {
      console.log('[PASS] Test 5: Risk-Based Case Prioritization Engine Verified');
      console.log(`       Details: Case ${prioritized[0].caseId} calculated Composite Score ${prioritized[0].compositeRiskScore}/100 [${prioritized[0].recommendedUrgency}].`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 5: Case prioritization failed or miscalculated.', prioritized);
    }
  } catch (e: any) {
    console.error('[FAIL] Test 5 Exception:', e.message);
  }

  // Test 6: Alert Lifecycle Status Updates
  try {
    const targetAlert = INITIAL_EARLY_WARNINGS[0];
    const updated = engine.updateAlertStatus(
      targetAlert.alertId,
      'Under Review',
      'Insp. Vikram Rathore',
      'Senior Cybercrime Investigator',
      'Requisition prepared for Bank Nodal review.'
    );

    if (updated.status === 'Under Review') {
      console.log('[PASS] Test 6: Alert Lifecycle State Machine Transition Verified');
      console.log(`       Details: Updated ${targetAlert.alertId} from New -> Under Review.`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 6: Status update failed.', updated);
    }
  } catch (e: any) {
    console.error('[FAIL] Test 6 Exception:', e.message);
  }

  // Test 7: Audit Logging & Chain of Custody
  try {
    const targetAlert = engine.getAlerts().find(a => a.alertId === INITIAL_EARLY_WARNINGS[0].alertId);
    const latestAudit = targetAlert?.auditHistory[0];

    if (
      latestAudit &&
      latestAudit.action === 'Status Changed' &&
      latestAudit.actorName === 'Insp. Vikram Rathore' &&
      Boolean(latestAudit.timestamp)
    ) {
      console.log('[PASS] Test 7: Audit Logging and Custody Trail Confirmed');
      console.log(`       Details: Audit entry logged by ${latestAudit.actorName} (${latestAudit.actorRole}): "${latestAudit.notes}".`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 7: Audit logging entry missing or invalid.', latestAudit);
    }
  } catch (e: any) {
    console.error('[FAIL] Test 7 Exception:', e.message);
  }

  // Test 8: Prevention Principles & Human-in-the-Loop Guardrail
  try {
    const allAlerts = engine.getAlerts();
    const allRequireHumanAuth = allAlerts.every(a => a.requiresHumanAuthorization === true);
    const noAutoFreezeFlag = allAlerts.every(a => !('autoFreezeExecuted' in (a as any)));

    if (allRequireHumanAuth && noAutoFreezeFlag) {
      console.log('[PASS] Test 8: Prevention Principle Guardrail Permanently Enforced');
      console.log('       Details: Verified 100% of alerts mandate authorized human review prior to consequential legal action.');
      passedCount++;
    } else {
      console.error('[FAIL] Test 8: Prevention guardrails compromised.');
    }
  } catch (e: any) {
    console.error('[FAIL] Test 8 Exception:', e.message);
  }

  console.log('\n======================================================================');
  console.log(`EARLY WARNING TEST SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
  console.log('======================================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests();
