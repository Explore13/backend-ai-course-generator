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

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);

  constructor(
    @Inject('CLERK_CLIENT')
    private readonly clerk: ClerkClient,
  ) {}

  async deleteAllUsers() {
    const isProduction = this.isProdEnv();
    if (isProduction)
      throw new BadRequestException('You can not use this in Production');

    let deleted = 0;

    while (true) {
      const { data } = await this.clerk.users.getUserList({
        limit: 50,
      });

      if (!data.length) break;

      await Promise.all(
        data.map(async (user) => {
          await this.clerk.users.deleteUser(user.id);
          deleted++;

          this.logger.log(`Deleted ${user.emailAddresses[0]?.emailAddress}`);
        }),
      );
    }

    return {
      success: true,
      deleted,
    };
  }

  /**
   * IMPORT USERS FROM CSV
   */
  async importUsers() {
    const isProduction = this.isProdEnv();
    if (isProduction)
      throw new BadRequestException('You can not use this in Production');

    const csvPath = path.join(
      process.cwd(),
      'src',
      'database',
      'migrations',
      'users.csv',
    );

    if (!fs.existsSync(csvPath)) {
      this.logger.error(`CSV file not found at ${csvPath}`);

      return {
        imported: 0,
        failed: 0,
        error: `CSV file not found at ${csvPath}`,
      };
    }

    const rows: any[] = [];

    try {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csvParser())
          .on('data', (row) => rows.push(row))
          .on('end', () => resolve())
          .on('error', reject);
      });
    } catch (error: any) {
      this.logger.error(`Failed to read CSV file: ${error.message}`);

      return {
        imported: 0,
        failed: 0,
        error: `Failed to read CSV file: ${error.message}`,
      };
    }

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
              Authorization: `Bearer ${
                process.env.NODE_ENV === 'production'
                  ? process.env.CLERK_SECRET_KEY_PROD
                  : process.env.CLERK_SECRET_KEY_DEV
              }`,
            },
          },
        );

        imported++;

        this.logger.log(`Imported ${row.primary_email_address}`);
      } catch (e: any) {
        failed++;

        this.logger.error(
          `${row.primary_email_address} -> ${
            e.response?.data?.errors?.[0]?.message ?? e.message
          }`,
        );
      }
    }

    return {
      imported,
      failed,
    };
  }

  private isProdEnv() {
    return (
      process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod'
    );
  }
}
