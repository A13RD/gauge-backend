import { IGameRepository } from '../../../domain/repository/IGameRepository';
import { IGenreRepository } from '../../../domain/repository/IGenreRepository';
import { Game } from '../../../domain/models/Game';
import { SupabaseStorageService } from '../../../infrastructure/services/SupabaseStorageService';
import { BadRequestError, NotFoundError } from '../../errors/appErrors';

export interface UpdateGameDTO {
  title?: string;
  description?: string;
  releaseDate?: string | Date;
  genreId?: string;
  bannerUrl?: string | null;
}

export class UpdateGameUseCase {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly genreRepository: IGenreRepository,
    private readonly storageService: SupabaseStorageService
  ) {}

  async execute(
    id: string,
    dto: UpdateGameDTO,
    coverFile?: Express.Multer.File,
    bannerFile?: Express.Multer.File
  ): Promise<Game> {
    const existing = await this.gameRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Videojuego no encontrado o ha sido eliminado');
    }

    let parsedDate: Date | undefined = undefined;
    if (dto.releaseDate !== undefined) {
      parsedDate = new Date(dto.releaseDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestError(
          'El formato de la fecha de lanzamiento no es válido (use formato ISO)'
        );
      }
    }

    if (dto.genreId !== undefined) {
      const genre = await this.genreRepository.findById(dto.genreId);
      if (!genre) {
        throw new NotFoundError('El género especificado no existe');
      }
    }

    let newCoverUrl: string | undefined = undefined;
    if (coverFile) {
      newCoverUrl = await this.storageService.uploadFile(coverFile, 'covers');
      if (existing.coverUrl) {
        await this.storageService.deleteFile(existing.coverUrl);
      }
    }

    let newBannerUrl: string | null | undefined = undefined;
    if (bannerFile) {
      newBannerUrl = await this.storageService.uploadFile(bannerFile, 'banners');
      if (existing.bannerUrl) {
        await this.storageService.deleteFile(existing.bannerUrl);
      }
    } else if (dto.bannerUrl !== undefined) {
      newBannerUrl = dto.bannerUrl;
    }

    return this.gameRepository.update(id, {
      title: dto.title ? dto.title.trim() : undefined,
      description: dto.description ? dto.description.trim() : undefined,
      coverUrl: newCoverUrl,
      bannerUrl: newBannerUrl,
      releaseDate: parsedDate,
      genreId: dto.genreId,
    });
  }
}
