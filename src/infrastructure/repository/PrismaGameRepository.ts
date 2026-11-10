import { Prisma, PrismaClient } from '@prisma/client';
import { Game } from '../../domain/models/Game';
import { GameFilterOptions, PaginatedResult } from '../../domain/models/Pagination';
import {
  CreateGameData,
  IGameRepository,
  UpdateGameData,
} from '../../domain/repository/IGameRepository';
import prismaInstance from '../db/prisma';

type GameWithRelations = Prisma.GameGetPayload<{
  include: {
    genre: true;
    reviews: {
      include: {
        user: {
          select: { id: true; name: true };
        };
      };
    };
  };
}>;

export class PrismaGameRepository implements IGameRepository {
  constructor(private readonly prisma: PrismaClient = prismaInstance) {}

  private mapToDomain(gameWithRelations: GameWithRelations): Game {
    const reviews = gameWithRelations.reviews
      ? gameWithRelations.reviews.map((r) => ({
          id: r.id,
          userId: r.userId,
          user: r.user ? { id: r.user.id, name: r.user.name } : undefined,
          gameId: r.gameId,
          rating: r.rating,
          content: r.content,
          hoursPlayed: r.hoursPlayed,
          isDeleted: r.isDeleted,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }))
      : [];

    let averageRating: number | null = null;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, cur) => acc + (cur.rating || 0), 0);
      averageRating = Math.round((sum / reviews.length) * 10) / 10;
    }

    return {
      id: gameWithRelations.id,
      title: gameWithRelations.title,
      description: gameWithRelations.description,
      coverUrl: gameWithRelations.coverUrl,
      bannerUrl: gameWithRelations.bannerUrl,
      releaseDate: gameWithRelations.releaseDate,
      genreId: gameWithRelations.genreId,
      genre: gameWithRelations.genre
        ? {
            id: gameWithRelations.genre.id,
            name: gameWithRelations.genre.name,
            slug: gameWithRelations.genre.slug,
            createdAt: gameWithRelations.genre.createdAt,
            updatedAt: gameWithRelations.genre.updatedAt,
          }
        : undefined,
      isDeleted: gameWithRelations.isDeleted,
      createdAt: gameWithRelations.createdAt,
      updatedAt: gameWithRelations.updatedAt,
      reviews,
      averageRating,
    };
  }

  async findMany(options: GameFilterOptions): Promise<PaginatedResult<Game>> {
    const { page = 1, limit = 10, genre, search, sort } = options;
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    const take = Math.max(1, limit);

    const where: Prisma.GameWhereInput = {
      isDeleted: false,
    };

    if (genre && genre.trim() !== '') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        genre.trim()
      );
      if (isUuid) {
        where.genreId = genre.trim();
      } else {
        where.genre = {
          slug: genre.trim().toLowerCase(),
        };
      }
    }

    if (search && search.trim() !== '') {
      where.title = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    let orderBy: Prisma.GameOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'recent') {
      orderBy = { releaseDate: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { reviews: { _count: 'desc' } };
    }

    const [total, games] = await Promise.all([
      this.prisma.game.count({ where }),
      this.prisma.game.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          genre: true,
          reviews: {
            where: { isDeleted: false },
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
            take: 5,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    return {
      data: games.map((g) => this.mapToDomain(g)),
      pagination: {
        total,
        currentPage: page,
        limit: take,
        totalPages,
      },
    };
  }

  async findById(id: string): Promise<Game | null> {
    const game = await this.prisma.game.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        genre: true,
        reviews: {
          where: { isDeleted: false },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!game) return null;
    return this.mapToDomain(game);
  }

  async create(data: CreateGameData): Promise<Game> {
    const game = await this.prisma.game.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        coverUrl: data.coverUrl,
        bannerUrl: data.bannerUrl,
        releaseDate: data.releaseDate,
        genreId: data.genreId,
      },
      include: {
        genre: true,
        reviews: {
          where: { isDeleted: false },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return this.mapToDomain(game);
  }

  async update(id: string, data: UpdateGameData): Promise<Game> {
    const updatePayload: Prisma.GameUpdateInput = {};

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined) updatePayload.description = data.description.trim();
    if (data.coverUrl !== undefined) updatePayload.coverUrl = data.coverUrl;
    if (data.bannerUrl !== undefined) updatePayload.bannerUrl = data.bannerUrl;
    if (data.releaseDate !== undefined) updatePayload.releaseDate = data.releaseDate;
    if (data.genreId !== undefined) {
      updatePayload.genre = { connect: { id: data.genreId } };
    }

    const updated = await this.prisma.game.update({
      where: { id },
      data: updatePayload,
      include: {
        genre: true,
        reviews: {
          where: { isDeleted: false },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return this.mapToDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.game.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
