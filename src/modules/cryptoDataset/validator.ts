import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { CryptoValidationReport } from './types';

export interface DatasetPathConfig {
  classesPath: string;
  edgelistPath: string;
  featuresPath: string;
}

export class EllipticDatasetValidator {
  private config: DatasetPathConfig;

  constructor(config?: Partial<DatasetPathConfig>) {
    const defaultRawDir = path.resolve(process.cwd(), 'data', 'crypto', 'raw');
    const defaultSampleDir = path.resolve(process.cwd(), 'data', 'crypto', 'samples');

    // Auto-detect whether raw files exist, otherwise fall back to verified sample fixtures
    const rawClasses = path.join(defaultRawDir, 'elliptic_txs_classes.csv');
    const hasRaw = fs.existsSync(rawClasses);
    const activeDir = hasRaw ? defaultRawDir : defaultSampleDir;
    const prefix = hasRaw ? '' : '.sample';

    this.config = {
      classesPath: config?.classesPath || path.join(activeDir, `elliptic_txs_classes${prefix}.csv`),
      edgelistPath: config?.edgelistPath || path.join(activeDir, `elliptic_txs_edgelist${prefix}.csv`),
      featuresPath: config?.featuresPath || path.join(activeDir, `elliptic_txs_features${prefix}.csv`),
    };
  }

  public async validate(): Promise<CryptoValidationReport> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    const filesChecked: CryptoValidationReport['filesChecked'] = [];
    const headerValidations: CryptoValidationReport['headerValidations'] = [];
    const columnValidations: CryptoValidationReport['columnValidations'] = [];

    // 1. Validate File Existence & Basic Metadata
    const targets = [
      { key: 'classes', name: 'elliptic_txs_classes.csv', path: this.config.classesPath },
      { key: 'edgelist', name: 'elliptic_txs_edgelist.csv', path: this.config.edgelistPath },
      { key: 'features', name: 'elliptic_txs_features.csv', path: this.config.featuresPath },
    ];

    for (const target of targets) {
      if (!fs.existsSync(target.path)) {
        errors.push(`Missing critical dataset file: ${target.name} at ${target.path}`);
        filesChecked.push({
          fileName: target.name,
          exists: false,
          sizeBytes: 0,
          lineCount: 0,
          path: target.path,
        });
      } else {
        const stats = fs.statSync(target.path);
        if (stats.size === 0) {
          errors.push(`Dataset file is empty (0 bytes): ${target.name}`);
        }
        filesChecked.push({
          fileName: target.name,
          exists: true,
          sizeBytes: stats.size,
          lineCount: 0, // computed below
          path: target.path,
        });
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        checkedAt: new Date().toISOString(),
        filesChecked,
        headerValidations,
        columnValidations,
        integrityMetrics: {
          totalNodes: 0,
          totalEdges: 0,
          danglingEdgesCount: 0,
          invalidClassesCount: 0,
          nullOrNanFeaturesCount: 0,
        },
        errors,
        warnings,
        executionDurationMs: Date.now() - startTime,
      };
    }

    // 2. Validate Classes File (Header & Row Semantics)
    const knownTxIds = new Set<string>();
    let invalidClassesCount = 0;
    let classesLineCount = 0;

    const classesStream = readline.createInterface({
      input: fs.createReadStream(this.config.classesPath),
      crlfDelay: Infinity,
    });

    let isClassesHeader = true;
    for await (const line of classesStream) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      classesLineCount++;

      if (isClassesHeader) {
        isClassesHeader = false;
        const matches = trimmed.toLowerCase() === 'txid,class';
        headerValidations.push({
          fileName: 'elliptic_txs_classes.csv',
          expectedHeader: 'txId,class',
          actualHeader: trimmed,
          matches,
        });
        if (!matches) {
          errors.push(`Invalid header in classes file: expected "txId,class", received "${trimmed}"`);
        }
        continue;
      }

      const parts = trimmed.split(',');
      if (parts.length !== 2) {
        errors.push(`Row ${classesLineCount} in classes file has ${parts.length} columns (expected 2)`);
        continue;
      }

