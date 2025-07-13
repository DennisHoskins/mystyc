import { Controller, Get, Post, UseGuards, Param, Body, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { FirebaseUser } from '@/common/interfaces/firebase-user.interface';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { ContentService } from '@/content/content.service';
import { WebsiteContentService } from '@/content/website-content.service';
import { UserContentService } from '@/content/user-content.service';
import { Content } from '@/common/interfaces/content.interface';
import { AdminController } from './admin.controller';
import { CreateContentDto } from '@/content/dto/create-content.dto';
import { logger } from '@/common/util/logger';

@Controller('admin/content')
export class AdminContentController extends AdminController<Content> {
  protected serviceName = 'Content';
  
  constructor(
    protected service: ContentService,
    private readonly websiteContentService: WebsiteContentService,
    private readonly userContentService: UserContentService,
  ) {
    super();
  }

  /**
   * Creates contet from OpenAI
   * @param prompt: The prompt sent to OpenAI to generate the content
   * @returns Promise<Content> - New content object
   */
  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createContent(
    @Body() createContentDto: CreateContentDto,
    @FirebaseUserDecorator() user: FirebaseUser
  ): Promise<Content> {
    const prompt = createContentDto.prompt || "This is my default prompt";

    logger.info('Admin create Content', {
      adminUid: user.uid,
      prompt: 'prompt: ' + prompt,
    }, 'AdminContentController');

    const today = new Date().toISOString().split('T')[0];
    const result = await this.userContentService.generateUserContent(today, user.uid);

    return result;
  }
}