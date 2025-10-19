import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, MapPin, User, Calendar, Tag, Check, X, ArrowLeft } from "lucide-react";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useGetItemByIdQuery } from "@/slices/itemSlice";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import MapComponent from "@/components/map";
import 'react-photo-view/dist/react-photo-view.css';
import { useClaimItemMutation } from "@/slices/claimItemSlice";
import { StyledPlaceholder } from "@/components/ui/styledPlaceholder";

const ImageGallery = ({ images, currentIndex, onImageSelect, imageLoading, setImageLoading }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4"
    >
      <div className="pl-2 pt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {images.map((image, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (currentIndex !== index) {
                setImageLoading(true);
                onImageSelect(index);
              }
            }}
            className={`flex-shrink-0 transition-all duration-200 rounded-lg overflow-hidden ${
              currentIndex === index
                ? 'ring-2 ring-primary ring-offset-2'
                : 'hover:opacity-80'
            }`}
          >
            {image.url ? (
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="h-16 w-16 object-cover"
              />
            ) : (
              <div className="h-16 w-16">
                <StyledPlaceholder />
              </div>
            )}
          </motion.button>
        ))}
      </div>
  
      <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-lg">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <PhotoView src={images[currentIndex]?.url}>
          <AspectRatio ratio={1}>
            {images[currentIndex]?.url ? (
              <img
                src={images[currentIndex].url}
                alt="Main product view"
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            ) : (
              <StyledPlaceholder className={`transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`} />
            )}
          </AspectRatio>
        </PhotoView>
      </div>
    </motion.div>
  );
  
  
const DetailsCard = ({ item }) => {
    const formatDate = (date) => new Date(date).toLocaleDateString();

    return (
        <Card>
            <CardContent className="grid gap-6 p-6">
                <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                        <div className="text-sm text-gray-500">Reported by</div>
                        <div className="font-medium">{item.reportedBy?.firstName} {item.reportedBy?.lastName}</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                        <div className="text-sm text-gray-500">Date Reported</div>
                        <div className="font-medium">{formatDate(item.dateReported)}</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <div>
                        <div className="text-sm text-gray-500">Category</div>
                        <div className="font-medium">{item.category.name}</div>
                    </div>
                </div>

                {item.returnedToOwner && (
                    <>
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-lg mb-4">Return Details</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-green-600" />
                                    <div>
                                        <div className="text-sm text-gray-500">Returned To</div>
                                        <div className="font-medium">
                                            {item.returnedTo?.firstName} {item.returnedTo?.lastName}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    <div>
                                        <div className="text-sm text-gray-500">Return Date</div>
                                        <div className="font-medium">{formatDate(item.returnedOn)}</div>
                                    </div>
                                </div>

                                {item.returnNotes && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-500 mb-1">Return Notes</div>
                                        <div className="text-gray-700">{item.returnNotes}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};


const ItemStatus = ({ status, returnedToOwner, returnedTo }) => (
    <div className="flex gap-2 items-center flex-wrap">
      <Badge variant={status === 'lost' ? 'destructive' : 'success'} className="text-sm font-medium">
        {status.toUpperCase()}
      </Badge>
      {returnedToOwner ? (
        <Badge variant="outline" className="gap-2">
          <Check className="w-3 h-3" /> 
          Returned to 
          <span className="font-semibold">
            {returnedTo 
              ? `${returnedTo.firstName} ${returnedTo.lastName}` 
              : 'Owner'}
          </span>
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1">
          <X className="w-3 h-3" /> Not Yet Returned
        </Badge>
      )}
    </div>
  );
  

const ItemPage = () => {
    const { itemId } = useParams();
    const { data, isLoading, error } = useGetItemByIdQuery(itemId);
    const item = data?.item;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);
    const [claimItem, { isLoading: isClaiming }] = useClaimItemMutation();

    const handleClaimItem = async () => {
        try {
            const res = await claimItem({item:item._id}).unwrap();
            if (res.success) {
                toast({
                    title: "Claim Request Submitted Successfully",
                    className: "bg-green-50 border-green-200",
                });
            } else {
                toast({
                    title: "Failed to Submit Claim Request",
                    description: res.message,
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Failed to Submit Claim Request",
                description: err?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (error) {
            toast({
                title: "Failed to Load Item",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }, [error]);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!item) {
        return (
            <Card className="m-8">
                <CardContent className="p-8 text-center text-gray-500">
                    Item not found or has been removed.
                </CardContent>
            </Card>
        );
    }

    const canClaim = item.status === 'found' && !item.returnedToOwner;

    return (
        <PhotoProvider>
            <div className="container mx-auto px-4 py-8">
                <Link 
                    to="/menu"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
                
                <div className="grid lg:grid-cols-2 gap-12">
                    <ImageGallery
                        images={item.images}
                        currentIndex={currentImageIndex}
                        onImageSelect={(index) => {
                            setCurrentImageIndex(index);
                            setImageLoading(true);
                        }}
                        imageLoading={imageLoading}
                        setImageLoading={setImageLoading}
                    />

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold">{item.name}</h1>
                            <ItemStatus status={item.status} returnedToOwner={item.returnedToOwner} returnedTo={item.returnedTo} />
                        </div>

                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="description">Description</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="location">Location</TabsTrigger>
                            </TabsList>

                            <TabsContent value="description" className="space-y-6">
                                <Link
                                    to={`/category/${item.category._id}`}
                                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                                >
                                    <Tag className="h-4 w-4" />
                                    {item.category.name}
                                </Link>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                {canClaim && (
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            onClick={handleClaimItem}
                                            disabled={isClaiming}
                                            className="w-full sm:w-auto min-w-[120px]"
                                            size="lg"
                                        >
                                            {isClaiming ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Claiming...
                                                </>
                                            ) : (
                                                'Claim Item'
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </TabsContent>

                            <TabsContent value="details">
                            <DetailsCard item={item} />
                            </TabsContent>

                            <TabsContent value="location" className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span className="font-medium">Last Known Location</span>
                                </div>
                                <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                                    <MapComponent
                                        latitude={item.location.latitude}
                                        longitude={item.location.longitude}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>
            </div>
        </PhotoProvider>
    );
};

export default ItemPage;