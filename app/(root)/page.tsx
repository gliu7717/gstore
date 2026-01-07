//const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms));
//import sampleData from "@/db/sample-data";
import ProductList from "@/components/shared/product/product-list";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";
import { Product } from "@/types";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";
import IconBoxes from "@/components/icon-boxes";

const Homepage = async () => {
  //await delay(2000)
  const latestProducts = (await getLatestProducts()) as unknown as Product[];
  const featuredProducts =
    (await getFeaturedProducts()) as unknown as Product[];

  console.log(latestProducts);
  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title='Newest Arrivals' limit={4} />
      <ViewAllProductsButton />
      <IconBoxes />
    </>
  );
};

export default Homepage;
