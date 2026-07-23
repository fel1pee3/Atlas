import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { AuthController } from './interface/auth.controller';
import { AccessTokenGuard } from './interface/access-token.guard';

/**
 * Bounded context de Identidade/Autenticação (docs/09 §4).
 * Global para expor o AccessTokenGuard aos demais módulos sem reimportar o JwtModule.
 */
@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenGuard],
  // Exporta o JwtModule junto com o guard: como este módulo é @Global, o JwtService
  // fica disponível em qualquer módulo que use o AccessTokenGuard (ex.: EventsModule),
  // evitando o erro de dependência não resolvida (JwtService) fora do IdentityModule.
  exports: [AuthService, AccessTokenGuard, JwtModule],
})
export class IdentityModule {}
