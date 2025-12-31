import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 pt-20 pb-16">
        <section className="py-12 md:py-16">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                About Perfect Gardener
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Nature, flowers, plants, care — helping them grow beautifully.
              </p>

              <div className="space-y-6 text-foreground text-lg leading-relaxed">
                <p>
                  Hey, I'm <strong className="font-semibold">Shubham Jakhmola</strong> from the mountains of Uttarakhand. Gardening has always been one of
                  my favourite hobbies, something that keeps me connected to nature and brings a sense of peace
                  into everyday life. Perfect Gardener is my way of sharing that passion with you.
                </p>

                <p>
                  I started this platform to make gardening simple and enjoyable for everyone. Whether you're a
                  complete beginner or someone trying to improve plant health, I share clear and practical tips
                  based on real experience from soil preparation and watering routines to fertilizers, pests,
                  pruning, and seasonal plant care.
                </p>

                <p>
                  Along with helpful articles, I also create videos on my YouTube channel where I show step-by-step
                  plant care, DIY hacks, and home gardening ideas. Everything you see here is something I have
                  personally tried, learned, and improved over time.
                </p>

                <p>
                  My goal is simple: to help you grow healthier plants, build a beautiful green space at home,
                  and enjoy gardening just the way I do here in the hills of Uttarakhand.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default About;

