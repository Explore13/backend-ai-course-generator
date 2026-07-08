import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1783507711947 implements MigrationInterface {
    name = 'CreateUserTable1783507711947';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.createTable(new Table({
            name: 'user',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'clerk_id',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'first_name',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'last_name',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'image_url',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'email',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'phone_number',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'role',
                    type: 'enum',
                    enum: ['admin', 'user'],
                    default: "'user'",
                    isNullable: false,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'now()',
                    isNullable: false,
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'now()',
                    isNullable: false,
                },
                {
                    name: 'deletedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user');
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
    }
}
