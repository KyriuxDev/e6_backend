import { estadoService } from './estado.service';
import { Router, Request, Response } from 'express';

export const estadoRouter = Router();


/**
 * @swagger
 * /api/v1/estados:
 *   get:
 *     summary: Listar todos los estados
 *     tags: [Estado]
 *     responses:
 *       200:
 *         description: Lista de estados
 */
estadoRouter.get('/', async (_req: Request, res: Response) => {
  const estados = await estadoService.getAll();
  res.json(estados);
});


/**
 * @swagger
 * /api/v1/estado/{id}:
 *   get:
 *     summary: Obtener un estado por ID
 *     tags: [Estado]
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
 *         description: Estado encontrado
 *       404:
 *         description: Estado no encontrado
 */
estadoRouter.get('/:id', async (req: Request, res: Response) => {
  const user = await estadoService.getById(Number(req.params.id));
  res.json(user);
});

/**
 * @swagger
 * /api/v1/estado/{clave}:
 *   get:
 *     summary: Obtener un estado por Clave
 *     tags: [Estado]
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
 *         description: Estado encontrado
 *       404:
 *         description: Estado no encontrado
 */
estadoRouter.get('/:clave', async (req: Request, res: Response) =>{
    const user = await estadoService.getByClave(String(req.params.clave));
    res.json(user);
});
