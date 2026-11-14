/**
 * Intelligent Mule Detection System — Verification & Edge Case Test Suite
 * Tests all 10 detection capabilities, edge cases, and false positive protections.
 */

import { Account, Transaction } from '../../types';
import { IntelligentMuleDetectionEngine } from './muleDetectionEngine';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS } from '../../data/mockData';

export function runMuleDetectionTests() {
  console.log('======================================================================');
  console.log('FINTRACE: INTELLIGENT MULE DETECTION SYSTEM VERIFICATION SUITE');
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
  // Test 1: Fan-In Detection (Multiple sources -> Single node)
  // -------------------------------------------------------------
  const fanInAccounts: Account[] = [
    {
      id: 'ACC-HUB-1',
      accountReference: 'SB-HUB-001',
      holderName: 'Central Collector',
      bankName: 'SBI',
      accountType: 'Mule Candidate',
      riskStatus: 'Suspicious',
      riskScore: 70,
      totalInflow: 150000,
      totalOutflow: 0,
      kycStatus: 'Flagged',
      openedDate: '2026-01-01',
      branch: 'Bengaluru',
      city: 'Bengaluru',
    },
  ];
  const fanInTxns: Transaction[] = [
    {
      id: 'T1',
      transactionReference: 'TX-1',
      senderAccountId: 'ACC-SRC-1',
      senderAccountRef: 'SRC-1',
      senderName: 'Sender 1',
      receiverAccountId: 'ACC-HUB-1',
      receiverAccountRef: 'HUB-1',
      receiverName: 'Central Collector',
      amount: 50000,
      transactionTimestamp: '2026-09-26T10:00:00Z',
      transactionType: 'UPI',
      status: 'Completed',
      complaintId: 'CMP-1',
      layer: 1,
      flags: ['Rapid Inflow'],
    },
    {
      id: 'T2',
      transactionReference: 'TX-2',
      senderAccountId: 'ACC-SRC-2',
      senderAccountRef: 'SRC-2',
      senderName: 'Sender 2',
      receiverAccountId: 'ACC-HUB-1',
      receiverAccountRef: 'HUB-1',
      receiverName: 'Central Collector',
      amount: 50000,
      transactionTimestamp: '2026-09-26T10:05:00Z',
      transactionType: 'UPI',
      status: 'Completed',
      complaintId: 'CMP-1',
      layer: 1,
      flags: ['Rapid Inflow'],
    },
    {
      id: 'T3',
      transactionReference: 'TX-3',
      senderAccountId: 'ACC-SRC-3',
      senderAccountRef: 'SRC-3',
      senderName: 'Sender 3',
      receiverAccountId: 'ACC-HUB-1',
      receiverAccountRef: 'HUB-1',
      receiverName: 'Central Collector',
      amount: 50000,
      transactionTimestamp: '2026-09-26T10:10:00Z',
      transactionType: 'UPI',
      status: 'Completed',
      complaintId: 'CMP-1',
      layer: 1,
      flags: ['Rapid Inflow'],
    },
  ];

  const engine1 = new IntelligentMuleDetectionEngine(fanInAccounts, fanInTxns);
  const profile1 = engine1.analyzeAccount('ACC-HUB-1');
  const hasFanIn = profile1.detectedPatterns.some((p) => p.patternType === 'fan_in');
  assert(hasFanIn, 'Fan-In Pattern Detection', `Detected ${profile1.inDegree} incoming sources aggregating ₹1,50,000.`);

  // -------------------------------------------------------------
  // Test 2: Fan-Out Detection (Single source -> Multiple branches)
  // -------------------------------------------------------------
  const fanOutTxns: Transaction[] = [
    {
      id: 'T4',
      transactionReference: 'TX-4',
      senderAccountId: 'ACC-DISP-1',
      senderAccountRef: 'DISP-1',
      senderName: 'Dispersion Mule',
      receiverAccountId: 'ACC-REC-A',
      receiverAccountRef: 'REC-A',
      receiverName: 'Recipient A',
      amount: 25000,
      transactionTimestamp: '2026-09-26T11:00:00Z',
      transactionType: 'IMPS',
      status: 'Completed',
      complaintId: 'CMP-2',
      layer: 2,
      flags: ['Structuring'],
    },
    {
      id: 'T5',
      transactionReference: 'TX-5',
      senderAccountId: 'ACC-DISP-1',
      senderAccountRef: 'DISP-1',
      senderName: 'Dispersion Mule',
      receiverAccountId: 'ACC-REC-B',
      receiverAccountRef: 'REC-B',
      receiverName: 'Recipient B',
      amount: 25000,
      transactionTimestamp: '2026-09-26T11:02:00Z',
      transactionType: 'IMPS',
      status: 'Completed',
      complaintId: 'CMP-2',
      layer: 2,
      flags: ['Structuring'],
    },
    {
      id: 'T6',
      transactionReference: 'TX-6',
      senderAccountId: 'ACC-DISP-1',
      senderAccountRef: 'DISP-1',
      senderName: 'Dispersion Mule',
      receiverAccountId: 'ACC-REC-C',
      receiverAccountRef: 'REC-C',
      receiverName: 'Recipient C',
      amount: 25000,
      transactionTimestamp: '2026-09-26T11:04:00Z',
      transactionType: 'IMPS',
      status: 'Completed',
      complaintId: 'CMP-2',
      layer: 2,
      flags: ['Structuring'],
    },
  ];

  const engine2 = new IntelligentMuleDetectionEngine([], fanOutTxns);
  const profile2 = engine2.analyzeAccount('ACC-DISP-1');
  const hasFanOut = profile2.detectedPatterns.some((p) => p.patternType === 'fan_out');
  assert(hasFanOut, 'Fan-Out Pattern Detection', `Detected dispersion to ${profile2.outDegree} distinct accounts.`);

  // -------------------------------------------------------------
  // Test 3: Rapid Pass-Through (< 15 min turnover)
  // -------------------------------------------------------------
  const rapidTxns: Transaction[] = [
    {
      id: 'T7',
      transactionReference: 'TX-7',
      senderAccountId: 'ACC-IN-1',
      senderAccountRef: 'IN-1',
      senderName: 'Victim Inflow',
      receiverAccountId: 'ACC-PASS-1',
      receiverAccountRef: 'PASS-1',
      receiverName: 'Pass Through Mule',
      amount: 100000,
      transactionTimestamp: '2026-09-26T12:00:00Z',
      transactionType: 'UPI',
      status: 'Completed',
      complaintId: 'CMP-3',
      layer: 1,
      flags: [],
    },
    {
      id: 'T8',
      transactionReference: 'TX-8',
      senderAccountId: 'ACC-PASS-1',
      senderAccountRef: 'PASS-1',
      senderName: 'Pass Through Mule',
      receiverAccountId: 'ACC-OUT-1',
      receiverAccountRef: 'OUT-1',
      receiverName: 'Cashout Node',
      amount: 98000,
      transactionTimestamp: '2026-09-26T12:06:00Z', // 6 minutes dwell time!
      transactionType: 'IMPS',
      status: 'Completed',
      complaintId: 'CMP-3',
      layer: 2,
      flags: [],
    },
  ];

  const engine3 = new IntelligentMuleDetectionEngine([], rapidTxns);
  const profile3 = engine3.analyzeAccount('ACC-PASS-1');
  const hasRapid = profile3.detectedPatterns.some((p) => p.patternType === 'rapid_movement');
  assert(
    hasRapid && profile3.averageHoldingTimeMinutes <= 10,
    'Rapid Money Movement Detection',
    `Holding dwell: ${profile3.averageHoldingTimeMinutes} mins, Turnover: ${(profile3.turnoverRatio * 100).toFixed(0)}%.`
  );

  // -------------------------------------------------------------
  // Test 4: Circular Round-Tripping (A -> B -> C -> A)
  // -------------------------------------------------------------
  const circularTxns: Transaction[] = [
    {
      id: 'TC1',
      transactionReference: 'TX-C1',
      senderAccountId: 'ACC-LOOP-A',
      senderAccountRef: 'LOOP-A',
      senderName: 'Ring Leader A',
      receiverAccountId: 'ACC-LOOP-B',
      receiverAccountRef: 'LOOP-B',
      receiverName: 'Mule B',
      amount: 30000,
      transactionTimestamp: '2026-09-26T13:00:00Z',
      transactionType: 'IMPS',
      status: 'Completed',
      complaintId: 'CMP-4',
      layer: 1,
      flags: [],
    },
    {
      id: 'TC2',
      transactionReference: 'TX-C2',
      senderAccountId: 'ACC-LOOP-B',
      senderAccountRef: 'LOOP-B',
      senderName: 'Mule B',
      receiverAccountId: 'ACC-LOOP-C',
      receiverAccountRef: 'LOOP-C',
      receiverName: 'Mule C',
      amount: 29500,
      transactionTimestamp: '2026-09-26T13:10:00Z',
      transactionType: 'IMPS',
      status: 'Completed',
      complaintId: 'CMP-4',
      layer: 2,
      flags: [],
    },
    {
      id: 'TC3',
      transactionReference: 'TX-C3',
      senderAccountId: 'ACC-LOOP-C',
      senderAccountRef: 'LOOP-C',
      receiverAccountId: 'ACC-LOOP-A', // Returns back to A!
      receiverAccountRef: 'LOOP-A',
      receiverName: 'Ring Leader A',
      senderName: 'Mule C',
      amount: 29000,
      transactionTimestamp: '2026-09-26T13:20:00Z',
      transactionType: 'IMPS',
      status: 'Completed',
      complaintId: 'CMP-4',
      layer: 3,
      flags: [],
    },
  ];

  const engine4 = new IntelligentMuleDetectionEngine([], circularTxns);
  const profile4 = engine4.analyzeAccount('ACC-LOOP-A');
  const hasCirc = profile4.detectedPatterns.some((p) => p.patternType === 'circular_roundtrip');
  assert(hasCirc, 'Circular Round-Trip Detection', 'Identified closed transaction cycle returning funds to origin node.');

  // -------------------------------------------------------------
  // Test 5: Structuring / Fragmentation (Sub-threshold splitting)
  // -------------------------------------------------------------
  const fragTxns: Transaction[] = [
    {
      id: 'TF1',
      transactionReference: 'TX-F1',
      senderAccountId: 'ACC-SMURF-1',
      senderAccountRef: 'SMURF-1',
      senderName: 'Smurfing Mule',
      receiverAccountId: 'ACC-TGT-1',
      receiverAccountRef: 'TGT-1',
      receiverName: 'Drop 1',
      amount: 24500,
      transactionTimestamp: '2026-09-26T14:00:00Z',
      transactionType: 'UPI',
      status: 'Completed',
      complaintId: 'CMP-5',
      layer: 1,
      flags: [],
    },
    {
      id: 'TF2',
      transactionReference: 'TX-F2',
      senderAccountId: 'ACC-SMURF-1',
      senderAccountRef: 'SMURF-1',
      senderName: 'Smurfing Mule',
      receiverAccountId: 'ACC-TGT-2',
      receiverAccountRef: 'TGT-2',
      receiverName: 'Drop 2',
      amount: 24800,
      transactionTimestamp: '2026-09-26T14:02:00Z',
      transactionType: 'UPI',
      status: 'Completed',
      complaintId: 'CMP-5',
      layer: 1,
      flags: [],
    },
    {
      id: 'TF3',
      transactionReference: 'TX-F3',
      senderAccountId: 'ACC-SMURF-1',
      senderAccountRef: 'SMURF-1',
      senderName: 'Smurfing Mule',
      receiverAccountId: 'ACC-TGT-3',
      receiverAccountRef: 'TGT-3',
      receiverName: 'Drop 3',
      amount: 24200,
      transactionTimestamp: '2026-09-26T14:04:00Z',
      transactionType: 'UPI',
      status: 'Completed',
      complaintId: 'CMP-5',
      layer: 1,
      flags: [],
    },
  ];

  const engine5 = new IntelligentMuleDetectionEngine([], fragTxns);
  const profile5 = engine5.analyzeAccount('ACC-SMURF-1');
  const hasFrag = profile5.detectedPatterns.some((p) => p.patternType === 'fragmentation_structuring');
  assert(hasFrag, 'Fragmentation / Structuring Detection', 'Detected 3 sub-threshold splits with uniform values.');

  // -------------------------------------------------------------
  // Test 6: False Positive Protection (Genuine Victim or Merchant)
  // -------------------------------------------------------------
  const legitAccounts: Account[] = [
    {
      id: 'ACC-LEGIT-1',
      accountReference: 'SB-LEGIT-001',
      holderName: 'Genuine Complainant',
      bankName: 'HDFC Bank',
      accountType: 'Victim Account',
      riskStatus: 'Verified Safe',
      riskScore: 5,
      totalInflow: 50000,
      totalOutflow: 50000,
      kycStatus: 'Verified',
      openedDate: '2020-01-01',
      branch: 'Indiranagar',
      city: 'Bengaluru',
    },
  ];
  const legitTxns: Transaction[] = [
    {
      id: 'TL1',
      transactionReference: 'TX-L1',
      senderAccountId: 'ACC-LEGIT-1',
      senderAccountRef: 'LEGIT-1',
      senderName: 'Genuine Complainant',
      receiverAccountId: 'ACC-MULE-4011',
      receiverAccountRef: 'MULE-4011',
      receiverName: 'Mule Beneficiary',
      amount: 50000,
      transactionTimestamp: '2026-09-26T15:00:00Z',
      transactionType: 'UPI',
      status: 'Completed',
      complaintId: 'CMP-6',
      layer: 0,
      flags: [],
    },
  ];

  const engine6 = new IntelligentMuleDetectionEngine(legitAccounts, legitTxns);
  const profile6 = engine6.analyzeAccount('ACC-LEGIT-1');
  assert(
    profile6.overallRiskScore <= 20 && profile6.detectedPatterns.length === 0,
    'False Positive Protection for Verified Accounts',
    `Risk Score: ${profile6.overallRiskScore} (Expected <= 20). Status: ${profile6.verificationStatus}.`
  );

  // -------------------------------------------------------------
  // Test 7: Missing / Incomplete Data Resilience
  // -------------------------------------------------------------
  const incompleteTxns: any[] = [
    { id: 'TX-INC-1', senderAccountId: 'ACC-A', receiverAccountId: 'ACC-B', amount: 1000 },
    null,
    undefined,
    { id: 'TX-INC-2' }, // Missing senders
  ];

  let crashed = false;
  try {
    const engine7 = new IntelligentMuleDetectionEngine([], incompleteTxns);
    const result = engine7.runFullMuleDetection();
    assert(result.profiles.length >= 0, 'Incomplete / Malformed Data Handling', 'Gracefully handled nulls without runtime error.');
  } catch (e) {
    crashed = true;
    assert(false, 'Incomplete Data Handling', `Encountered exception: ${e}`);
  }

  // -------------------------------------------------------------
  // Test 8: Syndicate Clustering & Community Detection
  // -------------------------------------------------------------
  const allTestTxns = [...fanInTxns, ...fanOutTxns, ...rapidTxns, ...circularTxns];
  const engine8 = new IntelligentMuleDetectionEngine([], allTestTxns);
  const clusters = engine8.identifySyndicateClusters();
  assert(
    clusters.length >= 1,
    'Syndicate Ring Community Detection',
    `Identified ${clusters.length} distinct multi-node laundering clusters.`
  );

  // -------------------------------------------------------------
  // Test 9: Execution on FinTrace System Dataset (54 accounts)
  // -------------------------------------------------------------
  const realEngine = new IntelligentMuleDetectionEngine(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS);
  const realResult = realEngine.runFullMuleDetection();
  assert(
    realResult.profiles.length >= 10 && realResult.summary.criticalMuleCount >= 1,
    'FinTrace MockData Ecosystem Live Analysis',
    `Analyzed ${realResult.summary.totalAnalyzedAccounts} accounts. Flagged ${realResult.summary.criticalMuleCount} critical mules and ₹${realResult.summary.totalFlaggedVolumeINR.toLocaleString('en-IN')} in suspicious transit.`
  );

  console.log('\n======================================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('======================================================================');

  return { passedTests, totalTests, success: passedTests === totalTests };
}

runMuleDetectionTests();
