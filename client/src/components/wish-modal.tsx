import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Heart, X, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { type Wish, type InsertWish, categories, priorities, owners } from "@shared/schema";

const wishFormSchema = z.object({
  title: z.string().min(1, "Please enter what you wish for"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority"),
  owner: z.string().min(1, "Please select an owner"),
});

type WishFormValues = z.infer<typeof wishFormSchema>;

interface WishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wish?: Wish | null;
  onSubmit: (data: InsertWish) => void;
  isLoading?: boolean;
}

export function WishModal({
  open,
  onOpenChange,
  wish,
  onSubmit,
  isLoading = false,
}: WishModalProps) {
  const isEditing = !!wish;
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<WishFormValues>({
    resolver: zodResolver(wishFormSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      category: "products",
      priority: "medium",
      owner: "draven",
    },
  });

  useEffect(() => {
    if (wish) {
      form.reset({
        title: wish.title,
        description: wish.description || "",
        imageUrl: wish.imageUrl || "",
        category: wish.category,
        priority: wish.priority,
        owner: wish.owner,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        imageUrl: "",
        category: "products",
        priority: "medium",
        owner: "draven",
      });
    }
    setUploadedFile(null);
  }, [wish, form, open]);

  const handleSubmit = (values: WishFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description || null,
      imageUrl: values.imageUrl || null,
      category: values.category,
      priority: values.priority,
      owner: values.owner,
      isCompleted: wish?.isCompleted || false,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("imageUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <Sparkles className="w-5 h-5 text-pink-400" />
            {isEditing ? "Edit Wish" : "Add New Wish"}
            <Heart className="w-4 h-4 text-pink-400 ml-1" />
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 pt-4 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">What do you wish for?</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your wish..."
                      className="bg-zinc-800 border-pink-500 text-white placeholder:text-zinc-500 focus:border-pink-400 focus:ring-pink-400"
                      {...field}
                      data-testid="input-wish-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details about your wish..."
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none focus:border-pink-400 focus:ring-pink-400"
                      rows={3}
                      {...field}
                      data-testid="input-wish-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-pink-400 focus:ring-pink-400"
                      {...field}
                      data-testid="input-wish-image-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center text-zinc-500 text-sm">OR</div>

            <div>
              <p className="text-pink-400 text-sm mb-2">Upload Image (optional, max 5MB)</p>
              <label className="flex items-center gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-md cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-400">Choose file</span>
                <span className="text-sm text-zinc-500 ml-2">
                  {uploadedFile ? uploadedFile.name : "No file chosen"}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-wish-image-file"
                />
              </label>
              <p className="text-pink-400 text-xs mt-1">Only .jpg, .jpeg, .png and .gif formats are supported.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="bg-zinc-800 border-zinc-700 text-white focus:ring-pink-400"
                          data-testid="select-category"
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {categories.filter(c => c.id !== "all").map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="text-white focus:bg-zinc-700"
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="bg-zinc-800 border-zinc-700 text-white focus:ring-pink-400"
                          data-testid="select-priority"
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {priorities.map((priority) => (
                          <SelectItem
                            key={priority.id}
                            value={priority.id}
                            className="text-white focus:bg-zinc-700"
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Whose wish is this?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger 
                        className="bg-zinc-800 border-zinc-700 text-white focus:ring-pink-400"
                        data-testid="select-owner"
                      >
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {owners.filter(o => o.id !== "everyone").map((owner) => (
                        <SelectItem
                          key={owner.id}
                          value={owner.id}
                          className="text-white focus:bg-zinc-700"
                        >
                          {owner.id === "draven" ? "Draven's Wish" : 
                           owner.id === "clairine" ? "Clairine's Wish" : 
                           "Our Dreams"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-zinc-700 text-white"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-primary-foreground"
                data-testid="button-submit-wish"
              >
                {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Make a Wish"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
