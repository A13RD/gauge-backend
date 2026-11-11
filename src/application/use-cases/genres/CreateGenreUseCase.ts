import { IGenreRepository } from '../../../domain/repository/IGenreRepository';
import { Genre } from '../../../domain/models/Genre';
import { BadRequestError, ConflictError } from '../../errors/appErrors';

export interface CreateGenreDTO {
  name: string;
  slug?: string;
}

export class CreateGenreUseCase {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(dto: CreateGenreDTO): Promise<Genre> {
    if (!dto.name || dto.name.trim().length < 2) {
      throw new BadRequestError('El nombre del género debe contener al menos 2 caracteres');
    }

    const trimmedName = dto.name.trim();
    const slug =
      dto.slug && dto.slug.trim() !== ''
        ? dto.slug.toLowerCase().trim()
        : trimmedName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

    const existingByName = await this.genreRepository.findByName(trimmedName);
    if (existingByName) {
      throw new ConflictError(`Ya existe un género con el nombre "${trimmedName}"`);
    }

    const existingBySlug = await this.genreRepository.findBySlug(slug);
    if (existingBySlug) {
      throw new ConflictError(`Ya existe un género con el slug "${slug}"`);
    }

    return this.genreRepository.create({
      name: trimmedName,
      slug,
    });
  }
}
