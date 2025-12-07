'use client'
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ProductImages = ({images}:{images:string[]}) => {
    const [current,setCurrent] = useState(0)

    return (  <div className="space-y-4">
        <Image src = {images[current]} alt = 'product image' width={1000}
        height={1000} className="'min-h[300px] object-cover object-center" />
    </div>

    );
}
 
export default ProductImages;