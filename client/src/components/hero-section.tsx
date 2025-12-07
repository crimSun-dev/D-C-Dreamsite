import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedHeroIcon } from "./animated-icon";
import heroImage from "@assets/generated_images/cherry_blossom_forest_twilight.png";

interface HeroSectionProps {
  fulfilledCount: number;
  totalCount: number;
  onAddWish: () => void;
}

export function HeroSection({ fulfilledCount, totalCount, onAddWish }: HeroSectionProps) {
  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="relative w-full h-[320px] md:h-[380px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 md:px-8 py-4 z-20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold text-sm md:text-base" data-testid="text-app-title">
              D & C Wishlist
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <span data-testid="text-fulfilled-count">{fulfilledCount} of {totalCount} wishes fulfilled</span>
            <Sparkles className="w-4 h-4 text-pink-400 animate-pulse-glow" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center pt-8">
          <AnimatedHeroIcon />
          
          <h1 
            className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
            style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic" }}
            data-testid="text-hero-title"
          >
            Our Shared Dreams
          </h1>
          
          <p 
            className="mt-2 text-pink-300 text-lg md:text-xl"
            style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic" }}
            data-testid="text-hero-subtitle"
          >
            Draven & Clairine
          </p>
          
          <p className="mt-1 text-white/70 text-sm" data-testid="text-hero-tagline">
            2 Idiots' worldly wishes &lt;3
          </p>
          
          <Button 
            onClick={onAddWish}
            variant="outline"
            className="mt-6 bg-zinc-900/80 backdrop-blur-sm border border-zinc-600 text-white gap-2"
            data-testid="button-add-wish-hero"
          >
            <Plus className="w-4 h-4" />
            Add New Wish
          </Button>
        </div>
      </div>
    </div>
  );
}
