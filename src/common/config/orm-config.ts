import { getConfigFromEnv } from './configuration.dto';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseSeed1678700240483 } from '../../migrations/1678700240483-DatabaseSeed';

/**
 * Get orm configuration details
 * @returns TypeOrmModuleOptions
 */
export const getOrmConfiguration = (): TypeOrmModuleOptions => {
  const configuration = getConfigFromEnv();
  return {
    type: 'postgres',
    host: configuration.dbHost,
    port: configuration.dbPort,
    username: configuration.dbUser,
    password: configuration.dbPassword,
    database: configuration.dbName,
    autoLoadEntities: true,
    migrationsTableName: "migrations",
    migrationsRun: true,
    migrations: [DatabaseSeed1678700240483],
    logging:true,
    synchronize: true
  };
  ;
};

