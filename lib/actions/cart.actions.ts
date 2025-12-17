'use server';
import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
// Calculating cart prices
const calcPrice = (items: CartItem[]) => {
    const itemsPrice = round2(
        items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
        shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
        taxPrice = round2(0.15 * itemsPrice),
        totalPrice = round2(itemsPrice + taxPrice + shippingPrice);
    console.log("item price:" + itemsPrice)
    return {
        itemsPrice: itemsPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
    }
}

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
        if (!product) throw new Error('product not found');
        if (!cart) {
            //create new cart
            const newCart = insertCartSchema.parse({
                userId: userId,
                items: [item],
                sessionCartId: sessionCardId,
                ...calcPrice([item]),
                user: null
            })
            console.log(newCart)
            await prisma.cart.create({
                data: newCart
            })

            // revalidate product page
            revalidatePath(`/product/${product.slug}`)
            return {
                success: true,
                message: 'Item added to cart'
            }
        } else {

        }

    } catch (error) {
        console.log(error);
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