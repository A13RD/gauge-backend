import { Request, Response, NextFunction } from 'express';
import { ListGenresUseCase } from '../../application/use-cases/genres/ListGenresUseCase';
import { GetGenreByIdUseCase } from '../../application/use-cases/genres/GetGenreByIdUseCase';
import { CreateGenreUseCase } from '../../application/use-cases/genres/CreateGenreUseCase';
import { UpdateGenreUseCase } from '../../application/use-cases/genres/UpdateGenreUseCase';
import { DeleteGenreUseCase } from '../../application/use-cases/genres/DeleteGenreUseCase';

export class GenreController {
  constructor(
    private readonly listGenresUseCase: ListGenresUseCase,
    private readonly getGenreByIdUseCase: GetGenreByIdUseCase,
    private readonly createGenreUseCase: CreateGenreUseCase,
    private readonly updateGenreUseCase: UpdateGenreUseCase,
    private readonly deleteGenreUseCase: DeleteGenreUseCase
  ) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const genres = await this.listGenresUseCase.execute();
      res.status(200).json(genres);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const genre = await this.getGenreByIdUseCase.execute(id);
      res.status(200).json(genre);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, slug } = req.body;
      const created = await this.createGenreUseCase.execute({ name, slug });
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { name, slug } = req.body;
      const updated = await this.updateGenreUseCase.execute(id, { name, slug });
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.deleteGenreUseCase.execute(id);
      res.status(200).json({
        message: 'Género eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };
}
