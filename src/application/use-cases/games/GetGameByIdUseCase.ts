import { IGameRepository } from '../../../domain/repository/IGameRepository';
import { Game } from '../../../domain/models/Game';
import { NotFoundError } from '../../errors/appErrors';

export class GetGameByIdUseCase {
  constructor(private readonly gameRepository: IGameRepository) {}

  async execute(id: string): Promise<Game> {
    const game = await this.gameRepository.findById(id);
    if (!game) {
      throw new NotFoundError('Videojuego no encontrado o ha sido eliminado');
    }
    return game;
  }
}
