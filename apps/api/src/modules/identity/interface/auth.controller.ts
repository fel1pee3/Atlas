import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { ZodValidationPipe } from '../../../shared/http/zod-validation.pipe';
import { LoginSchema, RefreshSchema, RegisterSchema } from './auth.schemas';
import type { LoginInput, RefreshInput, RegisterInput } from './auth.schemas';

/**
 * Endpoints de autenticação (docs/17_API_Design.md §auth).
 * POST /auth/register | /auth/login | /auth/refresh | /auth/logout
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  register(@Body() body: RegisterInput) {
    return this.auth.register(body.email, body.password);
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  login(@Body() body: LoginInput) {
    return this.auth.login(body.email, body.password);
  }

  @Post('refresh')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(RefreshSchema))
  refresh(@Body() body: RefreshInput) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(RefreshSchema))
  async logout(@Body() body: RefreshInput): Promise<void> {
    await this.auth.logout(body.refreshToken);
  }
}
