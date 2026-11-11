import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { PrismaGameRepository } from '../../infrastructure/repository/PrismaGameRepository';
import { PrismaGenreRepository } from '../../infrastructure/repository/PrismaGenreRepository';
import { SupabaseStorageService } from '../../infrastructure/services/SupabaseStorageService';
import { ListGamesUseCase } from '../../application/use-cases/games/ListGamesUseCase';
import { GetGameByIdUseCase } from '../../application/use-cases/games/GetGameByIdUseCase';
import { CreateGameUseCase } from '../../application/use-cases/games/CreateGameUseCase';
import { UpdateGameUseCase } from '../../application/use-cases/games/UpdateGameUseCase';
import { SoftDeleteGameUseCase } from '../../application/use-cases/games/SoftDeleteGameUseCase';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { uploadGameImages } from '../middlewares/uploadMiddleware';

export const gameRoutes = Router();

const gameRepository = new PrismaGameRepository();
const genreRepository = new PrismaGenreRepository();
const storageService = new SupabaseStorageService();

const listGamesUseCase = new ListGamesUseCase(gameRepository);
const getGameByIdUseCase = new GetGameByIdUseCase(gameRepository);
const createGameUseCase = new CreateGameUseCase(gameRepository, genreRepository, storageService);
const updateGameUseCase = new UpdateGameUseCase(gameRepository, genreRepository, storageService);
const softDeleteGameUseCase = new SoftDeleteGameUseCase(gameRepository);

const gameController = new GameController(
  listGamesUseCase,
  getGameByIdUseCase,
  createGameUseCase,
  updateGameUseCase,
  softDeleteGameUseCase
);

// Rutas públicas
gameRoutes.get('/', gameController.getAll);
gameRoutes.get('/:id', gameController.getById);

// Rutas protegidas (ADMIN)
gameRoutes.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadGameImages,
  gameController.create
);

gameRoutes.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  uploadGameImages,
  gameController.update
);

gameRoutes.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), gameController.delete);
