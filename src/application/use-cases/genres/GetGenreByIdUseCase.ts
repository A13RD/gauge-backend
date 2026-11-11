import { IGenreRepository } from '../../../domain/repository/IGenreRepository';
import { Genre } from '../../../domain/models/Genre';
import { NotFoundError } from '../../errors/appErrors';

export class GetGenreByIdUseCase {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findById(id);
    if (!genre) {
      throw new NotFoundError('Género no encontrado');
    }
    return genre;
  }
}
