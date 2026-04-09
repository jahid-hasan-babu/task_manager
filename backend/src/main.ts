import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], 
  });


  app.use(compression({
    level: 4, 
    threshold: 512, 
  }));


  app.enableCors({
    origin: [
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://localhost:3001',
      
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });


  app.getHttpAdapter().getInstance().disable('x-powered-by');


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on http://localhost:${port}`);
}
bootstrap();
