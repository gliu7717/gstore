'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { CartItem } from "@/types";
import { toast } from "sonner"

const AddToCart = ({ item }: { item: CartItem }) => {
    const router = useRouter();

    const handleAddToCart = async () => {
        const res = await addItemToCart(item)
        if (!res?.success) {
            console.log(res?.message)
            toast(res?.message)
            return;
        }
        // handle success add to cart
        console.log(`${item.name} added to cart`)
        toast("Event has been created", {
            description: res.message,
            action: {
                label: "Go To Cart",
                onClick: () => router.push('/cart'),
            },
        })
    }

    return <Button className="w-full" type='button' onClick={handleAddToCart}> <Plus />Add To Cart</Button>;
}

export default AddToCart;