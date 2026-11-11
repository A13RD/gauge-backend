import { IGenreRepository } from '../../../domain/repository/IGenreRepository';
import { Genre } from '../../../domain/models/Genre';
import { BadRequestError, ConflictError, NotFoundError } from '../../errors/appErrors';

export interface UpdateGenreDTO {
  name?: string;
  slug?: string;
}

export class UpdateGenreUseCase {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(id: string, dto: UpdateGenreDTO): Promise<Genre> {
    const genre = await this.genreRepository.findById(id);
    if (!genre) {
      throw new NotFoundError('Género no encontrado');
    }

    if (dto.name !== undefined) {
      if (dto.name.trim().length < 2) {
        throw new BadRequestError('El nombre del género debe contener al menos 2 caracteres');
      }
      const existingByName = await this.genreRepository.findByName(dto.name.trim());
      if (existingByName && existingByName.id !== id) {
        throw new ConflictError(`Ya existe otro género con el nombre "${dto.name.trim()}"`);
      }
    }

    if (dto.slug !== undefined) {
      const normalizedSlug = dto.slug.toLowerCase().trim();
      const existingBySlug = await this.genreRepository.findBySlug(normalizedSlug);
      if (existingBySlug && existingBySlug.id !== id) {
        throw new ConflictError(`Ya existe otro género con el slug "${normalizedSlug}"`);
      }
    }

    return this.genreRepository.update(id, {
      name: dto.name ? dto.name.trim() : undefined,
      slug: dto.slug ? dto.slug.toLowerCase().trim() : undefined,
    });
  }
}
