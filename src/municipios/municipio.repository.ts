import { PrismaClient, Estado, Municipio} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma   = new PrismaClient({ adapter });


export const municipioRepository ={
 
    findAll: (): Promise<Municipio[]> =>{
        return prisma.municipio.findMany({
            select: {
                id: true,
                clave: true,
                nombre: true,
                estadoId: true,
            },
            orderBy: {
                id: 'asc'
            }
        });
    },

    findById: (id: number): Promise<Municipio | null> => {
        return prisma.municipio.findUnique({ where: { id } });
    },

    findMunicipiosByEstado: (estadoId: number): Promise<Municipio[]> => {
        return prisma.municipio.findMany({
            where:   { estadoId },
            select:  { id: true, clave: true, nombre: true, estadoId: true },
            orderBy: { nombre: 'asc' },
        });
    },

    findByClave: (clave: string): Promise<Municipio | null> => {
            return prisma.municipio.findUnique({
                where: { clave}
            });
        },
    
    findByNombre: (nombre: string): Promise<Municipio | null> => {
        return prisma.municipio.findFirst({
            where: { nombre:{
                equals: nombre,
                mode: 'insensitive'
            } }
        });
    },



   
};