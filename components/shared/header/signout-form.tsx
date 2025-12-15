'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOutUser } from "@/lib/actions/user.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const CredentialsSignOutForm = () => {
    const router = useRouter();
    const logoutCognitoUrl = "/sign-in";

    const [data, action] = useActionState(signOutUser, {
        success: false,
        message: ''
    })
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const SignOutButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} className="w-full" variant='default' >
                {pending ? 'Signing out...' : 'Sign out'}
            </Button>
        )
    }
    const signMeOut = () => {
        console.log("logging out")
        signOut({ redirect: false }).then(() =>
            router.push(logoutCognitoUrl),
        )
    }

    return (
        <>
            <form action={signMeOut}>
                <button
                    onClick={() =>
                        signOut({ redirect: false }).then(() =>
                            router.push(logoutCognitoUrl),
                        )
                    }
                >
                    Sign out
                </button>
            </form>
        </>
    );
}

export default CredentialsSignOutForm;