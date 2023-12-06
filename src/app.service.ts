import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}
  async getMessages(): Promise<string[]> {
    const messages = await this.redisService
      .getClient()
      .lrange('sendPublicMessage', 0, -1);

    return messages.map((message) => JSON.parse(message));
  }

  async getPrivateMessages(
    userId1: string,
    userId2: string,
  ): Promise<string[]> {
    const redisClient = await this.redisService.getClient();

    const messages1 = await redisClient.lrange(
      `user:${userId1}:messages`,
      0,
      -1,
    );
    const messages2 = await redisClient.lrange(
      `user:${userId2}:messages`,
      0,
      -1,
    );

    const allMessages = [...messages1, ...messages2]
      .map((message) => JSON.parse(message))
      .sort((a, b) => a.timestamp - b.timestamp);

    return allMessages;
  }
}
