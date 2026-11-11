import { Router } from 'express';
import { GenreController } from '../controllers/GenreController';
import { PrismaGenreRepository } from '../../infrastructure/repository/PrismaGenreRepository';
import { ListGenresUseCase } from '../../application/use-cases/genres/ListGenresUseCase';
import { GetGenreByIdUseCase } from '../../application/use-cases/genres/GetGenreByIdUseCase';
import { CreateGenreUseCase } from '../../application/use-cases/genres/CreateGenreUseCase';
import { UpdateGenreUseCase } from '../../application/use-cases/genres/UpdateGenreUseCase';
import { DeleteGenreUseCase } from '../../application/use-cases/genres/DeleteGenreUseCase';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

export const genreRoutes = Router();

const genreRepository = new PrismaGenreRepository();

const listGenresUseCase = new ListGenresUseCase(genreRepository);
const getGenreByIdUseCase = new GetGenreByIdUseCase(genreRepository);
const createGenreUseCase = new CreateGenreUseCase(genreRepository);
const updateGenreUseCase = new UpdateGenreUseCase(genreRepository);
const deleteGenreUseCase = new DeleteGenreUseCase(genreRepository);

const genreController = new GenreController(
  listGenresUseCase,
  getGenreByIdUseCase,
  createGenreUseCase,
  updateGenreUseCase,
  deleteGenreUseCase
);

// Rutas públicas
genreRoutes.get('/', genreController.getAll);
genreRoutes.get('/:id', genreController.getById);

// Rutas protegidas (ADMIN)
genreRoutes.post('/', authMiddleware, roleMiddleware(['ADMIN']), genreController.create);
genreRoutes.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), genreController.update);
genreRoutes.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), genreController.delete);
