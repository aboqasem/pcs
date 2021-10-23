import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RetrievePasswordDto, SignInDto, UserDto } from '@pcs/shared-data-access';
import { Request } from 'express';
import { config } from 'src/config/config';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserAuth } from 'src/modules/auth/decorators/user-auth.decorator';
import { BadPayloadException } from 'src/shared/exceptions/bad-payload.exception';
import { LocalSignInGuard } from './guards/local-sign-in.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('sign-in')
  @UseGuards(LocalSignInGuard)
  async signIn(@Body() dto: SignInDto, @Req() req: Request): Promise<UserDto> {
    if (dto.rememberMe) {
      req.session.cookie.maxAge = config.LONG_COOKIE_MAX_AGE;
    } else {
      req.session.cookie.maxAge = config.SHORT_COOKIE_MAX_AGE;
    }

    return req.user!;
  }

  @Post('sign-out')
  @UserAuth()
  async signOut(@Req() req: Request): Promise<true> {
    req.logOut();

    return true;
  }

  @Post('retrieve-password')
  async retrievePassword(@Body() dto: RetrievePasswordDto): Promise<true> {
    const foundAndSent = await this.authService.sendOwnPassword(dto.email);

    if (!foundAndSent) {
      throw new BadPayloadException({ email: { message: 'Does not exist' } });
    }

    return true;
  }
}
