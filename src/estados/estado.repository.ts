import { PrismaClient, Estado, Municipio, CodigoPostal } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma   = new PrismaClient({ adapter });


export const estadoRepository ={
    findAll: (): Promise<Estado[]> =>{
        return prisma.estado.findMany({ 
            orderBy: {
                id: 'asc'
            }
        });
    },

    findById: (id: number): Promise<Estado | null> => {
        return prisma.estado.findUnique({ where: { id } });
    },

    findByClave: (clave: string): Promise<Estado | null> => {
        return prisma.estado.findUnique({
            where: { clave}
        });
    },

    findByNombre: (nombre: string): Promise<Estado | null> => {
        return prisma.estado.findFirst({
            where: { nombre:{
                equals: nombre,
                mode: 'insensitive'
            } }
        });
    },
   
};