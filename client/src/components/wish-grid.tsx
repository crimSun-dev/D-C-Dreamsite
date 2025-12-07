import { type Wish } from "@shared/schema";
import { WishCard } from "./wish-card";
import { EmptyState, NoResults } from "./empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface WishGridProps {
  wishes: Wish[];
  isLoading: boolean;
  hasSearchQuery: boolean;
  searchQuery: string;
  onComplete: (id: string) => void;
  onRestore: (id: string) => void;
  onEdit: (wish: Wish) => void;
  onDelete: (id: string) => void;
}

function WishCardSkeleton() {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden">
      <Skeleton className="aspect-video w-full bg-zinc-800" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 bg-zinc-800" />
          <Skeleton className="h-5 w-16 bg-zinc-800" />
        </div>
        <Skeleton className="h-6 w-3/4 bg-zinc-800" />
        <Skeleton className="h-4 w-full bg-zinc-800" />
        <Skeleton className="h-9 w-full bg-zinc-800 mt-2" />
      </div>
    </div>
  );
}

export function WishGrid({
  wishes,
  isLoading,
  hasSearchQuery,
  searchQuery,
  onComplete,
  onRestore,
  onEdit,
  onDelete,
}: WishGridProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <WishCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (wishes.length === 0) {
    if (hasSearchQuery) {
      return <NoResults searchQuery={searchQuery} />;
    }
    return <EmptyState />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishes.map((wish) => (
          <div key={wish.id} className="animate-fade-in">
            <WishCard
              wish={wish}
              onComplete={onComplete}
              onRestore={onRestore}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
