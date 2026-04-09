import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // suppress verbose logs in dev for speed
  });

  // ── Gzip compression — configured for speed (level 4) ──
  app.use(compression({
    level: 4, // 1 is fastest, 9 is best compression. 4 is a great middle ground for speed.
    threshold: 512, // Only compress responses larger than 512 bytes
  }));

  // ── CORS ────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:3002',
      'http://127.0.0.1:3002',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Disable fingerprinting header ────────────────────────────
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // ── Validation pipe ─────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend is running on http://localhost:${port}`);
}
bootstrap();
