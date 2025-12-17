'use server';
import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { success } from "zod";
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
                message: `${product.name} added to cart`
            }
        } else {
            // check if the item is already in the cart

            const existItem = (cart.items as CartItem[]).find((x) => x.productId === item.productId)
            if (existItem) {
                // check stock
                if (product.stock < existItem.qty + 1) {
                    throw new Error('Not enough stock')

                }
                // increase the quantity
                (cart.items as CartItem[]).find((x) => x.productId === item.productId)!.qty = existItem.qty + 1
            } else {
                // item does not exist in cart
                //check stock
                if (product.stock < 1) throw new Error('Not enought stock')
                // add item to cart.items
                cart.items.push(item)
            }
            await prisma.cart.update({
                where: { id: cart.id },
                data: {
                    items: cart.items as Prisma.CartUpdateitemsInput[],
                    ...calcPrice(cart.items as CartItem[])
                }
            })
            revalidatePath(`/products/${product.slug}`)
            return {
                success: true,
                message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`
            }

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

export async function removeItemFromCart(productId: string) {
    try {
        // check for cart cookie
        const sessionCardId = (await cookies()).get("sessionCartId")?.value
        if (!sessionCardId) throw new Error('Cart session not found');
        //get product
        const product = await prisma.product.findFirst({
            where: { id: productId }
        })
        if (!product) throw new Error('product not found');
        // get user cart
        const cart = await getMyCart();
        if (!cart) throw new Error('cart not found');
        // check for item
        const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
        if (!exist) throw new Error('item not found');
        // chek if only one in qty
        if (exist.qty == 1) {
            //remove from cart
            cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== exist.productId)
        } else {
            // decrease qty
            (cart.items as CartItem[]).find((x) => x.productId)!.qty = exist.qty - 1
        }
        // update cart in db
        await prisma.cart.update({
            where: { id: cart.id },
            data: {
                items: cart.items as Prisma.CartUpdateitemsInput[],
                ...calcPrice(cart.items as CartItem[]),
            }
        })
        revalidatePath(`/product/${product.slug}`);
        return {
            success: true,
            message: `${product.name} was removed from cart`
        }

    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}