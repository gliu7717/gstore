'use server'
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@/generated/prisma/client"
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
// Get latest product
export async function getLatestProducts(){
    const connectionString = `${process.env.DATABASE_URL}`    
    const adapter = new PrismaPg({ connectionString })
    const prisma = new PrismaClient({ adapter })
    const data = await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy:{createAt:'desc'}
    })    
    return convertToPlainObject(data)
}