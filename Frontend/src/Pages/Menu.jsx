import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Archive, ChartBarStacked, Package, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useGetItemsQuery } from "@/slices/itemSlice";
import { useGetPersonsQuery } from "@/slices/personSlice";
import { useGetItemCategoryQuery } from "@/slices/categorySlice";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import CategoryCard from "@/components/categoryCard";
import ItemCard from "@/components/ItemCard";
import { HeroSection } from "@/components/HeroSection";
import PersonCard from "@/components/PersonCard";

const ItemSkeleton = () => (
  <div className="space-y-3">
    <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
    </div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <Card className="border-red-200 bg-red-50">
    <CardContent className="p-4 flex items-center gap-2 text-red-600">
      <AlertCircle className="h-5 w-5" />
      <p>{message}</p>
    </CardContent>
  </Card>
);

export default function MenuPage() {
  const { data: itemData, isLoading: isFetchingItems, error: errorInFetchingItems } = useGetItemsQuery();
  const { data: personData, isLoading: isFetchingPersons, error: errorInFetchingPersons } = useGetPersonsQuery();
  const { data: catData, isLoading: isFetchingCategory, error: errorInFetchingCategories } = useGetItemCategoryQuery();
  
  const items = itemData?.items || [];
  const persons = personData?.persons || [];
  const categories = catData?.categories || [];
  const [error, setError] = useState(null);

  useEffect(() => {
    const errors = [
      errorInFetchingItems,
      errorInFetchingPersons,
      errorInFetchingCategories
    ].filter(Boolean);

    if (errors.length > 0) {
      const errorMessage = errors[0]?.data?.message || "An unexpected error occurred.";
      toast({
        title: "Failed to Load Content",
        description: errorMessage,
        variant: "destructive",
      });
      setError(errorMessage);
    }
  }, [errorInFetchingItems, errorInFetchingPersons, errorInFetchingCategories]);

  const NoContentCard = ({ type, icon: Icon }) => (
    <Card className="p-8 text-center">
      <CardContent className="space-y-2">
        <div className="flex justify-center">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold">No {type} Found</h3>
        <p className="text-gray-500">
          No {type.toLowerCase()} have been reported yet
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <HeroSection />

        {error && <ErrorMessage message={error} />}

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Categories</h2>
          </div>
          
          {isFetchingCategory ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {categories.length>0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to={`/category/${category._id}`}>
                      <CategoryCard category={category} />
                    </Link>
                  </motion.div>
                ))}
              </div>
              )}
               {items.length === 0 && persons.length === 0 && (
                    <NoContentCard type="Categories" icon={ChartBarStacked} />
              )}
            </>
          )}
        </section>

        <section className="space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Recent Reports</h2>
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="items" className="gap-2">
                  <Package className="h-4 w-4" />
                  Items
                </TabsTrigger>
                <TabsTrigger value="persons" className="gap-2">
                  <Users className="h-4 w-4" />
                  Persons
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-6">
              {isFetchingItems || isFetchingPersons ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <ItemSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  {persons.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Missing & Found Persons
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {persons.map((person) => (
                          <motion.div
                            key={person._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <PersonCard person={person} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {items.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Lost & Found Items
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ItemCard item={item} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {items.length === 0 && persons.length === 0 && (
                    <NoContentCard type="Reports" icon={Archive} />
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="items">
              {isFetchingItems ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <ItemSkeleton key={i} />
                  ))}
                </div>
              ) : items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ItemCard item={item} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <NoContentCard type="Items" icon={Package} />
              )}
            </TabsContent>

            <TabsContent value="persons">
              {isFetchingPersons ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <ItemSkeleton key={i} />
                  ))}
                </div>
              ) : persons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {persons.map((person) => (
                    <motion.div
                      key={person._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PersonCard person={person} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <NoContentCard type="Persons" icon={Users} />
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}