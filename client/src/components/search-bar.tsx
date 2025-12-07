import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchQuery: string;
  showCompleted: boolean;
  completedCount: number;
  onSearchChange: (query: string) => void;
  onShowCompletedChange: (show: boolean) => void;
  onRemoveCompleted: () => void;
}

export function SearchBar({
  searchQuery,
  showCompleted,
  completedCount,
  onSearchChange,
  onShowCompletedChange,
  onRemoveCompleted,
}: SearchBarProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            type="search"
            placeholder="Search your wishes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-pink-500 focus:ring-pink-500"
            data-testid="input-search"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            id="show-completed"
            checked={showCompleted}
            onCheckedChange={onShowCompletedChange}
            className="data-[state=checked]:bg-primary"
            data-testid="switch-show-completed"
          />
          <Label 
            htmlFor="show-completed" 
            className="text-sm text-zinc-400 cursor-pointer"
            data-testid="label-show-completed"
          >
            Show completed
          </Label>
        </div>

        {completedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRemoveCompleted}
            className="gap-2 border-zinc-700 text-zinc-300"
            data-testid="button-remove-completed"
          >
            <Trash2 className="w-4 h-4" />
            Remove completed ({completedCount})
          </Button>
        )}
      </div>
    </div>
  );
}
