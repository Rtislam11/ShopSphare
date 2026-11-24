
import { dataSourceOptions } from '@/config/database.config';
import { DataSource, MigrationExecutor } from 'typeorm';

const migrateRollbackAll = async (): Promise<void> => {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    console.log('Starting rollback of all migrations...');

    await dataSource.initialize();
    console.log('Database connected successfully.');

    const migrationExecutor = new MigrationExecutor(dataSource);
    const migrations = await migrationExecutor.getAllMigrations();

    if (migrations.length === 0) {
      console.log('No executed migrations found.');
      return;
    }

    console.log(`Found ${migrations.length} executed migrations.`);

    for (let i = 0; i < migrations.length; i++) {
      await migrationExecutor.undoLastMigration();
      console.log(`Rolled back migration ${i + 1}/${migrations.length}`);
    }

    console.log('All migrations rolled back successfully.');
  } catch (error) {
    console.error('Rollback all migrations failed:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

migrateRollbackAll();
