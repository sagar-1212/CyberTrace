/**
 * Cryptocurrency Forensics Module - Automated Test Suite
 * Tests graph construction, classification, taint propagation, pathway reconstruction,
 * benchmark metrics, and limitations disclaimers.
 */

import { CryptoForensicsEngine } from './cryptoGraphEngine';

export async function runCryptoForensicsTests() {
  console.log('======================================================================');
  console.log('FINTRACE: CRYPTOCURRENCY FORENSICS MODULE AUTOMATED TEST SUITE');
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

  const engine = new CryptoForensicsEngine();
  const overview = engine.getOverview();

  // -------------------------------------------------------------
  // Test 1: Graph Construction & Ingestion Loading
  // -------------------------------------------------------------
  assert(
    overview.totalTransactions >= 5 && overview.totalEdges >= 5,
    'Bitcoin Transaction Graph Construction',
    `Loaded ${overview.totalTransactions} transactions and ${overview.totalEdges} payment edges.`
  );

  // -------------------------------------------------------------
  // Test 2: Categorical Classification Verification
  // -------------------------------------------------------------
  assert(
    overview.illicitCount > 0 && overview.licitCount > 0,
    'Research Classification Mapping (Illicit / Licit / Unknown)',
    `Identified ${overview.illicitCount} illicit nodes and ${overview.licitCount} licit nodes in the registry.`
  );

  // -------------------------------------------------------------
  // Test 3: Suspicious Transaction Identification & High-Risk Scoring
  // -------------------------------------------------------------
  const illicitTx = overview.topIllicitTransactions[0];
  assert(
    illicitTx && illicitTx.riskScore >= 80 && illicitTx.classLabel === 'illicit',
    'Suspicious Transaction Identification',
    `Identified illicit node ${illicitTx.txId} with calibrated risk score ${illicitTx.riskScore}%.`
  );

  // -------------------------------------------------------------
  // Test 4: Taint Propagation & Illicit Proximity
  // -------------------------------------------------------------
  // Node 230425980 transfers directly to illicit node 5530458 (1-hop proximity)
  const taintResult = engine.calculateTaint('230425980');
  assert(
    taintResult.hopsToIllicit === 1 && taintResult.taintScore >= 70,
    'Taint Propagation & Proximity Analysis',
    `Detected 1-hop proximity to illicit anchor with taint score ${taintResult.taintScore}%.`
  );

  // -------------------------------------------------------------
  // Test 5: Connected Transaction Exploration (Ancestors & Descendants)
  // -------------------------------------------------------------
  const egoGraph = engine.extractEgoGraph('5530458', 1);
  assert(
    egoGraph.nodes.length >= 2,
    'Connected Transaction Neighborhood Exploration',
    `Extracted 1-hop ego network around tx 5530458 containing ${egoGraph.nodes.length} nodes and ${egoGraph.edges.length} edges.`
  );

  // -------------------------------------------------------------
  // Test 6: Transaction Pathway Reconstruction (A -> B)
  // -------------------------------------------------------------
  // In sample graph: 230425980 -> 5530458 -> 232022460 -> 232438397
  const pathway = engine.findPathway('230425980', '232438397');
  assert(
    pathway.pathFound && pathway.hopsCount === 3,
    'Transaction Pathway Directed Reconstruction',
    `Reconstructed unbroken 3-hop pathway: ${pathway.pathTxIds.join(' -> ')} (Peak Risk: ${pathway.accumulatedRiskScore}%).`
  );

  // -------------------------------------------------------------
  // Test 7: Suspicious Cluster Discovery
  // -------------------------------------------------------------
  const clusters = engine.identifyClusters();
  assert(
    clusters.length >= 1,
    'Connected Illicit Subgraph Cluster Discovery',
    `Discovered ${clusters.length} suspicious Bitcoin peeling/consolidation clusters.`
  );

  // -------------------------------------------------------------
  // Test 8: Machine Learning Benchmark Metrics Integrity
  // -------------------------------------------------------------
  const topModel =
    overview.benchmark.models.find(
      (m: any) => m.model_name.includes('Production') || m.model_name.includes('Hybrid')
    ) || overview.benchmark.models[overview.benchmark.models.length - 1];

  const hasValidMetrics =
    topModel &&
    topModel.f1_score > 0.5 &&
    topModel.precision > 0.5 &&
    topModel.recall > 0.5 &&
    topModel.roc_auc > 0.7 &&
    topModel.pr_auc > 0.5 &&
    topModel.confusion_matrix.true_positives > 0;

  assert(
    hasValidMetrics,
    'ML Chronological Benchmark Evaluation Metrics',
    `Model "${topModel.model_name}" evaluated on out-of-time test split: Precision=${topModel.precision}, Recall=${topModel.recall}, F1=${topModel.f1_score}, ROC-AUC=${topModel.roc_auc}, PR-AUC=${topModel.pr_auc}.`
  );

  // -------------------------------------------------------------
  // Test 9: Scientific Disclaimer & Limitations Guard
  // -------------------------------------------------------------
  const hasDisclaimer =
    overview.benchmark.scientificDisclaimer.includes('DO NOT represent') ||
    overview.benchmark.scientificDisclaimer.includes('empirical performance');
  assert(
    hasDisclaimer,
    'Scientific Non-Claim & Limitations Guard',
    'Verified prominent disclaimer that dataset metrics do not imply guaranteed real-world detection.'
  );

  console.log('\n======================================================================');
  console.log(`FORENSICS TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('======================================================================');

  return { passedTests, totalTests, success: passedTests === totalTests };
}

if (process.argv[1] && process.argv[1].includes('testCryptoForensics')) {
  runCryptoForensicsTests()
    .then((r) => process.exit(r.success ? 0 : 1))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}