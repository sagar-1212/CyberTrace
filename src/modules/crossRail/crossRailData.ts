/**
 * Cross-Rail Financial Pathway Reconstruction - Representative Case Data
 * 
 * Provides concrete, realistic cross-rail investigation dossiers:
 * 1. Banking accounts and transactions.
 * 2. Crypto wallets and blockchain transactions.
 * 3. Confirmed, Probable, Inferred, Unverified, and Unknown cross-rail links.
 * 4. Incomplete pathway segments demonstrating evidentiary blindspots.
 */

import { CrossRailPathwayCase } from './types';
import { CrossRailEngine } from './crossRailEngine';

export const PRIMARY_CROSS_RAIL_CASE: CrossRailPathwayCase = (() => {
  const bankingAccounts = [
    {
      accountId: 'ACC-VICTIM-HDFC-1049',
      accountReference: 'HDFC-****-8812',
      holderName: 'Rajeshwar Sharma',
      bankName: 'HDFC Bank',
      accountType: 'Victim Account' as const,
      kycStatus: 'Verified' as const,
      branchCity: 'Bengaluru, Karnataka',
      totalInflowINR: 500000,
      totalOutflowINR: 500000,
    },
    {
      accountId: 'ACC-MULE1-ICICI-4412',
      accountReference: 'ICICI-****-3319',
      holderName: 'Sunita Verma',
      bankName: 'ICICI Bank',
      accountType: 'Mule Candidate' as const,
      kycStatus: 'Unverified / Forged' as const,
      branchCity: 'Jaipur, Rajasthan',
      totalInflowINR: 500000,
      totalOutflowINR: 500000,
    },
    {
      accountId: 'ACC-MULE2-AXIS-9921',
      accountReference: 'AXIS-****-7741',
      holderName: 'Rapid Pay Solutions Enterprise',
      bankName: 'Axis Bank',
      accountType: 'Mule Candidate' as const,
      kycStatus: 'Flagged' as const,
      branchCity: 'Surat, Gujarat',
      totalInflowINR: 350000,
      totalOutflowINR: 350000,
    },
    {
      accountId: 'ACC-VASP-ESCROW-YES-001',
      accountReference: 'YESB-****-0104',
      holderName: 'Regulated Crypto Exchange Escrow',
      bankName: 'Yes Bank',
      accountType: 'Exchange Escrow' as const,
      kycStatus: 'Verified' as const,
      branchCity: 'Mumbai, Maharashtra',
      totalInflowINR: 350000,
      totalOutflowINR: 350000,
    },
  ];

  const cryptoWallets = [
    {
      walletId: 'WALLET-VASP-HOT-BTC-01',
      addressOrClusterId: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      blockchain: 'Bitcoin' as const,
      clusterLabel: 'VASP / Exchange Deposit' as const,
      knownEntityTag: 'WazirX / CoinSwitch Hot Wallet Liquidity Pool',
      inDegree: 142,
      outDegree: 89,
      estimatedVolumeBtc: 42.8,
      researchDatasetId: '230425980',
    },
    {
      walletId: 'WALLET-PEELING-INTERMEDIARY-02',
      addressOrClusterId: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      blockchain: 'Bitcoin' as const,
      clusterLabel: 'P2P Trader' as const,
      knownEntityTag: 'Suspicious Peeling Chain Pivot',
      inDegree: 1,
      outDegree: 2,
      estimatedVolumeBtc: 0.058,
      researchDatasetId: '5530458',
    },
    {
      walletId: 'WALLET-DARKNET-SYNDICATE-03',
      addressOrClusterId: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      blockchain: 'Bitcoin' as const,
      clusterLabel: 'Darknet Entity' as const,
      knownEntityTag: 'Hydra / ChipMixer Feeder Syndicate',
      inDegree: 8,
      outDegree: 1,
      estimatedVolumeBtc: 1.45,
      researchDatasetId: '232438397',
    },
    {
      walletId: 'WALLET-UNCONNECTED-SPECULATIVE-04',
      addressOrClusterId: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      blockchain: 'Bitcoin' as const,
      clusterLabel: 'Unknown Private Wallet' as const,
      knownEntityTag: 'Unverified External Wallet',
      inDegree: 2,
      outDegree: 0,
      estimatedVolumeBtc: 0.025,
      researchDatasetId: '232022460',
    },
  ];

  const bankingTransactions = [
    {
      transactionId: 'TX-BANK-001',
      transactionReference: 'UPI/2026/094812049182',
      senderAccountId: 'ACC-VICTIM-HDFC-1049',
      receiverAccountId: 'ACC-MULE1-ICICI-4412',
      amountINR: 500000,
      timestamp: '2026-03-10T09:15:00.000Z',
      method: 'UPI' as const,
      status: 'Completed' as const,
      narrativeDescription: 'Initial deceptive fraudulent transfer induced by fake investment advisor.',
    },
    {
      transactionId: 'TX-BANK-002',
      transactionReference: 'IMPS/2026/884910294102',
      senderAccountId: 'ACC-MULE1-ICICI-4412',
      receiverAccountId: 'ACC-MULE2-AXIS-9921',
      amountINR: 350000,
      timestamp: '2026-03-10T09:42:30.000Z',
      method: 'IMPS' as const,
      status: 'Flagged' as const,
      narrativeDescription: 'Rapid layer-1 to layer-2 mule fragmentation transfer within 27 minutes.',
    },
    {
      transactionId: 'TX-BANK-003',
      transactionReference: 'RTGS/2026/YESB002948102',
      senderAccountId: 'ACC-MULE2-AXIS-9921',
      receiverAccountId: 'ACC-VASP-ESCROW-YES-001',
      amountINR: 350000,
      timestamp: '2026-03-10T10:18:15.000Z',
      method: 'RTGS' as const,
      status: 'Completed' as const,
      narrativeDescription: 'Commercial on-ramp settlement payment into VASP client depository account.',
    },
  ];

  const cryptoTransactions = [
    {
      txHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      sourceAddressOrTxId: 'WALLET-VASP-HOT-BTC-01',
      destinationAddressOrTxId: 'WALLET-PEELING-INTERMEDIARY-02',
      amountBTC: 0.058,
      approxValueINR: 350000,
      timestamp: '2026-03-10T10:45:00.000Z',
      timeStep: 28,
      blockHeight: 842104,
      classLabel: 'illicit' as const,
      miningFeeBTC: 0.00015,
      status: 'Confirmed On-Chain' as const,
    },
    {
      txHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      sourceAddressOrTxId: 'WALLET-PEELING-INTERMEDIARY-02',
      destinationAddressOrTxId: 'WALLET-DARKNET-SYNDICATE-03',
      amountBTC: 0.052,
      approxValueINR: 315000,
      timestamp: '2026-03-10T11:20:10.000Z',
      timeStep: 28,
      blockHeight: 842109,
      classLabel: 'illicit' as const,
      miningFeeBTC: 0.00022,
      status: 'Confirmed On-Chain' as const,
    },
  ];

  // Bridges demonstrating strict evidence rules:
  // 1. Confirmed link with subpoenaed legal response
  // 2. Rejected link with missing evidence (amounts & timestamps match, but no proof)
  const confirmedBridge = CrossRailEngine.evaluateBridge(
    {
      caseId: 'CR-CASE-2026-001',
      bankingAccountId: 'ACC-MULE2-AXIS-9921',
      cryptoWalletId: 'WALLET-VASP-HOT-BTC-01',
      evidenceType: 'Subpoenaed VASP Record',
      evidenceReference: 'SEC91-VASP-NCRP-8812',
      fiatAmountINR: 350000,
      cryptoAmountBTC: 0.058,
      fiatTimestamp: '2026-03-10T10:18:15.000Z',
      cryptoTimestamp: '2026-03-10T10:45:00.000Z',
      evidentiaryDocumentNotes: 'VASP Nodal Officer confirmed customer deposit UTR matches RTGS/2026/YESB002948102, crediting verified Bitcoin hot wallet withdrawal.',
    },
    bankingAccounts[2],
    cryptoWallets[0]
  );

  // Unverified/Unknown speculative link demonstrating EVIDENCE RULE ENFORCEMENT
  const unsupportedBridge = CrossRailEngine.evaluateBridge(
    {
      caseId: 'CR-CASE-2026-001',
      bankingAccountId: 'ACC-MULE1-ICICI-4412',
      cryptoWalletId: 'WALLET-UNCONNECTED-SPECULATIVE-04',
      evidenceType: 'No Supporting Evidence',
      relyingSolelyOnHeuristics: true,
      fiatAmountINR: 150000,
      cryptoAmountBTC: 0.025,
      fiatTimestamp: '2026-03-10T09:50:00.000Z',
      cryptoTimestamp: '2026-03-10T10:00:00.000Z',
      evidentiaryDocumentNotes: 'Analyst speculative hypothesis: ₹1.5L cash withdrawal occurred near crypto purchase timestamp, but no KYC, exchange, or on-chain link exists.',
    },
    bankingAccounts[1],
    cryptoWallets[3]
  );

  const bridges = [confirmedBridge, unsupportedBridge];

  const incompleteSegments = CrossRailEngine.detectIncompletePathways(
    bankingAccounts,
    cryptoWallets,
    bankingTransactions,
    cryptoTransactions,
    bridges
  );

  const timeline = CrossRailEngine.buildUnifiedTimeline(
    bankingTransactions,
    cryptoTransactions,
    bridges
  );

  return {
    caseId: 'CR-CASE-2026-001',
    caseTitle: 'Operation ShadowBridge: Multi-Layered Cyber Investment Fraud to Bitcoin Mixer',
    complaintNumber: 'NCRP-2026-99412',
    victimReference: 'Rajeshwar Sharma (₹5,00,000 Fraud Exposure)',
    investigatorBadge: 'DL-CYBER-8821',
    createdAt: '2026-03-10T12:00:00.000Z',
    bankingAccounts,
    cryptoWallets,
    bankingTransactions,
    cryptoTransactions,
    bridges,
    incompleteSegments,
    timeline,
    totalBankingFlowINR: 500000,
    totalCryptoFlowBTC: 0.058,
    totalCrossRailBridgedINR: 350000,
    untracedGapAmountINR: 150000,
  };
})();
