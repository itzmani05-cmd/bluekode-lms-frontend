import { NestFactory } from '@nestjs/core';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config= new DocumentBuilder()
    .setTitle('TMO - Phase 1')
    .setDescription('API Description')
    .setVersion('1.0')
    .addTag('APIs')
    .build();
  const documentFactory=()=>SwaggerModule.createDocument(app,config);
  SwaggerModule.setup('api',app,documentFactory);
  await app.listen(5500);
}
bootstrap();
