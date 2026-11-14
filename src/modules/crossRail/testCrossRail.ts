/**
 * Cross-Rail Financial Pathway Reconstruction - Automated Test Suite
 * 
 * Verifies:
 * 1. Banking and crypto entity separation.
 * 2. Banking and crypto transaction separation.
 * 3. Supported cross-rail links with legal/technical evidence.
 * 4. Unsupported links rejection under the Evidence Rule.
 * 5. Detection of incomplete pathways and broken conduits.
 * 6. Unified investigation timeline chronological ordering.
 * 7. Relationship classification enforcement (Confirmed, Probable, Inferred, Unverified, Unknown).
 * 8. Transaction inspectability and metadata persistence.
 */

import { CrossRailEngine } from './crossRailEngine';
import { PRIMARY_CROSS_RAIL_CASE } from './crossRailData';
import { RelationshipClassification, EvidenceType } from './types';

function runTests() {
  console.log('======================================================================');
  console.log('FINTRACE: CROSS-RAIL FINANCIAL PATHWAY RECONSTRUCTION TEST SUITE');
  console.log('======================================================================\n');

  let passedCount = 0;
  const totalCount = 8;

  // Test 1: Banking and Crypto Entity Separation
  try {
    const bankingAccounts = PRIMARY_CROSS_RAIL_CASE.bankingAccounts;
    const cryptoWallets = PRIMARY_CROSS_RAIL_CASE.cryptoWallets;

    const hasBankingSpecifics = bankingAccounts.every(a => 'bankName' in a && 'totalInflowINR' in a);
    const hasCryptoSpecifics = cryptoWallets.every(w => 'blockchain' in w && 'addressOrClusterId' in w);

    if (hasBankingSpecifics && hasCryptoSpecifics && bankingAccounts.length > 0 && cryptoWallets.length > 0) {
      console.log('[PASS] Test 1: Separate Banking and Crypto Entity Models Maintained');
      console.log(`       Details: Isolated ${bankingAccounts.length} banking accounts (INR) and ${cryptoWallets.length} crypto wallet clusters (BTC).`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 1: Entity models are conflated or incomplete.');
    }
  } catch (e: any) {
    console.error('[FAIL] Test 1 Exception:', e.message);
  }

  // Test 2: Banking and Crypto Transaction Separation
  try {
    const bTxs = PRIMARY_CROSS_RAIL_CASE.bankingTransactions;
    const cTxs = PRIMARY_CROSS_RAIL_CASE.cryptoTransactions;

    const bCheck = bTxs.every(t => 'amountINR' in t && 'method' in t && !('amountBTC' in t));
    const cCheck = cTxs.every(t => 'amountBTC' in t && 'txHash' in t && !('amountINR' in t));

    if (bCheck && cCheck) {
      console.log('[PASS] Test 2: Separate Banking and Blockchain Transaction Records Preserved');
      console.log(`       Details: ${bTxs.length} banking transactions (UPI/IMPS/RTGS) and ${cTxs.length} on-chain Bitcoin UTXO transactions.`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 2: Transaction records are merged or schemas violated.');
    }
  } catch (e: any) {
    console.error('[FAIL] Test 2 Exception:', e.message);
  }

  // Test 3: Supported Cross-Rail Link with Evidence
  try {
    const confirmedBridge = PRIMARY_CROSS_RAIL_CASE.bridges.find(b => b.classification === 'Confirmed');
    if (
      confirmedBridge &&
      confirmedBridge.isEvidenceSufficient &&
      confirmedBridge.confidenceScore >= 90 &&
      confirmedBridge.evidenceType === 'Subpoenaed VASP Record'
    ) {
      console.log('[PASS] Test 3: Supported Cross-Rail Link Verified with Legal Evidence');
      console.log(`       Details: Bridge ${confirmedBridge.bridgeId} confirmed via ${confirmedBridge.evidenceReference} with ${confirmedBridge.confidenceScore}% confidence.`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 3: Confirmed bridge not established or evidence verification failed.');
    }
  } catch (e: any) {
    console.error('[FAIL] Test 3 Exception:', e.message);
  }

  // Test 4: Strict Evidence Rule Enforcement (Reject Unsupported Links)
  try {
    // Attempt to bridge based solely on amount similarity and close timestamps
    const speculativeBridge = CrossRailEngine.evaluateBridge({
      caseId: 'TEST-CASE-001',
      bankingAccountId: 'ACC-MULE-99',
      cryptoWalletId: 'WALLET-BTC-88',
      evidenceType: 'No Supporting Evidence',
      relyingSolelyOnHeuristics: true,
      fiatAmountINR: 200000,
      cryptoAmountBTC: 0.033,
      fiatTimestamp: '2026-03-10T14:00:00Z',
      cryptoTimestamp: '2026-03-10T14:04:00Z',
    });

    if (
      (speculativeBridge.classification === 'Unknown' || speculativeBridge.classification === 'Unverified') &&
      !speculativeBridge.isEvidenceSufficient &&
      speculativeBridge.confidenceScore === 0 &&
      speculativeBridge.insufficientReason?.includes('EVIDENCE RULE ENFORCED')
    ) {
      console.log('[PASS] Test 4: Evidence Rule Strictly Enforced Against Heuristic-Only Linking');
      console.log('       Details: Prohibited auto-linking on amount similarity and temporal proximity without documentary proof.');
      passedCount++;
    } else {
      console.error('[FAIL] Test 4: Evidence Rule failed to reject unsupported candidate link.', speculativeBridge);
    }
  } catch (e: any) {
    console.error('[FAIL] Test 4 Exception:', e.message);
  }

  // Test 5: Incomplete Pathway and Evidentiary Gap Detection
  try {
    const gaps = PRIMARY_CROSS_RAIL_CASE.incompleteSegments;
    const hasVaspGap = gaps.some(g => g.gapType === 'Missing VASP Subpoena');
    const hasBlindspot = gaps.some(g => g.gapType === 'Off-Ramp Blindspot');

    if (gaps.length >= 2 && hasVaspGap && hasBlindspot) {
      console.log('[PASS] Test 5: Incomplete Transaction Pathways & Blindspots Detected');
      console.log(`       Details: Identified ${gaps.length} broken pathway segments with actionable LEA recommendations.`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 5: Incomplete pathways were not properly detected.', gaps);
    }
  } catch (e: any) {
    console.error('[FAIL] Test 5 Exception:', e.message);
  }

  // Test 6: Common Investigation Timeline Ordering & Interleaving
  try {
    const timeline = PRIMARY_CROSS_RAIL_CASE.timeline;
    let isChronological = true;
    for (let i = 1; i < timeline.length; i++) {
      if (new Date(timeline[i].timestamp).getTime() < new Date(timeline[i - 1].timestamp).getTime()) {
        isChronological = false;
        break;
      }
    }
    const hasBanking = timeline.some(e => e.railType === 'Banking');
    const hasBridge = timeline.some(e => e.railType === 'Cross-Rail Bridge');
    const hasCrypto = timeline.some(e => e.railType === 'Crypto');

    if (isChronological && hasBanking && hasBridge && hasCrypto) {
      console.log('[PASS] Test 6: Common Investigation Timeline Blending All Rails');
      console.log(`       Details: Generated ${timeline.length} chronologically sorted events across Banking, Bridge, and Crypto rails.`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 6: Timeline not sorted or missing rail event types.');
    }
  } catch (e: any) {
    console.error('[FAIL] Test 6 Exception:', e.message);
  }

  // Test 7: Relationship Classification Taxonomy
  try {
    const validClassifications: RelationshipClassification[] = ['Confirmed', 'Probable', 'Inferred', 'Unverified', 'Unknown'];
    const testCases: { evidence: EvidenceType; expected: RelationshipClassification }[] = [
      { evidence: 'Subpoenaed VASP Record', expected: 'Confirmed' },
      { evidence: 'Bank UTR Memo Match', expected: 'Confirmed' },
      { evidence: 'IP & Device Telemetry', expected: 'Probable' },
      { evidence: 'Complainant Assertion', expected: 'Unverified' },
      { evidence: 'No Supporting Evidence', expected: 'Unknown' },
    ];

    let allMatch = true;
    for (const tc of testCases) {
      const bridge = CrossRailEngine.evaluateBridge({
        caseId: 'TEST-CASE',
        bankingAccountId: 'ACC-1',
        cryptoWalletId: 'WALLET-1',
        evidenceType: tc.evidence,
        evidenceReference: tc.evidence === 'No Supporting Evidence' ? undefined : 'REF-123',
      });
      if (bridge.classification !== tc.expected) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      console.log('[PASS] Test 7: Relationship Classification Taxonomy Verified');
      console.log(`       Details: Validated mappings for: ${validClassifications.join(', ')}.`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 7: Classification taxonomy mismatch.');
    }
  } catch (e: any) {
    console.error('[FAIL] Test 7 Exception:', e.message);
  }

  // Test 8: Transaction Inspectability & Provenance
  try {
    const bTx = PRIMARY_CROSS_RAIL_CASE.bankingTransactions[0];
    const cTx = PRIMARY_CROSS_RAIL_CASE.cryptoTransactions[0];

    const bInspectable = Boolean(bTx.transactionReference && bTx.timestamp && bTx.senderAccountId && bTx.receiverAccountId);
    const cInspectable = Boolean(cTx.txHash && cTx.timestamp && cTx.sourceAddressOrTxId && cTx.destinationAddressOrTxId);

    if (bInspectable && cInspectable) {
      console.log('[PASS] Test 8: Transaction Inspectability and Evidentiary Attributes Intact');
      console.log(`       Details: Verified full audit trace for Banking Ref ${bTx.transactionReference} and On-Chain Hash ${cTx.txHash.substring(0, 16)}...`);
      passedCount++;
    } else {
      console.error('[FAIL] Test 8: Missing key audit attributes for transaction inspection.');
    }
  } catch (e: any) {
    console.error('[FAIL] Test 8 Exception:', e.message);
  }

  console.log('\n======================================================================');
  console.log(`CROSS-RAIL TEST SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
  console.log('======================================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests();
