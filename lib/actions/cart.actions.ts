'use server';
import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema } from "../validators";
export async function addItemToCart(data: CartItem) {
    try {
        // check for cart cookie
        const sessionCardId = (await cookies()).get("sessionCartId")?.value
        if (!sessionCardId) throw new Error('Cart session not found');
        const session = await auth();
        const userId = session?.user?.id ? (session.user.id as string) : undefined;
        const cart = await getMyCart();
        // parse and validate item
        const item = cartItemSchema.parse(data)
        //find product in database
        const product = await prisma.product.findFirst({
            where: { id: item.productId }
        })
        console.log({
            'Session Cart Id': sessionCardId,
            'userId': userId,
            'item requested': item,
            'product found': product
        })

        return {
            success: true,
            message: 'Item added to cart'
        }

    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        }

    }
}

export async function getMyCart() {
    const sessionCardId = (await cookies()).get("sessionCartId")?.value
    if (!sessionCardId) throw new Error('Cart session not found');
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    // get user card from database
    const cart = await prisma.cart.findFirst({
        where: userId ? { userId: userId } : { sessionCartId: sessionCardId }
    })
    if (!cart) return undefined
    return convertToPlainObject({
        ...cart,
        items: cart.items as CartItem[],
        itemPrice: cart.itemsPrice.toString(),
        totalPrice: cart.itemsPrice.toString(),
        shippingPrice: cart.itemsPrice.toString(),
        taxPrice: cart.itemsPrice.toString(),
    })
}