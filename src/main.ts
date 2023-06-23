import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { ServerOptions } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';

export class SocketAdapter extends IoAdapter {
  createIOServer(
    port: number,
    options?: ServerOptions & {
      namespace?: string;
      server?: any;
    },
  ) {
    const server = super.createIOServer(port, { ...options, cors: true });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new SocketAdapter(app));

  /**
   * cors
   */
  app.enableCors({
    origin: true,
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
  });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fantasy Sports - API Docs')
    .setDescription('Swagger apis for managing Fantasy Sports.')
    .addBearerAuth({ type: 'http', bearerFormat: 'JWT', scheme: 'bearer' })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const configService: ConfigService = app.get(ConfigService);

  await app.listen(
    configService.port,
    () => `server started on ${configService.port}`,
  );
}
bootstrap();
