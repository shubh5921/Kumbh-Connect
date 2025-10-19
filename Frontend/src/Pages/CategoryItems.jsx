import ItemCard from "@/components/ItemCard";
import { useEffect, useState } from "react";
import { useGetItemsByCategoryQuery } from "@/slices/itemSlice";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";


export default function CategoryItems() {
  const { categoryId } = useParams();
  const { data, isLoading, error, refetch } = useGetItemsByCategoryQuery(categoryId);
  const items = data?.items || [];
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to Load Items",
        description: error?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (items || data) {
      setCategory(data?.category);
    }
  }, [items, data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="m-5 flex justify-center items-center flex-col gap-5">
      <HeroSection key={1} />
      {category ? (
        <>
          <h2 className="text-2xl w-full text-start">
            All Listings in <b>{category?.name}</b>
          </h2>
          <p className="text-gray-500">
            {items?.length} items found in the <b>{category?.name}</b> category.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items && items.length > 0 ? (
              <>
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </>
            ) : (
              <p>No items found in this category.</p>
            )}
          </div>
        </>
      ) : (
        <p>Category not found.</p>
      )}
    </div>
  );
}
