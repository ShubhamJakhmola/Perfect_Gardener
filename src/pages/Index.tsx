import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProductsSection } from "@/components/sections/ProductsSection";
import { PostsSection } from "@/components/sections/PostsSection";
import { YouTubeSection } from "@/components/sections/YouTubeSection";
import { CommentsSection } from "@/components/sections/CommentsSection";
import { BackToTop } from "@/components/BackToTop";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1">
        <HeroSection />
        <ProductsSection limit={6} />
        <PostsSection limit={3} />
        <YouTubeSection />
        <CommentsSection />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
