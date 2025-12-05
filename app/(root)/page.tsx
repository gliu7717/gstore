//const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms));
import sampleData from "@/db/sample-data";
import ProductList from "@/components/shared/header/product/product-list";

const Homepage = () => {
  //await delay(2000)
  console.log(sampleData)

  return <>
  <ProductList data={sampleData.products} title='Newest Arrivals' limit={4}/>
  </>;
}
 
export default Homepage;