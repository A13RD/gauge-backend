import { User } from '../models/User';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
