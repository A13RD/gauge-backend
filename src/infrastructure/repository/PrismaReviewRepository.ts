import { Prisma, PrismaClient } from '@prisma/client';
import { Review } from '../../domain/models/Review';
import { UserStats } from '../../domain/models/UserStats';
import {
  CreateReviewData,
  IReviewRepository,
  UpdateReviewData,
} from '../../domain/repository/IReviewRepository';
import prismaInstance from '../db/prisma';

type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: {
    user: {
      select: { id: true; name: true };
    };
    game: {
      include: {
        genre: true;
      };
    };
  };
}>;

export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaClient = prismaInstance) {}

  private mapToDomain(r: ReviewWithRelations): Review {
    return {
      id: r.id,
      userId: r.userId,
      user: r.user ? { id: r.user.id, name: r.user.name } : undefined,
      gameId: r.gameId,
      game: r.game
        ? {
            id: r.game.id,
            title: r.game.title,
            description: r.game.description,
            coverUrl: r.game.coverUrl,
            bannerUrl: r.game.bannerUrl,
            releaseDate: r.game.releaseDate,
            genreId: r.game.genreId,
            genre: r.game.genre
              ? {
                  id: r.game.genre.id,
                  name: r.game.genre.name,
                  slug: r.game.genre.slug,
                  createdAt: r.game.genre.createdAt,
                  updatedAt: r.game.genre.updatedAt,
                }
              : undefined,
            isDeleted: r.game.isDeleted,
            createdAt: r.game.createdAt,
            updatedAt: r.game.updatedAt,
          }
        : undefined,
      rating: r.rating,
      content: r.content,
      hoursPlayed: r.hoursPlayed,
      isDeleted: r.isDeleted,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async create(data: CreateReviewData): Promise<Review> {
    const review = await this.prisma.review.create({
      data: {
        userId: data.userId,
        gameId: data.gameId,
        rating: data.rating,
        content: data.content.trim(),
        hoursPlayed: data.hoursPlayed,
      },
      include: {
        user: { select: { id: true, name: true } },
        game: { include: { genre: true } },
      },
    });

    return this.mapToDomain(review);
  }

  async findById(id: string): Promise<Review | null> {
    const review = await this.prisma.review.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        user: { select: { id: true, name: true } },
        game: { include: { genre: true } },
      },
    });

    if (!review) return null;
    return this.mapToDomain(review);
  }

  async findByUser(userId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      include: {
        user: { select: { id: true, name: true } },
        game: { include: { genre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => this.mapToDomain(r));
  }

  async findAll(): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        user: { select: { id: true, name: true } },
        game: { include: { genre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => this.mapToDomain(r));
  }

  async update(id: string, data: UpdateReviewData): Promise<Review> {
    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        ...(data.rating !== undefined ? { rating: data.rating } : {}),
        ...(data.content !== undefined ? { content: data.content.trim() } : {}),
        ...(data.hoursPlayed !== undefined ? { hoursPlayed: data.hoursPlayed } : {}),
      },
      include: {
        user: { select: { id: true, name: true } },
        game: { include: { genre: true } },
      },
    });

    return this.mapToDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.review.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const reviews = await this.prisma.review.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      include: {
        game: {
          include: {
            genre: true,
          },
        },
      },
    });

    const totalReviews = reviews.length;
    const totalHours = reviews.reduce((sum, r) => sum + (r.hoursPlayed || 0), 0);

    const genreHoursMap = new Map<string, number>();

    for (const r of reviews) {
      const genreName = r.game?.genre?.name || 'General';
      const current = genreHoursMap.get(genreName) || 0;
      genreHoursMap.set(genreName, current + (r.hoursPlayed || 0));
    }

    const hoursByGenre = Array.from(genreHoursMap.entries()).map(([genre, hours]) => ({
      genre,
      hours,
    }));

    // Ordenar de mayor a menor horas
    hoursByGenre.sort((a, b) => b.hours - a.hours);

    return {
      totalHours,
      totalReviews,
      hoursByGenre,
    };
  }
}
