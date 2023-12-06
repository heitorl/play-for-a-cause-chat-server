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

    const messages1 = await redisClient.zrange(
      `private:messages:${userId1}:${userId2}`,
      0,
      -1,
      'WITHSCORES',
    );
    const messages2 = await redisClient.zrange(
      `private:messages:${userId2}:${userId1}`,
      0,
      -1,
      'WITHSCORES',
    );

    const allMessages: Array<{ message: any; score: number }> = [];
    for (let i = 0; i < messages1.length; i += 2) {
      allMessages.push({
        message: JSON.parse(messages1[i]),
        score: parseFloat(messages1[i + 1]),
      });
    }
    for (let i = 0; i < messages2.length; i += 2) {
      allMessages.push({
        message: JSON.parse(messages2[i]),
        score: parseFloat(messages2[i + 1]),
      });
    }

    allMessages.sort((a, b) => a.score - b.score);

    const formattedMessages = allMessages.map((item) => item.message);
    return formattedMessages;
  }
}
