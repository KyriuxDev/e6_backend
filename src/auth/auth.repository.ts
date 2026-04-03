// Acceso a datos. Abstrae Prisma del resto de la aplicación.
// Solo esta capa conoce @prisma/client.
import { PrismaClient, Usuario} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma   = new PrismaClient({ adapter });

export const authRepository = {
    findByEmail: (email:string): Promise<Usuario | null> => {
        return prisma.usuario.findUnique({ where: {email}});
    },

    create: (data: {
    email:        string;
    passwordHash: string;
    nombre?:      string;
    }): Promise<Usuario> => {
        return prisma.usuario.create({ data });
    },
};