//const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms));
//import sampleData from "@/db/sample-data";
import ProductList from "@/components/shared/header/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";
import { Product } from "@/types";

const Homepage = async () => {
  //await delay(2000)
  const latestProducts = await getLatestProducts() as unknown as Product[]
  console.log(latestProducts)
  return <>
    <ProductList data={latestProducts} title='Newest Arrivals' limit={4} />
  </>;
}

export default Homepage;