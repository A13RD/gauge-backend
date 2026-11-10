import { IUserRepository } from '../../../domain/repository/IUserRepository';
import { BcryptService } from '../../../infrastructure/services/BcryptService';
import { JwtService } from '../../../infrastructure/services/JwtService';
import { RegisterDTO, AuthResponseDTO } from '../../../infrastructure/dtos/auth.dto';
import { BadRequestError, ConflictError } from '../../errors/appErrors';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService
  ) {}

  async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
    const { name, email, password } = dto;

    if (!name || name.trim().length < 2) {
      throw new BadRequestError('El nombre debe tener al menos 2 caracteres');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new BadRequestError('Debe proporcionar un correo electrónico válido');
    }

    if (!password || password.length < 6) {
      throw new BadRequestError('La contraseña debe tener al menos 6 caracteres');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictError('El correo electrónico ya se encuentra registrado');
    }

    const hashedPassword = await this.bcryptService.hash(password);

    
    const newUser = await this.userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'USER',
    });

    const token = this.jwtService.sign({
      id: newUser.id,
      role: newUser.role,
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    };
  }
}
