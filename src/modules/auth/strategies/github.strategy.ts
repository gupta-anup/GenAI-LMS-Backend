import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('auth.githubClientId') || '',
      clientSecret: configService.get<string>('auth.githubClientSecret') || '',
      callbackURL: configService.get<string>('auth.githubCallbackUrl') || '',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    try {
      const { id, username, emails, displayName, photos } = profile;
      
      const user = await this.authService.validateOAuthUser({
        provider: 'github',
        providerId: id,
        email: emails?.[0]?.value || `${username}@github.local`,
        firstName: displayName?.split(' ')[0] || username || '',
        lastName: displayName?.split(' ').slice(1).join(' ') || '',
        avatar: photos?.[0]?.value,
        accessToken,
        refreshToken,
      });

      return user;
    } catch (error) {
      return false;
    }
  }
}
