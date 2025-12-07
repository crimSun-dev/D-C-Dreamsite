import { Sparkles } from "lucide-react";

function FilledHeart({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      style={style}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function AnimatedHeroIcon() {
  return (
    <div className="flex items-center justify-center gap-2 animate-float" data-testid="animated-hero-icon">
      <Sparkles 
        className="w-6 h-6 text-pink-400 animate-sparkle" 
        style={{ animationDelay: "0s" }}
      />
      <FilledHeart 
        className="w-5 h-5 text-pink-400 animate-pulse-glow"
        style={{ animationDelay: "0.5s" }}
      />
      <Sparkles 
        className="w-6 h-6 text-pink-400 animate-sparkle" 
        style={{ animationDelay: "1s" }}
      />
    </div>
  );
}
