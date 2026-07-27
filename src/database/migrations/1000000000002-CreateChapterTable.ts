import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateChaptersTable1000000000002 implements MigrationInterface {
  name = 'CreateChaptersTable1000000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'chapters',
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
          },
          {
            name: 'chapter_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'video_id',
            type: 'jsonb',
            default: "'[]'",
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
      }),
    );

    // FK mapping chapters.course_id -> course_list.course_id
    await queryRunner.createForeignKey(
      'chapters',
      new TableForeignKey({
        columnNames: ['course_id'],
        referencedColumnNames: ['course_id'],
        referencedTableName: 'course_lists',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'FK_chapters_course_id',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('chapters');
    const fk = table?.foreignKeys.find(
      (f) => f.name === 'FK_chapters_course_id',
    );
    if (fk) {
      await queryRunner.dropForeignKey('chapters', fk);
    }
    await queryRunner.dropTable('chapters');
  }
}
