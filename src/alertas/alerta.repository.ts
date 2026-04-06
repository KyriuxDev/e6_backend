import { prisma } from '../lib/prisma';
import { Categoria, NivelAlerta, EstadoAlerta } from '@prisma/client';
import { CreateAlertaDto } from './alerta.types';

const selectResumen = {
  id:         true,
  nivel:      true,
  estado:     true,
  categoria:  true,
  irsuValor:  true,
  createdAt:  true,
  atendidaEn: true,
  cerradaEn:  true,
  asignadoA:  true,           // ← faltaba este campo
  comunidad:  { select: { id: true, nombre: true, slug: true } },
  usuario:    { select: { id: true, nombre: true, email: true } },
} as const;

const selectDetalle = {
  ...selectResumen,
  comunidad: {
    select: {
      id:        true,
      nombre:    true,
      slug:      true,
      municipio: { select: { id: true, nombre: true } },
    },
  },
} as const;

export const alertaRepository = {
  findAll: (filtros: {
    comunidadId?: number;
    nivel?:       NivelAlerta;
    estado?:      EstadoAlerta;
    categoria?:   Categoria;
    skip:         number;
    take:         number;
  }) => {
    return prisma.alerta.findMany({
      where: {
        ...(filtros.comunidadId && { comunidadId: filtros.comunidadId }),
        ...(filtros.nivel       && { nivel:       filtros.nivel }),
        ...(filtros.estado      && { estado:      filtros.estado }),
        ...(filtros.categoria   && { categoria:   filtros.categoria }),
      },
      select:  selectResumen,
      orderBy: { createdAt: 'desc' },
      skip:    filtros.skip,
      take:    filtros.take,
    });
  },

  count: (filtros: {
    comunidadId?: number;
    nivel?:       NivelAlerta;
    estado?:      EstadoAlerta;
    categoria?:   Categoria;
  }) => {
    return prisma.alerta.count({
      where: {
        ...(filtros.comunidadId && { comunidadId: filtros.comunidadId }),
        ...(filtros.nivel       && { nivel:       filtros.nivel }),
        ...(filtros.estado      && { estado:      filtros.estado }),
        ...(filtros.categoria   && { categoria:   filtros.categoria }),
      },
    });
  },

  findById: (id: number) => {
    return prisma.alerta.findUnique({
      where:  { id },
      select: selectDetalle,
    });
  },

  findActiva: (comunidadId: number, categoria: Categoria) => {
    return prisma.alerta.findFirst({
      where: {
        comunidadId,
        categoria,
        estado: { in: ['ACTIVA', 'EN_ATENCION'] },
      },
    });
  },

  create: (data: CreateAlertaDto) => {
    return prisma.alerta.create({
      data:   data,
      select: selectDetalle,
    });
  },

  tomarAlerta: (id: number, usuarioId: number) => {
    return prisma.alerta.update({
      where: { id },
      data: {
        estado:     'EN_ATENCION',
        asignadoA:  usuarioId,
        atendidaEn: new Date(),
      },
      select: selectDetalle,
    });
  },

  asignar: (id: number, usuarioId: number) => {
    return prisma.alerta.update({
      where: { id },
      data:  { asignadoA: usuarioId },
      select: selectDetalle,
    });
  },

  cerrar: (id: number) => {
    return prisma.alerta.update({
      where: { id },
      data: {
        estado:    'CERRADA',
        cerradaEn: new Date(),
      },
      select: selectDetalle,
    });
  },
};