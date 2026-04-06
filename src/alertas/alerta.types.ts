import { Categoria, NivelAlerta, EstadoAlerta } from '@prisma/client';

export interface AlertaResumen {
  id:          number;
  nivel:       NivelAlerta;
  estado:      EstadoAlerta;
  categoria:   Categoria;
  irsuValor:   number;
  asignadoA:   number | null;
  comunidad:   { id: number; nombre: string; slug: string };
  usuario:     { id: number; nombre: string | null; email: string } | null;
  createdAt:   Date;
  atendidaEn:  Date | null;
  cerradaEn:   Date | null;
}

export interface AlertaDetalle extends AlertaResumen {
  comunidad: {
    id:        number;
    nombre:    string;
    slug:      string;
    municipio: { id: number; nombre: string };
  };
}

export interface CreateAlertaDto {
  comunidadId: number;
  categoria:   Categoria;
  nivel:       NivelAlerta;
  irsuValor:   number;
  asignadoA?:  number;
}