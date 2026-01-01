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
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-3 xs:mb-4">
                About Perfect Gardener
              </h1>
              <p className="text-base xs:text-lg sm:text-xl text-muted-foreground mb-6 xs:mb-8">
                Nature, flowers, plants, care — helping them grow beautifully.
              </p>

              <div className="space-y-4 xs:space-y-5 sm:space-y-6 text-foreground text-sm xs:text-base sm:text-lg leading-relaxed">
                <p>
                  Hey there! I'm <strong className="font-semibold">Shubham Jakhmola</strong>, and I live in the beautiful mountains of Uttarakhand. Gardening's been my thing for as long as I can remember. There's something really calming about getting your hands dirty and watching things grow. That's why I started Perfect Gardener — to share what I've learned along the way.
                </p>

                <p>
                  I wanted to make gardening less intimidating for folks who are just starting out. Whether you've never planted a seed or you're looking to step up your plant game, I've got tips that actually work. I talk about everything from getting your soil ready to dealing with pesky bugs, and it's all stuff I've tried myself in my own garden.
                </p>

                <p>
                  You'll also find videos on my YouTube channel where I walk through different plant care routines, share some DIY tricks, and show off what's growing in my space. Nothing fancy — just real, practical advice from someone who's been doing this for a while.
                </p>

                <p>
                  Bottom line? I want to help you grow better plants and create a nice green spot at home. If I can do it up here in the hills, you can definitely do it wherever you are!
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

