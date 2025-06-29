import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../../database/entities/user.entity';
import { EmailModule } from '../../shared/email/email.module';
import { LoggerModule } from '../../shared/logger/logger.module';
import { 
  JwtStrategy, 
  LocalStrategy, 
  GoogleStrategy, 
  GitHubStrategy 
} from './strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwtExpiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    GitHubStrategy,
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
