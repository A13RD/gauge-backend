import { PrismaClient } from '@prisma/client';
import { Genre } from '../../domain/models/Genre';
import {
  CreateGenreData,
  IGenreRepository,
  UpdateGenreData,
} from '../../domain/repository/IGenreRepository';
import prismaInstance from '../db/prisma';

export class PrismaGenreRepository implements IGenreRepository {
  constructor(private readonly prisma: PrismaClient = prismaInstance) {}

  async findAll(): Promise<Genre[]> {
    const genres = await this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
    return genres;
  }

  async findById(id: string): Promise<Genre | null> {
    return this.prisma.genre.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Genre | null> {
    return this.prisma.genre.findUnique({
      where: { slug: slug.toLowerCase().trim() },
    });
  }

  async findByName(name: string): Promise<Genre | null> {
    return this.prisma.genre.findUnique({
      where: { name: name.trim() },
    });
  }

  async create(data: CreateGenreData): Promise<Genre> {
    return this.prisma.genre.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
      },
    });
  }

  async update(id: string, data: UpdateGenreData): Promise<Genre> {
    return this.prisma.genre.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.slug ? { slug: data.slug.toLowerCase().trim() } : {}),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.genre.delete({
      where: { id },
    });
  }

  async countGamesByGenre(genreId: string): Promise<number> {
    return this.prisma.game.count({
      where: {
        genreId,
        isDeleted: false,
      },
    });
  }
}