      const [txId, rawClass] = parts;
      knownTxIds.add(txId);

      if (rawClass !== '1' && rawClass !== '2' && rawClass !== 'unknown') {
        invalidClassesCount++;
        if (invalidClassesCount <= 5) {
          errors.push(`Invalid class label "${rawClass}" for txId ${txId} (expected '1', '2', or 'unknown')`);
        }
      }
    }

    // 3. Validate Features File (167 Columns: txId, time_step, 165 features)
    let featuresLineCount = 0;
    let nullOrNanFeaturesCount = 0;
    let sampleCols = 0;

    const featuresStream = readline.createInterface({
      input: fs.createReadStream(this.config.featuresPath),
      crlfDelay: Infinity,
    });

    for await (const line of featuresStream) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      featuresLineCount++;

      const parts = trimmed.split(',');
      sampleCols = parts.length;

      // The Elliptic features file has 167 numerical columns (1 txId + 1 time_step + 165 features)
      if (parts.length !== 167) {
        if (featuresLineCount <= 5) {
          errors.push(`Row ${featuresLineCount} in features file has ${parts.length} columns (expected 167)`);
        }
      }

      // Check time_step bounds (1 to 49)
      const timeStep = parseInt(parts[1], 10);
      if (isNaN(timeStep) || timeStep < 1 || timeStep > 49) {
        warnings.push(`Row ${featuresLineCount} has atypical time_step: ${parts[1]}`);
      }

      // Sample first 10 numerical features for NaN check
      for (let i = 2; i < Math.min(parts.length, 12); i++) {
        if (isNaN(parseFloat(parts[i]))) {
          nullOrNanFeaturesCount++;
        }
      }

      if (featuresLineCount >= 1000) break; // Sampling guard for huge files
    }

    columnValidations.push({
      fileName: 'elliptic_txs_features.csv',
      expectedColumns: 167,
      actualColumns: sampleCols,
      matches: sampleCols === 167,
    });

    // 4. Validate Edge List File & Check for Dangling References
    let edgelistLineCount = 0;
    let danglingEdgesCount = 0;
    let isEdgeHeader = true;

    const edgelistStream = readline.createInterface({
      input: fs.createReadStream(this.config.edgelistPath),
      crlfDelay: Infinity,
    });

    for await (const line of edgelistStream) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      edgelistLineCount++;

      if (isEdgeHeader) {
        isEdgeHeader = false;
        const matches = trimmed.toLowerCase() === 'txid1,txid2';
        headerValidations.push({
          fileName: 'elliptic_txs_edgelist.csv',
          expectedHeader: 'txId1,txId2',
          actualHeader: trimmed,
          matches,
        });
        if (!matches) {
          errors.push(`Invalid header in edge list: expected "txId1,txId2", received "${trimmed}"`);
        }
        continue;
      }

      const parts = trimmed.split(',');
      if (parts.length !== 2) {
        errors.push(`Row ${edgelistLineCount} in edge list has ${parts.length} columns (expected 2)`);
        continue;
      }

      const [src, dst] = parts;
      if (knownTxIds.size > 0) {
        if (!knownTxIds.has(src) || !knownTxIds.has(dst)) {
          danglingEdgesCount++;
        }
      }

      if (edgelistLineCount >= 5000) break; // Sample limit
    }

    // Update line counts
    filesChecked[0].lineCount = classesLineCount;
    filesChecked[1].lineCount = edgelistLineCount;
    filesChecked[2].lineCount = featuresLineCount;

    if (danglingEdgesCount > 0) {
      warnings.push(`Detected ${danglingEdgesCount} edge references to transaction IDs outside current node registry.`);
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      checkedAt: new Date().toISOString(),
      filesChecked,
      headerValidations,
      columnValidations,
      integrityMetrics: {
        totalNodes: knownTxIds.size,
        totalEdges: Math.max(0, edgelistLineCount - 1),
        danglingEdgesCount,
        invalidClassesCount,
        nullOrNanFeaturesCount,
      },
      errors,
      warnings,
      executionDurationMs: Date.now() - startTime,
    };
  }
}

