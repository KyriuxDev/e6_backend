// A partir de Prisma 7, este archivo centraliza la configuración de conexión
// para Prisma Migrate y Prisma Client.
// Debe estar en la raíz del proyecto (junto a package.json).

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});