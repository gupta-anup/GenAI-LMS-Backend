import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCourseTables1735462800000 implements MigrationInterface {
  name = 'CreateCourseTables1735462800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create courses table
    await queryRunner.createTable(
      new Table({
        name: 'courses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'difficulty',
            type: 'enum',
            enum: ['beginner', 'intermediate', 'advanced'],
            default: "'beginner'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['generating', 'completed', 'failed'],
            default: "'generating'",
          },
          {
            name: 'estimatedDuration',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'prompt',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'preferredDuration',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create lessons table
    await queryRunner.createTable(
      new Table({
        name: 'lessons',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'int',
          },
          {
            name: 'courseId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create videos table
    await queryRunner.createTable(
      new Table({
        name: 'videos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'youtubeId',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'duration',
            type: 'int',
          },
          {
            name: 'thumbnailUrl',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'lessonId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create quizzes table
    await queryRunner.createTable(
      new Table({
        name: 'quizzes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'lessonId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create questions table
    await queryRunner.createTable(
      new Table({
        name: 'questions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'question',
            type: 'text',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['multiple_choice', 'true_false', 'short_answer'],
            default: "'multiple_choice'",
          },
          {
            name: 'options',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'correctAnswer',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'quizId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'courses',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'lessons',
      new TableForeignKey({
        columnNames: ['courseId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'courses',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'videos',
      new TableForeignKey({
        columnNames: ['lessonId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'quizzes',
      new TableForeignKey({
        columnNames: ['lessonId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'questions',
      new TableForeignKey({
        columnNames: ['quizId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'quizzes',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(`CREATE INDEX idx_courses_user_id ON courses (userId)`);
    await queryRunner.query(`CREATE INDEX idx_courses_status ON courses (status)`);
    await queryRunner.query(`CREATE INDEX idx_lessons_course_id ON lessons (courseId)`);
    await queryRunner.query(`CREATE INDEX idx_videos_lesson_id ON videos (lessonId)`);
    await queryRunner.query(`CREATE INDEX idx_quizzes_lesson_id ON quizzes (lessonId)`);
    await queryRunner.query(`CREATE INDEX idx_questions_quiz_id ON questions (quizId)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('questions');
    await queryRunner.dropTable('quizzes');
    await queryRunner.dropTable('videos');
    await queryRunner.dropTable('lessons');
    await queryRunner.dropTable('courses');
  }
}
