import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VerifyAccountExistsMiddleware implements NestMiddleware {
  constructor(private readonly prismaService: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email;

    const foundUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (foundUser)
      return res.status(409).json({ message: 'Email already exists.' });

    next();
  }
}
