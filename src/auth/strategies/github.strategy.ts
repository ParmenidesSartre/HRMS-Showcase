import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-github';
import { UserService } from '../../user/user.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        'https://wnwgjn4d-3000.asse.devtunnels.ms/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { username, emails } = profile;
    const email = emails[0].value;

    if (!email) {
      throw new UnauthorizedException();
    }

    try {
      let user = await this.userService.findByEmail(email);

      if (!user) {
        user = await this.userService.createUser({
          email: email,
          password: '', // GitHub OAuth, no password required
          name: profile.displayName || username,
          role: 'User',
        });
      } else {
        user = await this.userService.updateUser(user.id, {
          name: profile.displayName || username,
        });
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
