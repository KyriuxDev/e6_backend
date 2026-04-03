// Lógica de negocio. Orquesta el repositorio y lanza errores HTTP si algo falla.

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { authRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.schema';
import { JwtPayload, AuthResponse } from './auth.types';
import { config } from '../config';

const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload as object, config.JWT_SECRET, options);
};

export const authService = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const existing = await authRepository.findByEmail(data.email);
    if (existing) {
      throw Object.assign(new Error('El email ya está registrado'), { statusCode: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const usuario = await authRepository.create({
      email: data.email,
      passwordHash,
      nombre: data.nombre,
    });

    const token = signToken({
      sub:  usuario.id,
      email: usuario.email,
      rol:  usuario.rol,
    });

    return {
      token,
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
    };
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const usuario = await authRepository.findByEmail(data.email);
    if (!usuario) {
      throw Object.assign(new Error('Credenciales inválidas'), { statusCode: 401 });
    }

    if (!usuario.activo) {
      throw Object.assign(new Error('Cuenta desactivada'), { statusCode: 403 });
    }

    const valid = await bcrypt.compare(data.password, usuario.passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Credenciales inválidas'), { statusCode: 401 });
    }

    const token = signToken({
      sub:         usuario.id,
      email:       usuario.email,
      rol:         usuario.rol,
      comunidadId: usuario.comunidadId ?? undefined,
      municipioId: usuario.municipioId ?? undefined,
    });

    return {
      token,
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
    };
  },
};