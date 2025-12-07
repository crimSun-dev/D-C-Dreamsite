import { 
  Sparkles, 
  Gift, 
  Plane, 
  Clapperboard, 
  Gamepad2, 
  Bookmark, 
  Shirt, 
  Calendar,
  Heart,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, owners, type Category, type Owner } from "@shared/schema";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Gift,
  Plane,
  Clapperboard,
  Gamepad2,
  Bookmark,
  Shirt,
  Calendar,
};

interface CategoryFiltersProps {
  selectedCategory: Category | "all";
  selectedOwner: Owner | "everyone";
  onCategoryChange: (category: Category | "all") => void;
  onOwnerChange: (owner: Owner | "everyone") => void;
}

export function CategoryFilters({
  selectedCategory,
  selectedOwner,
  onCategoryChange,
  onOwnerChange,
}: CategoryFiltersProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((category) => {
          const Icon = iconMap[category.icon];
          const isActive = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id as Category | "all")}
              className={cn(
                "gap-1.5 rounded-full px-4 transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-transparent border-zinc-700 text-zinc-400"
              )}
              data-testid={`button-category-${category.id}`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {category.label}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {owners.map((owner) => {
          const isActive = selectedOwner === owner.id;
          
          let textColorClass = "text-zinc-400";
          if (owner.id === "draven") {
            textColorClass = "text-blue-500"; // Blue for Draven
          } else if (owner.id === "clairine") {
            textColorClass = "text-pink-500"; // Pink for Clairine
          }

          return (
            <Button
              key={owner.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onOwnerChange(owner.id as Owner | "everyone")}
              className={cn(
                "gap-1.5 rounded-full px-4 transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground"
                  : `bg-transparent border-zinc-700 ${textColorClass}`
              )}
              data-testid={`button-owner-${owner.id}`}
            >
              {owner.avatar === "heart" ? (
                <Heart className="w-4 h-4" />
              ) : owner.avatar ? (
                <div 
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-zinc-600 text-zinc-300"
                  )}
                  data-testid={`avatar-owner-${owner.id}`}
                >
                  {owner.avatar}
                </div>
              ) : (
                <User className="w-4 h-4" />
              )}
              {owner.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
