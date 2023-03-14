import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getOrmConfiguration } from './common/config/orm-config';
import { getConfigFromEnv } from './common/config/configuration.dto';
import { LoanModule } from './modules/loan/loan.module';
import { UserModule } from './modules/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    LoanModule,
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      load: [getConfigFromEnv],
    }),
    // @ts-ignore
    UserModule,
    TypeOrmModule.forRoot(getOrmConfiguration()),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
