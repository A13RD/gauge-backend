import { IGenreRepository } from '../../../domain/repository/IGenreRepository';
import { ConflictError, NotFoundError } from '../../errors/appErrors';

export class DeleteGenreUseCase {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(id: string): Promise<void> {
    const genre = await this.genreRepository.findById(id);
    if (!genre) {
      throw new NotFoundError('Género no encontrado');
    }

    const linkedGames = await this.genreRepository.countGamesByGenre(id);
    if (linkedGames > 0) {
      throw new ConflictError(
        `No es posible eliminar el género "${genre.name}" porque tiene ${linkedGames} videojuego(s) asociado(s)`
      );
    }

    await this.genreRepository.delete(id);
  }
}
