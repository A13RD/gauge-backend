import { IGameRepository } from '../../../domain/repository/IGameRepository';
import { NotFoundError } from '../../errors/appErrors';

export class SoftDeleteGameUseCase {
  constructor(private readonly gameRepository: IGameRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.gameRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Videojuego no encontrado o ya ha sido eliminado');
    }

    await this.gameRepository.softDelete(id);
  }
}
