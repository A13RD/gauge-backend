import { IUserRepository } from '../../../domain/repository/IUserRepository';
import { BcryptService } from '../../../infrastructure/services/BcryptService';
import { JwtService } from '../../../infrastructure/services/JwtService';
import { LoginDTO, AuthResponseDTO } from '../../../infrastructure/dtos/auth.dto';
import { BadRequestError, UnauthorizedError } from '../../errors/appErrors';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService
  ) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestError('Correo electrónico y contraseña requeridos');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user || !user.password) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isMatch = await this.bcryptService.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('La cuenta se encuentra inactiva o deshabilitada');
    }

    const token = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }
}
