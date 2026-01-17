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
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Perfect Gardener",
            "url": "https://perfectgardener.netlify.app",
            "logo": "https://perfectgardener.netlify.app/assets/images/Avtar.png",
            "description": "Perfect Gardener is a website where home gardeners learn how to grow better plants using simple, practical advice.",
            "sameAs": [
              "https://www.youtube.com/@perfect.gardener"
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Perfect Gardener",
            "url": "https://perfectgardener.netlify.app",
            "description": "Practical gardening tips and plant care guides for home gardeners.",
            "publisher": {
              "@type": "Organization",
              "name": "Perfect Gardener"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://perfectgardener.netlify.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": "Perfect Gardener YouTube Channel",
            "description": "Gardening videos showing plant care, garden tips, and practical gardening advice.",
            "thumbnailUrl": "https://img.youtube.com/vi/ds2Ozajh5zs/maxresdefault.jpg",
            "uploadDate": "2024-01-01",
            "duration": "PT10M",
            "embedUrl": "https://www.youtube.com/embed/ds2Ozajh5zs",
            "interactionStatistic": {
              "@type": "InteractionCounter",
              "interactionType": "https://schema.org/WatchAction",
              "userInteractionCount": 1000
            }
          })
        }}
      />
      
      <main id="main-content" className="flex-1">
        <HeroSection />
        <ProductsSection limit={5} />
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
