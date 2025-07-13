import { Controller, Get, Post, UseGuards, Param, Body, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';
import { FirebaseUser } from '@/common/interfaces/firebase-user.interface';
import { FirebaseUser as FirebaseUserDecorator } from '@/common/decorators/user.decorator';
import { ContentService } from '@/content/content.service';
import { Content } from '@/common/interfaces/content.interface';
import { AdminController } from './admin.controller';
import { CreateContentDto } from '@/content/dto/create-content.dto';
import { logger } from '@/common/util/logger';

@Controller('admin/content')
export class AdminContentController extends AdminController<Content> {
  protected serviceName = 'Content';
  
  constructor(protected service: ContentService) {
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
  ) {

    console.log('🟢 POST generate route HIT!'); // Add this first line
    console.log('Body:', createContentDto); // Check if body is parsed
    console.log('User:', user); // Check if user is available    

    const prompt = createContentDto.prompt || "This is my default prompt";

    logger.info('Admin create Content', {
      adminUid: user.uid,
      prompt: 'prompt: ' + prompt,
    }, 'AdminContentController');

    return null;

  }

  // @Get(':id')
  // @UseGuards(FirebaseAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // async findById(@Param('id') id: string): Promise<Content> {
  //   // Prevent 'create' from being treated as an ID
  //   if (id === 'create') {
  //     throw new NotFoundException('Invalid content ID');
  //   }
  //   return super.findById(id);
  // }  
}