'use server'
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from "@/generated/prisma/client"
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
// Get latest product
export async function getLatestProducts() {
    const connectionString = `${process.env.DATABASE_URL}`
    const adapter = new PrismaPg({ connectionString })
    const prisma = new PrismaClient({ adapter })
    const data = await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy: { createdAt: 'desc' }
    })
    return convertToPlainObject(data)
}

// Get single product by it's slug
export async function getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
        where: { slug: slug }
    })
}

// Get all products
export async function getAllProducts({
    query,
    limit = PAGE_SIZE,
    page,
    category,
    price,
    rating,
    sort,
}: {
    query: string;
    limit?: number;
    page: number;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
}) {
    // Query filter
    const queryFilter: Prisma.ProductWhereInput =
        query && query !== 'all'
            ? {
                name: {
                    contains: query,
                    mode: 'insensitive',
                } as Prisma.StringFilter,
            }
            : {};

    // Category filter
    const categoryFilter = category && category !== 'all' ? { category } : {};

    // Price filter
    const priceFilter: Prisma.ProductWhereInput =
        price && price !== 'all'
            ? {
                price: {
                    gte: Number(price.split('-')[0]),
                    lte: Number(price.split('-')[1]),
                },
            }
            : {};

    // Rating filter
    const ratingFilter =
        rating && rating !== 'all'
            ? {
                rating: {
                    gte: Number(rating),
                },
            }
            : {};

    const data = await prisma.product.findMany({
        where: {
            ...queryFilter,
            ...categoryFilter,
            ...priceFilter,
            ...ratingFilter,
        },
        orderBy:
            sort === 'lowest'
                ? { price: 'asc' }
                : sort === 'highest'
                    ? { price: 'desc' }
                    : sort === 'rating'
                        ? { rating: 'desc' }
                        : { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
    });

    const dataCount = await prisma.product.count();

    return {
        data,
        totalPages: Math.ceil(dataCount / limit),
    };
}

// Delete a product
export async function deleteProduct(id: string) {
    try {
        const productExists = await prisma.product.findFirst({
            where: { id },
        });

        if (!productExists) throw new Error('Product not found');

        await prisma.product.delete({ where: { id } });

        revalidatePath('/admin/products');

        return {
            success: true,
            message: 'Product deleted successfully',
        };
    } catch (error) {
        return { success: false, message: formatError(error) };
    }
}