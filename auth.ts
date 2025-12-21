import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compareSync } from 'bcrypt-ts-edge'
import type { NextAuthConfig } from 'next-auth'
import { CredentialsSignin } from "next-auth"
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Cookie } from 'next/font/google'

class InvalidLoginError extends CredentialsSignin {
    code = "Invalid identifier or password"
}

export const config = {
    pages: {
        signIn: '/sign-in',
        signOut: '/sign-out',
        error: '/sign-in'
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, //30 days
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            credentials: {
                email: { type: 'email' },
                password: { type: 'password' }
            },

            async authorize(credentials) {
                if (credentials == null) return null;
                //Find user in database
                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email as string
                    }
                });
                // check if user exists and if password matches
                if (user && user.password) {
                    const isMatch = compareSync(credentials.password as string, user.password)
                    // if password is correct return user
                    if (isMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        }
                    }
                    // not match
                    //return null;
                }
                throw new InvalidLoginError()
            }
        })
    ],
    callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async session({ session, user, trigger, token }: any) {
            // Set the user id from token
            console.log(token)
            session.user.id = token.sub;
            session.user.role = token.role;
            session.user.name = token.name;

            // if there is an update, set the user name
            if (trigger == 'update') {
                session.user.name = user.name
            }
            return session
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async jwt({ token, user, trigger, session }: any) {
            // assgin user fields to the token.
            if (user) {
                token.id = user.id;
                token.role = user.role;
                // if user has no name use the email
                if (user.name === "NO_NAME") {
                    token.name = user.email!.split('@')[0]
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { name: token.name }
                    })
                }
                if (trigger === 'signIn' || trigger === 'signUp') {
                    const cookiesObject = await cookies();
                    const sessionCardId = cookiesObject.get('sessionCartId')?.value;
                    if (sessionCardId) {
                        const sessionCard = await prisma.cart.findFirst({
                            where: { sessionCartId: sessionCardId }
                        })
                        if (sessionCard) {
                            // delte current user cart
                            await prisma.cart.deleteMany({
                                where: { userId: user.id },
                            })
                            // assign new cart
                            await prisma.cart.update({
                                where: { id: sessionCard.id },
                                data: { userId: user.id }
                            })
                        }
                    }
                }
            }
            return token
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authorized({ request, auth }: any) {
            // array of regex patterns of paths we want to protect
            const protectedPaths = [
                /\/shipping-address/,
                /\/payment-method/,
                /\/place-order/,
                /\/profile/,
                /\/user\/(.*)/,
                /\/order\/(.*)/,
                /\/admin/,
            ]
            // get pathname from the req URL Object
            const { pathname } = request.nextUrl;
            // if user is not authenticated and accessing a protested path
            if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

            // check for session cart coookie
            if (!request.cookies.get('sessionCartId')) {
                // generate new session cart id cookie
                const sessionCardId = crypto.randomUUID()
                console.log(sessionCardId)
                // clone the req headers
                const newRequestHeaders = new Headers(request.headers)
                // create new response and add the new headers
                const response = NextResponse.next({
                    request: {
                        headers: newRequestHeaders,
                    }
                })
                response.cookies.set('sessionCartId', sessionCardId)
                return response;
            }
            else {
                return true
            }
        }

    }
} satisfies NextAuthConfig
export const { handlers, auth, signIn, signOut } = NextAuth(config);