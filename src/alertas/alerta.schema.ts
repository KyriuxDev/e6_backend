import { z } from 'zod';
import { Categoria, NivelAlerta, EstadoAlerta } from '@prisma/client';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const filtrosAlertaSchema = z.object({
  comunidadId: z.coerce.number().int().positive().optional(),
  nivel:       z.nativeEnum(NivelAlerta).optional(),
  estado:      z.nativeEnum(EstadoAlerta).optional(),
  categoria:   z.nativeEnum(Categoria).optional(),
  page:        z.coerce.number().int().positive().default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
});

export const asignarAlertaSchema = z.object({
  usuarioId: z.number().int().positive('El usuarioId debe ser un entero positivo'),
});

export const cerrarAlertaSchema = z.object({
  nota: z.string().trim().max(500).optional(),
});

export type IdParam             = z.infer<typeof idParamSchema>;
export type FiltrosAlertaInput  = z.infer<typeof filtrosAlertaSchema>;
export type AsignarAlertaInput  = z.infer<typeof asignarAlertaSchema>;
export type CerrarAlertaInput   = z.infer<typeof cerrarAlertaSchema>;