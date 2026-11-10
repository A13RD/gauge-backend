import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../application/errors/appErrors';
import { Prisma } from '@prisma/client';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Errores de aplicación
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  // Errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = Array.isArray(err.meta?.target)
          ? err.meta?.target.join(', ')
          : String(err.meta?.target || 'campo único');
        res.status(409).json({
          message: `Conflicto: ya existe un registro con el mismo valor en (${target})`,
        });
        return;
      }
      case 'P2025': {
        res.status(404).json({
          message: 'El registro solicitado no fue encontrado en la base de datos',
        });
        return;
      }
      case 'P2003': {
        res.status(409).json({
          message:
            'El recurso relacionado no existe o está protegido',
        });
        return;
      }
      default: {
        res.status(400).json({
          message: 'Error en la operación de base de datos',
        });
        return;
      }
    }
  }

  // Errores de Multer
  if (err && typeof err === 'object' && 'name' in err && err.name === 'MulterError') {
    const multerErr = err as { code?: string; message?: string };
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        message: 'El archivo excede el tamaño máximo permitido (5 MB)',
      });
      return;
    }
    res.status(400).json({
      message: multerErr.message || 'Error en la subida de archivos',
    });
    return;
  }

  // JSON malformado en body
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as { status?: number }).status === 400
  ) {
    res.status(400).json({
      message: 'Formato de solicitud JSON inválido o malformado',
    });
    return;
  }

  // Errores no controlados
  res.status(500).json({
    message: 'Error interno del servidor',
  });
}
