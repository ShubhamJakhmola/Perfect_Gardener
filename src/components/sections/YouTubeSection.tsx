import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export function YouTubeSection() {
  return (
    <section id="youtube" className="py-16 md:py-24 bg-secondary/30">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Perfect Gardener on YouTube
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Hello everyone, this channel is all about nature, flowers, plants, care, 
              and helping them grow better. Join our community of garden enthusiasts!
            </p>
            <Button asChild size="lg" className="group">
              <a
                href="https://www.youtube.com/@perfect.gardener"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="w-5 h-5 mr-2" />
                Subscribe on YouTube
              </a>
            </Button>
          </div>

          {/* Video Embed */}
          <div className="relative">
            <div className="aspect-video rounded-xl overflow-hidden shadow-soft border border-border bg-card">
              <iframe
                src="https://www.youtube.com/embed/ds2Ozajh5zs"
                title="Perfect Gardener - Featured Video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-xl bg-primary/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
