import { IGameRepository } from '../../../domain/repository/IGameRepository';
import { IGenreRepository } from '../../../domain/repository/IGenreRepository';
import { Game } from '../../../domain/models/Game';
import { SupabaseStorageService } from '../../../infrastructure/services/SupabaseStorageService';
import { BadRequestError, NotFoundError } from '../../errors/appErrors';

export interface CreateGameDTO {
  title: string;
  description: string;
  releaseDate: string | Date;
  genreId: string;
  bannerUrl?: string | null;
}

export class CreateGameUseCase {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly genreRepository: IGenreRepository,
    private readonly storageService: SupabaseStorageService
  ) {}

  async execute(dto: CreateGameDTO, file?: Express.Multer.File): Promise<Game> {
    const { title, description, releaseDate, genreId, bannerUrl } = dto;

    if (!title || title.trim().length < 2) {
      throw new BadRequestError(
        'El título del videojuego es obligatorio y debe tener al menos 2 caracteres'
      );
    }

    if (!description || description.trim().length < 10) {
      throw new BadRequestError(
        'La descripción es obligatoria y debe tener al menos 10 caracteres'
      );
    }

    if (!releaseDate) {
      throw new BadRequestError('La fecha de lanzamiento es requerida');
    }

    const parsedDate = new Date(releaseDate);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestError(
        'El formato de la fecha de lanzamiento no es válido (use formato ISO)'
      );
    }

    if (!genreId) {
      throw new BadRequestError('El identificador del género es obligatorio');
    }

    const genre = await this.genreRepository.findById(genreId);
    if (!genre) {
      throw new NotFoundError('El género especificado no existe');
    }

    if (!file) {
      throw new BadRequestError(
        'Es obligatorio adjuntar un archivo de imagen como carátula'
      );
    }

    const coverUrl = await this.storageService.uploadFile(file, 'covers');

    return this.gameRepository.create({
      title: title.trim(),
      description: description.trim(),
      coverUrl,
      bannerUrl: bannerUrl ? bannerUrl.trim() : null,
      releaseDate: parsedDate,
      genreId,
    });
  }
}
