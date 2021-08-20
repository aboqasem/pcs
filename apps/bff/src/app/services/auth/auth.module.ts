import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/app/resources/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionSerializer } from './session.serializer';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [UsersModule, TypeOrmModule, PassportModule.register({ session: true })],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
