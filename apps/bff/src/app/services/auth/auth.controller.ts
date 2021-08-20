import { SignInUserDto, SignUpUserDto, UserDto } from '@myplatform/shared-data-access';
import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import config from 'src/app/config/config';
import { AuthService } from './auth.service';
import { LocalSignInGuard } from './guards/local-sign-in.guard';
import { SignedInGuard } from './guards/signed-in.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @Redirect('sign-in', HttpStatus.PERMANENT_REDIRECT)
  async signUp(@Body() dto: SignUpUserDto): Promise<void> {
    try {
      await this.authService.signUp(dto);
    } catch (e) {
      if (Array.isArray(e)) {
        throw new BadRequestException(e.map((error) => error.message));
      }
      throw e;
    }
  }

  @Post('sign-in')
  @UseGuards(LocalSignInGuard)
  signIn(@Req() req: Request, @Body() dto: SignInUserDto): UserDto {
    if (dto.rememberMe) {
      req.session.cookie.maxAge = config.LONG_COOKIE_MAX_AGE;
    } else {
      req.session.cookie.maxAge = config.SHORT_COOKIE_MAX_AGE;
    }

    return req.user!;
  }

  @Post('sign-out')
  @UseGuards(SignedInGuard)
  signOut(@Req() req: Request): Record<string, never> {
    req.logOut();
    return {};
  }
}
