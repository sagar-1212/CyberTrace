"""
Elliptic Bitcoin Transaction Dataset - Python Ingestion & Preprocessing Pipeline
Reads raw/sample CSVs, normalizes labels, preserves raw files, and outputs
structured graph JSON, temporal indices, and dataset metadata.
"""

import os
import sys
import csv
import json
import time
import hashlib
from typing import Dict, Any, List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from validator import validate_elliptic_dataset

def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def ingest_elliptic(source_dir: str = None, output_dir: str = None) -> Dict[str, Any]:
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    raw_dir = os.path.join(base_dir, "data", "crypto", "raw")
    sample_dir = os.path.join(base_dir, "data", "crypto", "samples")
    
    if source_dir is None:
        raw_classes = os.path.join(raw_dir, "elliptic_txs_classes.csv")
        active_source = raw_dir if os.path.exists(raw_classes) else sample_dir
    else:
        active_source = source_dir
        
    out_dir = output_dir or os.path.join(base_dir, "data", "crypto", "processed")
    meta_dir = os.path.join(base_dir, "data", "crypto", "metadata")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(meta_dir, exist_ok=True)
    
    prefix = ".sample" if active_source == sample_dir else ""
    classes_file = os.path.join(active_source, f"elliptic_txs_classes{prefix}.csv")
    edgelist_file = os.path.join(active_source, f"elliptic_txs_edgelist{prefix}.csv")
    features_file = os.path.join(active_source, f"elliptic_txs_features{prefix}.csv")
    
    print(f"[Python Ingest] Validating dataset from {active_source}...")
    val_report = validate_elliptic_dataset(active_source)
    with open(os.path.join(meta_dir, "validation_report.json"), "w", encoding="utf-8") as f:
        json.dump(val_report, f, indent=2)
        
    if not val_report["isValid"]:
        raise ValueError(f"Validation failed: {val_report['errors']}")
        
    # 1. Ingest classes & normalize
    print("[Python Ingest] Reading classes and mapping labels...")
    nodes: Dict[str, Dict[str, Any]] = {}
    illicit_count = 0
    licit_count = 0
    unknown_count = 0
    
    with open(classes_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        for row in reader:
            if not row: continue
            tx_id, raw_cls = row[0].strip(), row[1].strip()
            
            if raw_cls == "1":
                norm_cls = "illicit"
                is_ill = True
                is_lic = False
                is_unk = False
                illicit_count += 1
                risk = 95
            elif raw_cls == "2":
                norm_cls = "licit"
                is_ill = False
                is_lic = True
                is_unk = False
                licit_count += 1
                risk = 12
            else:
                norm_cls = "unknown"
                is_ill = False
                is_lic = False
                is_unk = True
                unknown_count += 1
                risk = 50
                
            nodes[tx_id] = {
                "txId": tx_id,
                "timeStep": 1,
                "classLabel": norm_cls,
                "rawClass": raw_cls,
                "inDegree": 0,
                "outDegree": 0,
                "isIllicit": is_ill,
                "isLicit": is_lic,
                "isUnknown": is_unk,
                "heuristicRiskScore": risk,
                "provenance": {
                    "dataset": "Elliptic Bitcoin Transaction Dataset",
                    "source": "Kaggle (ellipticco/elliptic-data-set)",
                    "isResearchData": True,
                    "verifiedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                }
            }
            
    # 2. Ingest edges
    print("[Python Ingest] Parsing transaction payment edges...")
    edges: List[Dict[str, str]] = []
    with open(edgelist_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        for row in reader:
            if not row or len(row) != 2: continue
            src, dst = row[0].strip(), row[1].strip()
            if src in nodes:
                nodes[src]["outDegree"] += 1
            if dst in nodes:
                nodes[dst]["inDegree"] += 1
            if src in nodes or dst in nodes:
                edges.append({"sourceTxId": src, "targetTxId": dst})
                
    # 3. Ingest features (time step & vector sample)
    print("[Python Ingest] Binding time-steps and numerical features...")
    time_steps = set()
    with open(features_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row: continue
            tx_id = row[0].strip()
            if tx_id in nodes:
                ts = int(row[1].strip()) if row[1].strip().isdigit() else 1
                nodes[tx_id]["timeStep"] = ts
                time_steps.add(ts)
                vector_sample = [float(x) for x in row[2:7]]
                nodes[tx_id]["localFeaturesSummary"] = {
                    "feeProxy": vector_sample[0] if len(vector_sample) > 0 else 0.0,
                    "inflowProxy": vector_sample[1] if len(vector_sample) > 1 else 0.0,
                    "outflowProxy": vector_sample[2] if len(vector_sample) > 2 else 0.0,
                    "featureVectorSample": vector_sample
                }
                
    total_nodes = len(nodes)
    total_edges = len(edges)
    sorted_ts = sorted(list(time_steps))
    
    # 4. Checksums & metadata
    checksums = {
        os.path.basename(classes_file): compute_sha256(classes_file),
        os.path.basename(edgelist_file): compute_sha256(edgelist_file),
        os.path.basename(features_file): compute_sha256(features_file)
    }
    
    metadata = {
        "datasetName": "Elliptic Bitcoin Transaction Graph Dataset",
        "version": "1.0.0 (Research)",
        "sourceUrl": "https://www.kaggle.com/datasets/ellipticco/elliptic-data-set",
        "paperCitation": "Mark Weber et al., 'Anti-Money Laundering in Bitcoin', KDD 2019",
        "isResearchDataset": True,
        "totalTransactions": total_nodes,
        "totalEdges": total_edges,
        "classDistribution": {
            "illicit": illicit_count,
            "licit": licit_count,
            "unknown": unknown_count,
            "illicitPercentage": f"{(illicit_count / max(total_nodes, 1) * 100):.2f}%",
            "licitPercentage": f"{(licit_count / max(total_nodes, 1) * 100):.2f}%",
            "unknownPercentage": f"{(unknown_count / max(total_nodes, 1) * 100):.2f}%"
        },
        "timeStepRange": {
            "min": sorted_ts[0] if sorted_ts else 1,
            "max": sorted_ts[-1] if sorted_ts else 1,
            "totalTimeSteps": len(sorted_ts)
        },
        "featureDimensions": {
            "totalColumns": 167,
            "localFeatures": 93,
            "aggregatedFeatures": 72
        },
        "fileChecksums": checksums,
        "importedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "provenance": f"Processed via Python Elliptic Ingestion Pipeline v1.0.0 from {os.path.basename(active_source)}",
        "license": "CC BY-NC 4.0 (Non-Commercial Research)",
        "complianceNotice": "CRITICAL: Research dataset labels do not establish real-world guilt, identity, or legal liability of wallet owners. Cryptocurrency forensics entities are maintained strictly isolated from banking records."
    }
    
    with open(os.path.join(meta_dir, "dataset_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    with open(os.path.join(out_dir, "elliptic_graph.json"), "w", encoding="utf-8") as f:
        json.dump({
            "metadata": metadata,
            "nodesCount": total_nodes,
            "edgesCount": total_edges,
            "nodes": list(nodes.values()),
            "edges": edges
        }, f, indent=2)
        
    print(f"[Python Ingest] Ingestion complete. Output saved to {out_dir}")
    return {"success": True, "metadata": metadata, "nodesCount": total_nodes, "edgesCount": total_edges}

if __name__ == "__main__":
    result = ingest_elliptic()
    print("Ingestion result:", json.dumps(result, indent=2))

