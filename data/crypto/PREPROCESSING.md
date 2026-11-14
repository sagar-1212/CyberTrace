# Elliptic Bitcoin Transaction Dataset — Preprocessing & Schema Documentation

## 1. Dataset Overview

The Elliptic Bitcoin Transaction Dataset contains 203,769 node transactions and 234,355 directed payment edges across 49 distinct chronological time steps (each representing roughly a 2-week observation window).

### Raw Files
| File Name | Header | Rows | Description |
| :--- | :--- | :--- | :--- |
| `elliptic_txs_classes.csv` | `txId,class` | 203,770 | Maps each transaction ID to its classification label (`1`, `2`, or `unknown`). |
| `elliptic_txs_edgelist.csv` | `txId1,txId2` | 234,356 | Directed edges representing the flow of bitcoins from `txId1` (input) to `txId2` (output). |
| `elliptic_txs_features.csv` | None (167 columns) | 203,769 | 167 features per transaction: column 0 is `txId`, column 1 is `time_step` (1–49), columns 2–94 are local features, columns 95–166 are aggregated 1-hop neighborhood features. |

---

## 2. Preprocessing & Transformation Pipeline

### Step 1: Raw Data Integrity & Header Validation
- Validate that `elliptic_txs_classes.csv` starts with header `txId,class`.
- Validate that `elliptic_txs_edgelist.csv` starts with header `txId1,txId2`.
- Inspect `elliptic_txs_features.csv` rows to ensure exactly 167 numerical fields per record.

### Step 2: Class Label Normalization
Raw integer strings are normalized into self-documenting semantic labels:
- `'1'` $\longrightarrow$ `'illicit'` (Scams, malware, ransomware, darknet markets, Ponzi schemes)
- `'2'` $\longrightarrow$ `'licit'` (Regulated exchanges, wallet services, miners, legal commerce)
- `'unknown'` $\longrightarrow$ `'unknown'` (Unlabeled transactions, ~80% of data, used for transductive graph semi-supervised learning)

### Step 3: Transaction Identifier & Graph Preservation
- All transaction IDs are preserved as immutable string identifiers.
- Graph relationships are indexed into forward edges (`txId1 -> txId2`) and backward edges (`txId2 <- txId1`).
- In-degree ($d_{in}$) and out-degree ($d_{out}$) are computed for every node in the graph.

### Step 4: Dangling Edge & Anomaly Detection
- Edges referencing transaction IDs absent from the features/classes dataset are flagged and quarantined.
- Empty lines, malformed rows, and non-numeric feature entries are logged in `validation_report.json`.

### Step 5: Processed Artifact Export
- Raw datasets are left completely untouched (read-only guarantee).
- Normalized, indexed sub-graphs, temporal slices, and metadata are written to `data/crypto/processed/` and `data/crypto/metadata/`.
- Fast in-memory lookup indices are generated for instantaneous UI queries by `txId`.

