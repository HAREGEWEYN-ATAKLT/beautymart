
import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import Categories from "@/app/components/Categories";
import FeaturedStores from "@/app/components/FeaturedStores";
import TrendingProducts from "@/app/components/TrendingProducts";
import BusinessCTA from "@/app/components/BusinessCTA";
import HowItWorks from "@/app/components/HowItWorks";
import Footer from "@/app//components/Footer";


export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
       <Categories />
        <FeaturedStores />
        <TrendingProducts />
        <BusinessCTA />
        <HowItWorks />
         <Footer />
    </main>
  );
}