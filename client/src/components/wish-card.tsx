import { Check, Sparkles, Heart, User, RotateCcw, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Wish, categories, priorities } from "@shared/schema";
import { cn } from "@/lib/utils";

interface WishCardProps {
  wish: Wish;
  onComplete: (id: string) => void;
  onRestore: (id: string) => void;
  onEdit: (wish: Wish) => void;
  onDelete: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  products: "Product",
  travel: "Travel",
  shows: "Show",
  games: "Game",
  collections: "Collection",
  fashion: "Fashion",
  plans: "Plan",
};

const ownerColors: Record<string, { bg: string; text: string }> = {
  draven: { bg: "bg-blue-500/20", text: "text-blue-400" },
  clairine: { bg: "bg-pink-500/20", text: "text-pink-400" },
  ours: { bg: "bg-pink-500/20", text: "text-pink-400" },
};

const priorityColors: Record<string, { bg: string; border: string; text: string }> = {
  high: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
  medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  low: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
};

export function WishCard({ wish, onComplete, onRestore, onEdit, onDelete }: WishCardProps) {
  const priorityStyle = priorityColors[wish.priority] || priorityColors.medium;
  const ownerStyle = ownerColors[wish.owner] || ownerColors.ours;
  const categoryLabel = categoryLabels[wish.category] || wish.category;
  const priorityLabel = priorities.find(p => p.id === wish.priority)?.label.replace(" Priority", "") || "Medium";

  return (
    <Card 
      className={cn(
        "group relative overflow-visible border-zinc-800 bg-zinc-900/80 transition-all duration-200",
        wish.isCompleted && "opacity-75"
      )}
      data-testid={`card-wish-${wish.id}`}
    >
      {wish.isCompleted && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500">
            <Check className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      <div className="absolute -top-2 -right-2 z-20">
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs font-medium border",
            priorityStyle.bg,
            priorityStyle.border,
            priorityStyle.text
          )}
          data-testid={`badge-priority-${wish.id}`}
        >
          <Heart className="w-3 h-3 mr-1" />
          {priorityLabel}
        </Badge>
      </div>

      {wish.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={wish.imageUrl}
            alt={wish.title}
            className="w-full h-full object-cover"
            data-testid={`img-wish-${wish.id}`}
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="secondary" 
            className="bg-zinc-800 text-zinc-300 text-xs"
            data-testid={`badge-category-${wish.id}`}
          >
            {categoryLabel}
          </Badge>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs gap-1",
              ownerStyle.bg,
              ownerStyle.text
            )}
            data-testid={`badge-owner-${wish.id}`}
          >
            {wish.owner === "ours" ? (
              <Heart className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
            {wish.owner === "ours" ? "Ours" : wish.owner.charAt(0).toUpperCase() + wish.owner.slice(1)}
          </Badge>
        </div>

        <h3 
          className={cn(
            "font-semibold text-lg text-white leading-tight",
            wish.isCompleted && "line-through text-zinc-400"
          )}
          data-testid={`text-wish-title-${wish.id}`}
        >
          {wish.title}
        </h3>

        {wish.description && (
          <p 
            className="text-sm text-zinc-400 line-clamp-2"
            data-testid={`text-wish-description-${wish.id}`}
          >
            {wish.description}
          </p>
        )}

        <div className="flex items-center gap-2 pt-2">
          {wish.isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(wish.id)}
              className="flex-1 gap-2 border-zinc-700 text-zinc-300"
              data-testid={`button-restore-${wish.id}`}
            >
              <Sparkles className="w-4 h-4" />
              Restore
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onComplete(wish.id)}
              className="flex-1 gap-2 bg-primary text-primary-foreground"
              data-testid={`button-complete-${wish.id}`}
            >
              <Check className="w-4 h-4" />
              Complete
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(wish)}
            className="text-zinc-400 invisible group-hover:visible"
            data-testid={`button-edit-${wish.id}`}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(wish.id)}
            className="text-zinc-400 invisible group-hover:visible"
            data-testid={`button-delete-${wish.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
