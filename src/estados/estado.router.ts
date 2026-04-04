import { estadoService } from './estado.service';
import { Router, Request, Response } from 'express';

export const estadoRouter = Router();


/**
 * @swagger
 * /api/v1/estado:
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
 * /api/v1/estado/id/{id}:
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
estadoRouter.get('/id/:id', async (req: Request, res: Response) => {
  const user = await estadoService.getById(Number(req.params.id));
  res.json(user);
});

/**
 * @swagger
 * /api/v1/estado/clave/{clave}:
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
estadoRouter.get('/clave/:clave', async (req: Request, res: Response) =>{
    const estado = await estadoService.getByClave(String(req.params.clave));
    res.json(estado);
});

/**
 * @swagger
 * /api/v1/estado/nombre/{nombre}:
 *   get:
 *     summary: Obtener un estado por nombre
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
estadoRouter.get('/nombre/:nombre', async (req: Request, res: Response) =>{
    const estado = await estadoService.getByNombre(String(req.params.nombre));
    res.json(estado);
});