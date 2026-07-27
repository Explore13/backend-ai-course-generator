import * as fs from 'fs';
import * as path from 'path';

export interface CsvResultRow {
  status: 'success' | 'failed';
  reason?: string;
  [key: string]: any;
}

export class CsvResultsUtil {
  /**
   * Writes success.csv, failed.csv, and summary.json into a timestamped
   * folder under src/database/migrations/import-results/<prefix>-<timestamp>/
   */
  static writeMigrationResults(prefix: string, results: CsvResultRow[], headers: string[]) {
    const timestamp = this.getTimestamp();
    const folderName = `${prefix}-${timestamp}`;
    const migrationDir = path.join(
      process.cwd(),
      'src',
      'database',
      'migrations',
      'import-results',
      folderName,
    );

    fs.mkdirSync(migrationDir, { recursive: true });

    const successRows = results.filter((r) => r.status === 'success');
    const failedRows = results.filter((r) => r.status === 'failed');

    const successPath = path.join(migrationDir, 'success.csv');
    const failedPath = path.join(migrationDir, 'failed.csv');
    const summaryPath = path.join(migrationDir, 'summary.json');

    const failedHeaders = [...headers, 'reason'];

    fs.writeFileSync(
      successPath,
      this.toCsv(successRows, headers),
      'utf-8',
    );
    fs.writeFileSync(
      failedPath,
      this.toCsv(failedRows, failedHeaders),
      'utf-8',
    );

    const summary = {
      timestamp,
      total: results.length,
      imported: successRows.length,
      failed: failedRows.length,
      successCsv: successPath,
      failedCsv: failedPath,
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    return { migrationDir, successPath, failedPath, summaryPath };
  }

  static getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
      `_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
    );
  }

  /**
   * Minimal, dependency-free CSV writer with proper escaping.
   */
  static toCsv(rows: Record<string, any>[], headers: string[]): string {
    const escape = (value: any): string => {
      if (value === undefined || value === null) return '';
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = headers.join(',');
    const lines = rows.map((row) =>
      headers.map((h) => escape(row[h])).join(','),
    );

    return [headerLine, ...lines].join('\n');
  }
}
