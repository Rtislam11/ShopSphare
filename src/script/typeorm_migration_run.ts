
import { dataSourceOptions } from '@/config/database.config';
import { DataSource } from 'typeorm';

const migrateRun = async (): Promise<void> => {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    console.log('Starting database migrations...');

    await dataSource.initialize();
    console.log('Database connected successfully.');

    const migrations = await dataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('No pending migrations found.');
    } else {
      console.log('Migrations completed successfully:');

      migrations.forEach((migration) => {
        console.log(`- ${migration.name}`);
      });
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

migrateRun();
