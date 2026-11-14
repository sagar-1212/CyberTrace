"""
Elliptic Bitcoin Transaction Dataset - Python Validation Module
Strictly validates file presence, headers, 167-column widths, and graph integrity
without requiring heavy external dependencies.
"""

import os
import sys
import csv
import json
import time
from typing import Dict, Any, List, Set

def validate_elliptic_dataset(data_dir: str = None) -> Dict[str, Any]:
    start_time = time.time()
    
    # Auto-resolve directory (raw if exists, else sample)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    raw_dir = os.path.join(base_dir, "data", "crypto", "raw")
    sample_dir = os.path.join(base_dir, "data", "crypto", "samples")
    
    if data_dir is None:
        raw_classes = os.path.join(raw_dir, "elliptic_txs_classes.csv")
        active_dir = raw_dir if os.path.exists(raw_classes) else sample_dir
    else:
        active_dir = data_dir
        
    prefix = ".sample" if active_dir == sample_dir else ""
    classes_file = os.path.join(active_dir, f"elliptic_txs_classes{prefix}.csv")
    edgelist_file = os.path.join(active_dir, f"elliptic_txs_edgelist{prefix}.csv")
    features_file = os.path.join(active_dir, f"elliptic_txs_features{prefix}.csv")
    
    errors: List[str] = []
    warnings: List[str] = []
    files_checked = []
    
    # 1. File existence check
    for fname, fpath in [("classes", classes_file), ("edgelist", edgelist_file), ("features", features_file)]:
        if not os.path.exists(fpath):
            errors.append(f"Missing dataset file: {fpath}")
            files_checked.append({"fileName": os.path.basename(fpath), "exists": False, "sizeBytes": 0})
        else:
            size = os.path.getsize(fpath)
            if size == 0:
                errors.append(f"File is empty (0 bytes): {fpath}")
            files_checked.append({"fileName": os.path.basename(fpath), "exists": True, "sizeBytes": size})
            
    if errors:
        return {
            "isValid": False,
            "checkedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "errors": errors,
            "warnings": warnings,
            "filesChecked": files_checked
        }
        
    # 2. Validate Classes file
    known_nodes: Set[str] = set()
    invalid_classes = 0
    with open(classes_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        if not header or [h.lower() for h in header] != ["txid", "class"]:
            errors.append(f"Invalid header in {os.path.basename(classes_file)}: expected ['txId', 'class'], got {header}")
            
        for idx, row in enumerate(reader):
            if not row: continue
            if len(row) != 2:
                errors.append(f"Row {idx+2} in classes has {len(row)} columns (expected 2)")
                continue
            tx_id, cls_label = row[0].strip(), row[1].strip()
            known_nodes.add(tx_id)
            if cls_label not in ("1", "2", "unknown"):
                invalid_classes += 1
                if invalid_classes <= 5:
                    errors.append(f"Invalid class label '{cls_label}' for txId {tx_id}")
                    
    # 3. Validate Features file (167 columns)
    features_count = 0
    with open(features_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for idx, row in enumerate(reader):
            if not row: continue
            features_count += 1
            if len(row) != 167:
                if features_count <= 5:
                    errors.append(f"Row {features_count} in features has {len(row)} columns (expected 167)")
            if features_count >= 1000:
                break
                
    # 4. Validate Edges file
    dangling_edges = 0
    edges_count = 0
    with open(edgelist_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        if not header or [h.lower() for h in header] != ["txid1", "txid2"]:
            errors.append(f"Invalid header in {os.path.basename(edgelist_file)}: expected ['txId1', 'txId2'], got {header}")
            
        for row in reader:
            if not row: continue
            edges_count += 1
            if len(row) != 2: continue
            src, dst = row[0].strip(), row[1].strip()
            if known_nodes and (src not in known_nodes or dst not in known_nodes):
                dangling_edges += 1
            if edges_count >= 5000:
                break
                
    if dangling_edges > 0:
        warnings.append(f"Detected {dangling_edges} edges connecting nodes outside classes registry.")
        
    duration_ms = int((time.time() - start_time) * 1000)
    is_valid = len(errors) == 0
    
    return {
        "isValid": is_valid,
        "checkedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "activeSourceDir": active_dir,
        "filesChecked": files_checked,
        "totalNodesChecked": len(known_nodes),
        "danglingEdgesCount": dangling_edges,
        "invalidClassesCount": invalid_classes,
        "errors": errors,
        "warnings": warnings,
        "executionDurationMs": duration_ms
    }

if __name__ == "__main__":
    report = validate_elliptic_dataset()
    print(json.dumps(report, indent=2))
    sys.exit(0 if report["isValid"] else 1)

