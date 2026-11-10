import { IGameRepository } from '../../../domain/repository/IGameRepository';
import { Game } from '../../../domain/models/Game';
import { GameFilterOptions, PaginatedResult } from '../../../domain/models/Pagination';
import { BadRequestError } from '../../errors/appErrors';

export class ListGamesUseCase {
  constructor(private readonly gameRepository: IGameRepository) {}

  async execute(options: GameFilterOptions): Promise<PaginatedResult<Game>> {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;

    if (isNaN(page) || page < 1) {
      throw new BadRequestError('El parámetro "page" debe ser un número entero mayor o igual a 1');
    }

    if (isNaN(limit) || limit < 1) {
      throw new BadRequestError('El parámetro "limit" debe ser un número entero mayor o igual a 1');
    }

    const maxLimit = Math.min(limit, 50);

    return this.gameRepository.findMany({
      page: Math.floor(page),
      limit: Math.floor(maxLimit),
      genre: options.genre,
      search: options.search,
      sort: options.sort,
    });
  }
}
