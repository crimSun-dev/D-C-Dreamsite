import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Wish, type InsertWish, type Category, type Owner } from "@shared/schema";
import { HeroSection } from "@/components/hero-section";
import { CategoryFilters } from "@/components/category-filters";
import { SearchBar } from "@/components/search-bar";
import { WishGrid } from "@/components/wish-grid";
import { WishModal } from "@/components/wish-modal";
import { DeleteDialog } from "@/components/delete-dialog";

export default function Home() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [deleteWishId, setDeleteWishId] = useState<string | null>(null);
  const [deleteWishTitle, setDeleteWishTitle] = useState("");
  
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [selectedOwner, setSelectedOwner] = useState<Owner | "everyone">("everyone");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  const { data: wishes = [], isLoading } = useQuery<Wish[]>({
    queryKey: ["/api/wishes"],
  });

  const filteredWishes = useMemo(() => {
    return wishes.filter((wish) => {
      if (selectedCategory !== "all" && wish.category !== selectedCategory) {
        return false;
      }
      
      if (selectedOwner !== "everyone") {
        if (selectedOwner === "ours" && wish.owner !== "ours") {
          return false;
        } else if (selectedOwner !== "ours" && wish.owner !== selectedOwner) {
          return false;
        }
      }
      
      if (!showCompleted && wish.isCompleted) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = wish.title.toLowerCase().includes(query);
        const matchesDescription = wish.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }
      
      return true;
    });
  }, [wishes, selectedCategory, selectedOwner, showCompleted, searchQuery]);

  const fulfilledCount = wishes.filter((w) => w.isCompleted).length;
  const totalCount = wishes.length;

  const createWishMutation = useMutation({
    mutationFn: async (data: InsertWish) => {
      const response = await apiRequest("POST", "/api/wishes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishes"] });
      setIsModalOpen(false);
      toast({
        title: "Wish created!",
        description: "Your wish has been added to the list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create wish. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateWishMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertWish> }) => {
      const response = await apiRequest("PATCH", `/api/wishes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishes"] });
      setIsModalOpen(false);
      setEditingWish(null);
      toast({
        title: "Wish updated!",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update wish. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteWishMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/wishes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishes"] });
      setDeleteWishId(null);
      toast({
        title: "Wish deleted",
        description: "The wish has been removed from your list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete wish. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddWish = () => {
    setEditingWish(null);
    setIsModalOpen(true);
  };

  const handleEditWish = (wish: Wish) => {
    setEditingWish(wish);
    setIsModalOpen(true);
  };

  const handleDeleteWish = (id: string) => {
    const wish = wishes.find((w) => w.id === id);
    if (wish) {
      setDeleteWishId(id);
      setDeleteWishTitle(wish.title);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteWishId) {
      deleteWishMutation.mutate(deleteWishId);
    }
  };

  const handleCompleteWish = (id: string) => {
    updateWishMutation.mutate({ id, data: { isCompleted: true } });
  };

  const handleRestoreWish = (id: string) => {
    updateWishMutation.mutate({ id, data: { isCompleted: false } });
  };

  const removeCompletedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/wishes/completed/all");
      return response.json();
    },
    onSuccess: (data: { deleted: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishes"] });
      toast({
        title: "Completed wishes removed",
        description: `${data.deleted} completed wish${data.deleted !== 1 ? 'es' : ''} removed from your list.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove completed wishes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveCompleted = () => {
    removeCompletedMutation.mutate();
  };

  const handleSubmitWish = (data: InsertWish) => {
    if (editingWish) {
      updateWishMutation.mutate({ id: editingWish.id, data });
    } else {
      createWishMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        fulfilledCount={fulfilledCount}
        totalCount={totalCount}
        onAddWish={handleAddWish}
      />

      <CategoryFilters
        selectedCategory={selectedCategory}
        selectedOwner={selectedOwner}
        onCategoryChange={setSelectedCategory}
        onOwnerChange={setSelectedOwner}
      />

      <SearchBar
        searchQuery={searchQuery}
        showCompleted={showCompleted}
        completedCount={fulfilledCount}
        onSearchChange={setSearchQuery}
        onShowCompletedChange={setShowCompleted}
        onRemoveCompleted={handleRemoveCompleted}
      />

      <WishGrid
        wishes={filteredWishes}
        isLoading={isLoading}
        hasSearchQuery={!!searchQuery || selectedCategory !== "all" || selectedOwner !== "everyone"}
        searchQuery={searchQuery}
        onComplete={handleCompleteWish}
        onRestore={handleRestoreWish}
        onEdit={handleEditWish}
        onDelete={handleDeleteWish}
      />

      <WishModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        wish={editingWish}
        onSubmit={handleSubmitWish}
        isLoading={createWishMutation.isPending || updateWishMutation.isPending}
      />

      <DeleteDialog
        open={!!deleteWishId}
        onOpenChange={(open) => !open && setDeleteWishId(null)}
        onConfirm={handleConfirmDelete}
        wishTitle={deleteWishTitle}
      />
    </div>
  );
}
