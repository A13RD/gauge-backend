import { Request, Response, NextFunction } from 'express';
import { ListGamesUseCase } from '../../application/use-cases/games/ListGamesUseCase';
import { GetGameByIdUseCase } from '../../application/use-cases/games/GetGameByIdUseCase';
import { CreateGameUseCase } from '../../application/use-cases/games/CreateGameUseCase';
import { UpdateGameUseCase } from '../../application/use-cases/games/UpdateGameUseCase';
import { SoftDeleteGameUseCase } from '../../application/use-cases/games/SoftDeleteGameUseCase';

export class GameController {
  constructor(
    private readonly listGamesUseCase: ListGamesUseCase,
    private readonly getGameByIdUseCase: GetGameByIdUseCase,
    private readonly createGameUseCase: CreateGameUseCase,
    private readonly updateGameUseCase: UpdateGameUseCase,
    private readonly softDeleteGameUseCase: SoftDeleteGameUseCase
  ) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, genre, search, sort } = req.query;
      const result = await this.listGamesUseCase.execute({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        genre: typeof genre === 'string' ? genre : undefined,
        search: typeof search === 'string' ? search : undefined,
        sort: sort === 'recent' || sort === 'popular' ? sort : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const game = await this.getGameByIdUseCase.execute(id);
      res.status(200).json(game);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, releaseDate, genreId, bannerUrl } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverFile = files?.['image']?.[0] || req.file;
      const bannerFile = files?.['banner']?.[0];

      const created = await this.createGameUseCase.execute(
        {
          title,
          description,
          releaseDate,
          genreId,
          bannerUrl,
        },
        coverFile,
        bannerFile
      );

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { title, description, releaseDate, genreId, bannerUrl } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverFile = files?.['image']?.[0] || req.file;
      const bannerFile = files?.['banner']?.[0];

      const updated = await this.updateGameUseCase.execute(
        id,
        {
          title,
          description,
          releaseDate,
          genreId,
          bannerUrl,
        },
        coverFile,
        bannerFile
      );

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.softDeleteGameUseCase.execute(id);
      res.status(200).json({
        message: 'Videojuego eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };
}
