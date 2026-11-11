import { IGenreRepository } from '../../../domain/repository/IGenreRepository';
import { Genre } from '../../../domain/models/Genre';

export class ListGenresUseCase {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(): Promise<Genre[]> {
    return this.genreRepository.findAll();
  }
}
