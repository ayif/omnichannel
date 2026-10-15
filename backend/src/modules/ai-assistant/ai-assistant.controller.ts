import { Body, Controller, Post } from '@nestjs/common';
import { Role } from '../../common/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AiAssistantService } from './ai-assistant.service';
import { AskAssistantDto } from './ai-assistant.dto';

@Controller('ai-assistant')
@Roles(Role.ADMIN, Role.STAFF)
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Post('ask')
  ask(@Body() body: AskAssistantDto, @CurrentUser() user: AuthenticatedUser) {
    return this.aiAssistantService.ask(body.message.trim(), user.sub);
  }
}
