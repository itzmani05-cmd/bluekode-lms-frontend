import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: 'http://localhost:5173', credentials: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Training Management System')
    .setDescription('API Description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('APIs')
    .build();
  SwaggerModule.setup('api', app, () => SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 5500);
}
bootstrap();
