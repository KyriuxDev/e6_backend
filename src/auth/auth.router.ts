// Endpoints HTTP del dominio HTTP.
// Express 5: los async handlers propagan errores automáticamente — no se necesita try/catch.

import { Router, Request, Response } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';

export const authRouter = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registro de ciudadano
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               nombre:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Usuario registrado, retorna JWT
 *       400:
 *         description: Email ya registrado o datos inválidos
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const result = await authService.register(parsed.data);
  res.status(201).json(result);
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, retorna JWT
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Cuenta desactivada
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const result = await authService.login(parsed.data);
  res.json(result);
});