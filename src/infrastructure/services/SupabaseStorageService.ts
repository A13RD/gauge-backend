import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { BadRequestError } from '../../application/errors/appErrors';

export class SupabaseStorageService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    this.bucket = env.SUPABASE_BUCKET;
  }

  async uploadFile(file: Express.Multer.File, folder = 'covers'): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestError('No se proporcionó ningún archivo para subir');
    }

    const originalExt = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanExt = ['png', 'jpg', 'jpeg', 'webp'].includes(originalExt) ? originalExt : 'jpg';
    const uniqueFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;


    const { data: _uploadData, error: uploadError } = await this.supabase.storage
      .from(this.bucket)
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new BadRequestError(
        `Error al subir la imagen al almacenamiento: ${uploadError.message}`
      );
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(uniqueFileName);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new BadRequestError('No se pudo generar la URL pública para el archivo subido');
    }

    return publicUrlData.publicUrl;
  }
}
