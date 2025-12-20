import { z } from 'zod'
import { formatNumberwithDecimal } from './utils'
import { PAYMENT_METHODS } from './constants'
import ProductCard from '@/components/shared/header/product/product-card'
// schema for inserting products
const currency = z.string().refine((value) => /^\d+(\.\d{2})?$/.test(formatNumberwithDecimal(Number(value))), 'Price must have exactly two decimal places')
export const insertProductSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    slug: z.string().min(3, 'Slug must be at least 3 charcters'),
    category: z.string().min(3, 'Category must be at least 3 charcters'),
    brand: z.string().min(3, 'Brand must be at least 3 charcters'),
    description: z.string().min(3, 'Description must be at least 3 charcters'),
    stock: z.coerce.number(),
    images: z.array(z.string()).min(1, 'Product must have at least 1 image'),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency,
})

// Schema for signing users in
export const signInFormSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, "password must be at least 6 characters")

})

// Schema for signing up a user
export const signUpFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.email('Invalid email address'),
    password: z.string().min(6, "password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "password must be at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})
// Cart schemas
export const cartItemSchema = z.object({
    productId: z.string().min(1, "product is required"),
    name: z.string().min(1, "name is required"),
    slug: z.string().min(1, "slug is required"),
    qty: z.number().int().nonnegative("Quantity must be a positive number"),
    image: z.string().min(1, "Image is required"),
    price: currency,
})
export const insertCartSchema = z.object({
    items: z.array(cartItemSchema),
    itemsPrice: currency,
    totalPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    sessionCartId: z.string().min(1, 'Session card id is required'),
    userId: z.string().optional().nullable(),
})

// schema for shipping address
export const shippingAddressSchema = z.object({
    fullName: z.string().min(3, 'Name must be at least 3 characters'),
    streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
    city: z.string().min(3, 'City must be at least 3 characters'),
    postalCode: z.string().min(3, 'Post code must be at least 3 characters'),
    country: z.string().min(3, 'Country must be at least 3 characters'),
    lat: z.number().optional(),
    lng: z.number().optional(),
})

// Schema for payment method
export const paymentMethodSchema = z.object({
    type: z.string().min(1, 'Payment method is required')
}).refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Invalid payment method'
})

// schema for insering order
export const insertOrderSchema = z.object({
    userId: z.string().min(1, 'User is required'),
    itemsPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    totalPrice: currency,
    paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
        message: "Invalid payment method"
    }),
    shippingAddress: shippingAddressSchema
})

// schema for inserting order item
export const insertOrderItemSchema = z.object({
    ProductCardId: z.string(),
    slug: z.string(),
    image: z.string(),
    name: z.string(),
    price: currency,
    qty: z.number(),
})