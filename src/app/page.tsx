import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import BrowseByCategory from "@/components/sections/BrowseByCategory";
import FeaturedListings from "@/components/sections/FeaturedListings";
import WhyAeroDesk from "@/components/sections/WhyAeroDesk";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <BrowseByCategory />
      <FeaturedListings />
      <WhyAeroDesk />
      <CTASection />
      <Footer />
    </main>
  );
}
