import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { Metadata } from "next";
import { ShippingAddress } from "@/types"
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ShippingAddressForm from "./shiping-address-form";
import CheckoutSteps from "@/components/shared/header/checkout-steps";

export const metadata: Metadata = {
    title: 'Shipping Address'
}

const ShipppingAddressPage = async () => {
    const cart = await getMyCart();
    if (!cart || cart.items.length === 0) redirect('/cart');
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error('No user id');
    const user = getUserById(userId);
    return (<>
        <CheckoutSteps current={1} />
        <ShippingAddressForm address={(await user).address as ShippingAddress} />
    </>
    );
}

export default ShipppingAddressPage;