import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

export class App {
  constructor() {}

  async initialize(): Promise<INestApplication> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
    });
    const configService = app.get(ConfigService);

  

    if (['staging', 'development'].includes(configService.get('ENVIRONMENT'))) {
      const options = new DocumentBuilder()
        .setTitle('Treehous API')
        .setDescription('API swagger spec')
        .addServer('http://')
        .addServer('https://')
        .addTag('treehous_api_v1')
        .build();

      const document = SwaggerModule.createDocument(app, options);

      SwaggerModule.setup('api', app, document);
    }

    return app;
  }
}
