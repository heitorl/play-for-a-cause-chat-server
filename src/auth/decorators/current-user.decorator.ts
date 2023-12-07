import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { AuthRequest } from '../models/AuthRequest';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User | undefined => {
    try {
      const request = context.switchToHttp().getRequest<AuthRequest>();

      return request.user;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return undefined;
    }
  },
);
