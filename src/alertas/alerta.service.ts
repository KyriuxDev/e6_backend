import { prisma } from '../lib/prisma';
import { alertaRepository } from './alerta.repository';
import {
  FiltrosAlertaInput,
  AsignarAlertaInput,
  CerrarAlertaInput,
} from './alerta.schema';
import { CreateAlertaDto } from './alerta.types';
import { JwtPayload } from '../auth/auth.types';
import { Categoria, NivelAlerta } from '@prisma/client';

// RF-06-2 y RF-06-3: umbrales del IRSU
const UMBRAL_AMARILLA = 50;
const UMBRAL_ROJA     = 100;

export const alertaService = {
  getAll: async (filtros: FiltrosAlertaInput, user: JwtPayload) => {
    // COORDINADOR solo ve alertas de su comunidad
    const comunidadId =
      user.rol === 'COORDINADOR' ? user.comunidadId ?? filtros.comunidadId :
      user.rol === 'ADMIN'       ? filtros.comunidadId :
      filtros.comunidadId;

    const skip = (filtros.page - 1) * filtros.limit;
    const take = filtros.limit;

    const [alertas, total] = await Promise.all([
      alertaRepository.findAll({
        comunidadId,
        nivel:     filtros.nivel,
        estado:    filtros.estado,
        categoria: filtros.categoria,
        skip,
        take,
      }),
      alertaRepository.count({
        comunidadId,
        nivel:     filtros.nivel,
        estado:    filtros.estado,
        categoria: filtros.categoria,
      }),
    ]);

    return {
      data: alertas,
      meta: {
        total,
        page:       filtros.page,
        limit:      filtros.limit,
        totalPages: Math.ceil(total / filtros.limit),
      },
    };
  },

  getById: async (id: number) => {
    const alerta = await alertaRepository.findById(id);
    if (!alerta) {
      throw Object.assign(new Error('Alerta no encontrada'), { statusCode: 404 });
    }
    return alerta;
  },

  // RF-06-1: Generación automática desde el motor IRSU
  // Este método lo llama irsu.service internamente, no el router
  generarSiCorresponde: async (
    comunidadId: number,
    categoria:   Categoria,
    irsuValor:   number
  ) => {
    // Determina nivel según RF-06-2 y RF-06-3
    let nivel: NivelAlerta | null = null;

    if (irsuValor > UMBRAL_ROJA) {
      nivel = 'ROJA';
    } else if (irsuValor > UMBRAL_AMARILLA) {
      nivel = 'AMARILLA';
    }

    // Si el IRSU bajó del umbral, no genera alerta
    if (!nivel) return null;

    // Si ya existe una alerta activa para esa comunidad+categoría, la actualiza
    const alertaExistente = await alertaRepository.findActiva(comunidadId, categoria);

    if (alertaExistente) {
      // Si el nivel subió de amarilla a roja, actualiza
      if (alertaExistente.nivel === 'AMARILLA' && nivel === 'ROJA') {
        return prisma.alerta.update({
          where: { id: alertaExistente.id },
          data:  { nivel, irsuValor },
        });
      }
      // Si ya existe del mismo nivel, solo actualiza el valor IRSU
      return prisma.alerta.update({
        where: { id: alertaExistente.id },
        data:  { irsuValor },
      });
    }

    // Crea nueva alerta
    const data: CreateAlertaDto = { comunidadId, categoria, nivel, irsuValor };
    return alertaRepository.create(data);
  },

  // RF-05-3: Tomar una alerta (el coordinador la toma para atenderla)
  tomar: async (id: number, user: JwtPayload) => {
    const alerta = await alertaService.getById(id);

    if (alerta.estado !== 'ACTIVA') {
      throw Object.assign(
        new Error('Solo se pueden tomar alertas en estado ACTIVA'),
        { statusCode: 400 }
      );
    }

    // COORDINADOR solo puede tomar alertas de su comunidad
    if (user.rol === 'COORDINADOR' && user.comunidadId !== alerta.comunidad.id) {
      throw Object.assign(
        new Error('No puedes tomar alertas fuera de tu comunidad'),
        { statusCode: 403 }
      );
    }

    return alertaRepository.tomarAlerta(id, user.sub);
  },

  // RF-06-4: Asignar alerta a otro usuario
  asignar: async (id: number, data: AsignarAlertaInput, user: JwtPayload) => {
    const alerta = await alertaService.getById(id);

    if (alerta.estado === 'CERRADA') {
      throw Object.assign(
        new Error('No se puede asignar una alerta cerrada'),
        { statusCode: 400 }
      );
    }

    // Valida que el usuario a asignar exista y sea COORDINADOR o ADMIN
    const objetivo = await prisma.usuario.findUnique({
      where:  { id: data.usuarioId },
      select: { id: true, rol: true, activo: true, municipioId: true, comunidadId: true },
    });

    if (!objetivo) {
      throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
    }

    if (!objetivo.activo) {
      throw Object.assign(new Error('No se puede asignar a un usuario inactivo'), { statusCode: 400 });
    }

    if (!['COORDINADOR', 'ADMIN', 'SUPER_ADMIN'].includes(objetivo.rol)) {
      throw Object.assign(
        new Error('Solo se puede asignar a COORDINADOR, ADMIN o SUPER_ADMIN'),
        { statusCode: 400 }
      );
    }

    // ADMIN solo puede asignar dentro de su municipio
    if (user.rol === 'ADMIN' && objetivo.municipioId !== user.municipioId) {
      throw Object.assign(
        new Error('No puedes asignar alertas a usuarios fuera de tu municipio'),
        { statusCode: 403 }
      );
    }

    return alertaRepository.asignar(id, data.usuarioId);
  },

  // RF-06-5: Cerrar alerta → CERRADA
  cerrar: async (id: number, user: JwtPayload) => {
    const alerta = await alertaService.getById(id);

    if (alerta.estado === 'CERRADA') {
      throw Object.assign(
        new Error('La alerta ya está cerrada'),
        { statusCode: 400 }
      );
    }

    if (alerta.estado === 'ACTIVA') {
      throw Object.assign(
        new Error('Debes tomar la alerta antes de cerrarla'),
        { statusCode: 400 }
      );
    }

    // COORDINADOR solo puede cerrar alertas de su comunidad
    if (user.rol === 'COORDINADOR' && user.comunidadId !== alerta.comunidad.id) {
      throw Object.assign(
        new Error('No puedes cerrar alertas fuera de tu comunidad'),
        { statusCode: 403 }
      );
    }

    return alertaRepository.cerrar(id);
  },
};