import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';
import { WebSocketModule } from './websocket/websocket.module';
import { RedisModule } from 'nestjs-redis';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    WebSocketModule,
    ConfigModule.forRoot(),
    RedisModule.register({
      host: process.env.redis_host,
      port: 40507,
      password: process.env.redis_password,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
