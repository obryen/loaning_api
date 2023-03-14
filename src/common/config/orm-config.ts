import { EnvironmentVariables, getConfigFromEnv } from './configuration.dto';
import * as util from 'util';
import { join } from 'path';
import { config } from 'process';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseSeed1678700240483 } from '../../migrations/1678700240483-DatabaseSeed';

/**
 * Get orm configuration details
 * @returns TypeOrmModuleOptions
 */
export const getOrmConfiguration = (): TypeOrmModuleOptions => {
  const configuration = getConfigFromEnv();
  console.log('files  :', util.inspect(configuration))
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


function getMigrationDirectory(configs: EnvironmentVariables) {
  const directory = configs.environment === 'development' ? __dirname : __dirname;
  console.log('resolved dir', join(directory, 'migrations', '*.{ts,js}'));
  return join(directory, 'migration', '*.{ts,js}');
}
