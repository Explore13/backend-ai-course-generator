import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCourseListTable1000000000001 implements MigrationInterface {
  name = 'CreateCourseListTable1000000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'course_lists',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'course_id',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'level',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'include_video',
            type: 'varchar',
            default: "'Yes'",
            isNullable: false,
          },
          {
            name: 'course_output',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'clerk_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'course_banner',
            type: 'varchar',
            default: "'/placeholder.png'",
            isNullable: true,
          },
          {
            name: 'publish',
            type: 'boolean',
            default: false,
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
      }),
    );

    // FK mapping course_list.clerk_id -> user.clerk_id
    await queryRunner.createForeignKey(
      'course_lists',
      new TableForeignKey({
        columnNames: ['clerk_id'],
        referencedColumnNames: ['clerk_id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'FK_course_list_clerk_id',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('course_lists');
    const fk = table?.foreignKeys.find(
      (f) => f.name === 'FK_course_list_clerk_id',
    );
    if (fk) {
      await queryRunner.dropForeignKey('course_lists', fk);
    }
    await queryRunner.dropTable('course_lists');
  }
}
