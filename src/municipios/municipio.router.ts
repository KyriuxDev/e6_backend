import { municipioService } from './municipio.service';
import { Router, Request, Response } from 'express';
import { Municipio } from '@prisma/client';
import { estadoRepository } from '../estados/estado.repository';
import { estadoService } from '../estados/estado.service';

export const municipioRouter = Router();


/**
 * @swagger
 * /api/v1/municipios:
 *   get:
 *     summary: Listar todos los municipios
 *     tags: [Municipio]
 *     responses:
 *       200:
 *         description: Lista de municipios
 */
municipioRouter.get('/', async (_req: Request, res: Response) => {
  const municipio = await municipioService.getAll();
  res.json(municipio);
});


/**
 * @swagger
 * /api/v1/municipios/id/{id}:
 *   get:
 *     summary: Obtener un municipio por ID
 *     tags: [Municipio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Municipio encontrado
 *       404:
 *         description: Municipio no encontrado
 */
municipioRouter.get('/id/:id', async (req: Request, res: Response) => {
  const municipio = await municipioService.getById(Number(req.params.id));
  res.json(municipio);
});

/**
 * @swagger
 * /api/v1/municipios/{estadoId}/municipio:
 *   get:
 *     summary: Municipios de un estado
 *     tags: [Municipio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de municipios
 *       404:
 *         description: Estado no encontrado
 */
municipioRouter.get('/:id/municipio', async (req: Request, res: Response) => {
  const id     = Number(req.params.id);
  const estado = await estadoService.getById(id);

  if (!estado) {
    res.status(404).json({ error: 'Estado no encontrado' });
    return;
  }

  const municipios = await municipioService.getById(id);
  res.json(municipios);
});

/**
 * @swagger
 * /api/v1/municipios/clave/{clave}:
 *   get:
 *     summary: Obtener un municipio por Clave
 *     tags: [Municipio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clave
 *         required: true
 *         schema:
 *           type: String
 *     responses:
 *       200:
 *         description: Municipio encontrado
 *       404:
 *         description: Municipio no encontrado
 */
municipioRouter.get('/clave/:clave', async (req: Request, res: Response) =>{
    const municipio = await municipioService.getByClave(String(req.params.clave));
    res.json(municipio);
});

/**
 * @swagger
 * /api/v1/municipios/nombre/{nombre}:
 *   get:
 *     summary: Obtener un munipio por nombre
 *     tags: [Municipio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Municipio encontrado
 *       404:
 *         description: Municipio no encontrado
 */
municipioRouter.get('/nombre/:nombre', async (req: Request, res: Response) =>{
    const municipio = await municipioService.getByNombre(String(req.params.nombre));
    res.json(municipio);
});