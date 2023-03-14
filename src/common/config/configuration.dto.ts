// import { plainToInstance } from 'class-transformer';
// import { IsBoolean, IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum EnvironmentEnum {
    Development = "development",
    Production = "production",
    Test = "test",
}

export class EnvironmentVariables {
    environment: EnvironmentEnum
    port: number;
    dbHost: string;
    dbPort: number;
    dbName: string;
    dbUser: string;
    dbPassword: string;
    typeormMigrations: boolean;
    typeormLogs: boolean;

}

export const getConfigFromEnv = (): EnvironmentVariables => ({
    environment: process.env.ENVIRONMENT as EnvironmentEnum || EnvironmentEnum.Development,
    port: parseInt(process.env.PORT || '3000', 10),
    dbHost: process.env.DATABASE_HOST,
    dbPort: parseInt(process.env.DATABASE_PORT),
    dbName: process.env.DATABASE_NAME,
    dbUser: process.env.DATABASE_USER,
    dbPassword: process.env.DATABASE_PASSWORD,
    typeormLogs: Boolean(process.env.TYPEORM_LOGGING),
    typeormMigrations: Boolean(process.env.TYPEORM_MIGRATIONSRUN),
});
