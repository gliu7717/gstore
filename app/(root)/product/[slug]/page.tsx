import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { Badge } from "@/components/ui/badge";
import {Card,CardContent} from '@/components/ui/card'
import ProductPrice from "@/components/shared/header/product/product-price";

const ProductDetailsPage = async (props:{
    params: Promise<{slug:string}>;
}) => {
    const {slug} = await props.params
    const product = await getProductBySlug(slug)
    if(!product) notFound()
    return ( <>
    <section>
        <div className="grid grid-col-1 md:grid-cols-5">
           {/*Images Column*/}
           <div className="col-span2"> {/* Images component*/}</div>
           {/* Details Coluumn*/}
           <div className="col-span-2 p-5">
                <div className="flex flex-col gap-6">
                    <p>
                        {product.brand} {product.category}
                    </p>
                    <h1 className="h3-bold">{product.name}</h1>
                    <p>
                        {product.rating} of {product.numReviews} Reviews                        
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <ProductPrice value={Number(product.price)} className='w-25 rounded-full bg-green-100 text-green-700 px-5 py-2' />
                    </div>
                    <div className="mt-10">
                    <p className="font-semibold">
                        Description
                    </p>
                     <p>{product.description}</p>
                    </div>
                </div>                
            </div>
            {/* Action Column */}
            <div>
                <Card>
                    <CardContent className="p-4">
                        <div className="mb-2 flex justify-between">
                            <div>Price</div>
                            <div><ProductPrice value={Number(product.price)}/></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    </section>
    </> );
}
 
export default ProductDetailsPage;