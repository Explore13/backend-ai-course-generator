import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { ClerkClient } from '@clerk/backend';
import axios from 'axios';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

interface CsvRow {
  id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  primary_email_address?: string;
  primary_phone_number?: string;
  password_digest?: string;
  password_hasher?: string;
  [key: string]: any;
}

interface ImportResultRow extends CsvRow {
  status: 'success' | 'failed';
  reason?: string;
}

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);

  // Delay between Clerk API calls to avoid hitting rate limits (ms)
  private readonly RATE_LIMIT_DELAY_MS = 350;

  constructor(
    @Inject('CLERK_CLIENT')
    private readonly clerk: ClerkClient,
  ) {}

  // ---------------------------------------------------------------------
  // DELETE ALL USERS (HARD DELETE) - non-production only
  // ---------------------------------------------------------------------
  async deleteAllUsers() {
    this.assertNotProduction('deleteAllUsers');

    let deleted = 0;
    let failed = 0;
    const deletedEmails: string[] = [];
    const failures: Array<{ id: string; email?: string; reason: string }> = [];

    // Safety cap to avoid infinite loops in case of unexpected API behavior
    const MAX_ITERATIONS = 1000;
    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const { data } = await this.clerk.users.getUserList({ limit: 50 });
      if (!data.length) break;

      for (const user of data) {
        const email = user.emailAddresses?.[0]?.emailAddress;
        try {
          await this.clerk.users.deleteUser(user.id);
          deleted++;
          deletedEmails.push(email ?? user.id);
          this.logger.log(`Deleted ${email ?? user.id}`);
        } catch (e: any) {
          failed++;
          const reason =
            e?.errors?.[0]?.message ?? e?.message ?? 'Unknown error';
          failures.push({ id: user.id, email, reason });
          this.logger.error(
            `Failed to delete ${email ?? user.id} -> ${reason}`,
          );
        }
        await this.sleep(this.RATE_LIMIT_DELAY_MS);
      }
    }

    if (iterations >= MAX_ITERATIONS) {
      this.logger.warn(
        `deleteAllUsers stopped after reaching MAX_ITERATIONS (${MAX_ITERATIONS}). There may still be users left.`,
      );
    }

    return {
      success: true,
      deleted,
      failed,
      deletedEmails,
      failures,
    };
  }

  // ---------------------------------------------------------------------
  // IMPORT USERS FROM CSV - non-production only
  // ---------------------------------------------------------------------
  async importUsers() {
    this.assertNotProduction('importUsers');

    const csvPath = path.join(
      process.cwd(),
      'src',
      'database',
      'migrations',
      'failed.csv',
    );

    if (!fs.existsSync(csvPath)) {
      const error = `CSV file not found at ${csvPath}`;
      this.logger.error(error);
      return { imported: 0, failed: 0, error };
    }

    let rows: CsvRow[];
    try {
      rows = await this.readCsv(csvPath);
    } catch (error: any) {
      const message = `Failed to read CSV file: ${error.message}`;
      this.logger.error(message);
      return { imported: 0, failed: 0, error: message };
    }

    const secretKey =
      process.env.NODE_ENV === 'production'
        ? process.env.CLERK_SECRET_KEY_PROD
        : process.env.CLERK_SECRET_KEY_DEV;

    if (!secretKey) {
      const error = 'Missing Clerk secret key for current environment';
      this.logger.error(error);
      return { imported: 0, failed: 0, error };
    }

    const results: ImportResultRow[] = [];
    let imported = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        await axios.post(
          'https://api.clerk.com/v1/users',
          {
            external_id: row.id,
            first_name: row.first_name || undefined,
            last_name: row.last_name || undefined,
            username: row.username || undefined,
            email_address: row.primary_email_address
              ? [row.primary_email_address]
              : [],
            phone_number: row.primary_phone_number
              ? [row.primary_phone_number]
              : [],
            password_digest: row.password_digest || undefined,
            password_hasher: row.password_hasher || undefined,
            skip_password_checks: true,
            skip_password_requirement: true,
          },
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
          },
        );

        imported++;
        results.push({ ...row, status: 'success' });
        this.logger.log(`Imported ${row.primary_email_address}`);
      } catch (e: any) {
        failed++;
        const reason =
          e.response?.data?.errors?.[0]?.message ??
          e.message ??
          'Unknown error';
        results.push({ ...row, status: 'failed', reason });
        this.logger.error(`${row.primary_email_address} -> ${reason}`);
      }

      // Basic rate limiting between requests
      await this.sleep(this.RATE_LIMIT_DELAY_MS);
    }

    const { migrationDir, successPath, failedPath, summaryPath } =
      this.writeMigrationResults(results);

    this.logger.log(
      `Import finished. Imported: ${imported}, Failed: ${failed}. Results saved at ${migrationDir}`,
    );

    return {
      imported,
      failed,
      migrationDir,
      successCsv: successPath,
      failedCsv: failedPath,
      summaryJson: summaryPath,
    };
  }

  // ---------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------

  /**
   * Throws if the current environment is production.
   * This is the corrected guard - it explicitly checks for `production`,
   * rather than the previous inverted logic that checked for `development`/`dev`.
   */
  private assertNotProduction(actionName: string) {
    if (this.isProductionEnv()) {
      this.logger.warn(`Blocked attempt to run "${actionName}" in production`);
      throw new BadRequestException('You can not use this in Production');
    }
  }

  private isProductionEnv(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private readCsv(csvPath: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const rows: CsvRow[] = [];
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }

  /**
   * Writes success.csv, failed.csv and summary.json into a timestamped
   * folder under src/database/migrations/import-results/<timestamp>/
   */
  private writeMigrationResults(results: ImportResultRow[]) {
    const timestamp = this.getTimestamp();
    const migrationDir = path.join(
      process.cwd(),
      'src',
      'database',
      'migrations',
      'import-results',
      timestamp,
    );

    fs.mkdirSync(migrationDir, { recursive: true });

    const successRows = results.filter((r) => r.status === 'success');
    const failedRows = results.filter((r) => r.status === 'failed');

    const successPath = path.join(migrationDir, 'success.csv');
    const failedPath = path.join(migrationDir, 'failed.csv');
    const summaryPath = path.join(migrationDir, 'summary.json');

    const successHeaders = [
      'id',
      'first_name',
      'last_name',
      'username',
      'primary_email_address',
      'primary_phone_number',
    ];
    const failedHeaders = [...successHeaders, 'reason'];

    fs.writeFileSync(
      successPath,
      this.toCsv(successRows, successHeaders),
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

  private getTimestamp(): string {
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
  private toCsv(rows: Record<string, any>[], headers: string[]): string {
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
