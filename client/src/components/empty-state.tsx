import { Sparkles, Heart } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-pink-400/50 animate-sparkle" style={{ animationDelay: "0s" }} />
        <Heart className="w-5 h-5 text-pink-400/50 animate-pulse-glow" />
        <Sparkles className="w-6 h-6 text-pink-400/50 animate-sparkle" style={{ animationDelay: "1s" }} />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2" data-testid="text-empty-title">
        No wishes yet!
      </h3>
      
      <p className="text-zinc-400 max-w-sm" data-testid="text-empty-description">
        Start adding your dreams and wishes together.
        <br />
        Every great adventure begins with a single wish.
      </p>
    </div>
  );
}

interface NoResultsProps {
  searchQuery: string;
}

export function NoResults({ searchQuery }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-zinc-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2" data-testid="text-no-results-title">
        No wishes found
      </h3>
      
      <p className="text-zinc-400 max-w-sm" data-testid="text-no-results-description">
        No wishes match "{searchQuery}". Try adjusting your search or filters.
      </p>
    </div>
  );
}
