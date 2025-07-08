import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Content, ContentDocument } from './schemas/content.schema';
import { Content as ContentInterface } from '@/common/interfaces/content.interface';
import { BaseAdminQueryDto } from '@/admin/dto/base-admin-query.dto';
import { logger } from '@/common/util/logger';

@Injectable()
export class ContentService {
  private readonly contentTemplates = [
    {
      title: "Embrace the Mystic Dawn",
      message: "Today's energy brings new beginnings. Trust your intuition as the universe aligns in your favor.",
      imageUrl: "https://images.unsplash.com/photo-1516912481808-3406841bd33c",
      linkUrl: "https://mystyc.app",
      linkText: "Explore Your Path",
      data: [
        { "Dawn's Whisper":       "The first light invites your heart to awaken." },
        { "Soul Horizon":         "Beyond the sky lies a path only you can see." },
        { "Awakening":            "Let the gentle breeze stir your hidden dreams." },
        { "Golden Ray":           "Bathe in warmth as opportunities unfold." },
        { "Morning Aura":         "Your spirit glows with untapped potential." },
        { "Celestial Greeting":   "Stars salute your journey at dawn’s edge." },
      ],
    },
    {
      title: "Celestial Harmony Awaits",
      message: "The stars whisper secrets of transformation. Open your heart to unexpected possibilities.",
      imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3",
      linkUrl: "https://mystyc.app",
      linkText: "Discover More",
      data: [
        { "Star Song":            "Hear constellations hum the melody of your soul." },
        { "Ethereal Echo":        "Cosmic winds carry truths beyond mortal sight." },
        { "Galactic Veil":        "Lift illusions to reveal the universe’s design." },
        { "Starlight Touch":      "A fleeting spark guides your inner compass." },
        { "Orbital Dance":        "Move in sync with the heavens’ silent rhythm." },
        { "Moonlit Assurance":    "In silver glow, find comfort and clarity." },
      ],
    },
    {
      title: "Ancient Wisdom Calls",
      message: "Listen to the echoes of the past. Today holds the key to unlocking your inner power.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      linkUrl: "https://mystyc.app",
      linkText: "Unveil Your Destiny",
      data: [
        { "Echo of Ages":         "Ancestors’ voices guide you through time." },
        { "Rune Pulse":           "Sacred symbols awaken dormant knowledge." },
        { "Timeless Path":        "Walk the road that transcends all eras." },
        { "Hidden Glyph":         "Seek the mark that reveals your destiny." },
        { "Stone Chant":          "Feel the earth murmuring age-old mantras." },
        { "Elder’s Gift":         "Receive the blessing passed down through generations." },
      ],
    },
  ];
  
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {}

  /**
   * Get or generate content for a specific date
   */
  async getOrGenerateContent(date: string): Promise<ContentInterface> {
    logger.info('Getting or generating content', { date }, 'ContentService');

    // Check if content exists
    const existing = await this.findByDate(date);
    if (existing) {
      logger.info('Content found in database', { date }, 'ContentService');
      return existing;
    }

    // Generate new content
    return this.generateContent(date);
  }

  /**
   * Find content by date
   */
  async findByDate(date: string): Promise<ContentInterface | null> {
    logger.debug('Finding content by date', { date }, 'ContentService');

    const content = await this.contentModel.findOne({ date }).exec();

    if (!content) {
      logger.debug('Content not found', { date }, 'ContentService');
      return null;
    }

    return this.transformToInterface(content);
  }

  /**
   * Generate content for a specific date
   */
  async generateContent(date: string): Promise<ContentInterface> {
    logger.info('Generating new content', { date }, 'ContentService');

    const startTime = Date.now();

    try {
      // Use date as seed for consistent content
      const dateHash = date.split('-').reduce((acc, part) => acc + parseInt(part), 0);
      const template = this.contentTemplates[dateHash % this.contentTemplates.length];

      const dataItems = template.data.map(obj => {
        const key = Object.keys(obj)[0];
        return { key, value: obj[key] };
      });      

      const contentData = {
        date,
        ...template,
        data: dataItems,
        sources: ['static'],
        status: 'generated' as const,
        generatedAt: new Date(),
        generationDuration: Date.now() - startTime
      };

      const content = new this.contentModel(contentData);
      const saved = await content.save();

      logger.info('Content generated successfully', { 
        date, 
        duration: saved.generationDuration 
      }, 'ContentService');

      return this.transformToInterface(saved);
    } catch (error) {
      logger.error('Content generation failed', {
        date,
        error: error.message
      }, 'ContentService');

      // Save failed attempt
      const failedContent = new this.contentModel({
        date,
        title: 'Content Unavailable',
        message: 'We apologize, today\'s mystical insights are clouded. Please return tomorrow.',
        imageUrl: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229',
        data: [],
        sources: ['static'],
        status: 'failed',
        error: error.message,
        generatedAt: new Date(),
        generationDuration: Date.now() - startTime
      });

      const saved = await failedContent.save();
      return this.transformToInterface(saved);
    }
  }

  /**
   * Get today's content (convenience method)
   */
  async getTodaysContent(): Promise<ContentInterface> {
    const today = new Date().toISOString().split('T')[0];
    return this.getOrGenerateContent(today);
  }

  /**
   * Find content by ID (admin)
   */
  async findById(id: string): Promise<ContentInterface | null> {
    logger.debug('Finding content by ID', { id }, 'ContentService');

    try {
      const content = await this.contentModel.findById(id).exec();
      if (!content) return null;
      return this.transformToInterface(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get total count (admin)
   */
  async getTotal(): Promise<number> {
    return await this.contentModel.countDocuments();
  }

  /**
   * Find all content with pagination (admin)
   */
  async findAll(query: BaseAdminQueryDto): Promise<ContentInterface[]> {
    const { limit = 100, offset = 0, sortBy = 'date', sortOrder = 'desc' } = query;

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const contents = await this.contentModel
      .find()
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    return contents.map(content => this.transformToInterface(content));
  }

  /**
   * Transform document to interface
   */
  private transformToInterface(doc: ContentDocument): ContentInterface {
    return {
      _id: doc._id.toString(),
      date: doc.date,
      title: doc.title,
      message: doc.message,
      data: doc.data,
      imageUrl: doc.imageUrl,
      linkUrl: doc.linkUrl,
      linkText: doc.linkText,
      sources: doc.sources,
      status: doc.status,
      error: doc.error,
      generatedAt: doc.generatedAt,
      generationDuration: doc.generationDuration,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}