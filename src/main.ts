import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

export const PORT: string | number = process.env.PORT || 9000;
export const urlPrefix = '/api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix(urlPrefix);

  app.use(helmet());
  const options = new DocumentBuilder()
    .setTitle('Node CSV App')
    .setDescription('Node CSV App description')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access_token')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${urlPrefix}/docs`, app, document);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT);
}
bootstrap();
