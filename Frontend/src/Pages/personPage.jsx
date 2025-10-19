import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { 
    Loader2, MapPin, User, Tag, Check, X, ArrowLeft, 
    Phone, Home, AlertTriangle, 
    AlertTriangleIcon,
    Clock
} from "lucide-react";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useGetPersonByIdQuery } from "@/slices/personSlice";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import MapComponent from "@/components/map";
import 'react-photo-view/dist/react-photo-view.css';
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  
  
const DetailsCard = ({ person }) => {
    const formatDate = (date) => new Date(date).toLocaleDateString();

    if (person.status === 'found') {
        return (
            <Card>
                <CardContent className="grid gap-6 p-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Collection Center Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Home className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-gray-500">Centre Name</div>
                                    <div className="font-medium">{person.centre?.name}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-gray-500">Contact Number</div>
                                    <div className="font-medium">{person.centre?.phone}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-gray-500">Address</div>
                                    <div className="font-medium">{person.centre?.address}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-primary" />
                                <div>
                                    <div className="text-sm text-gray-500">Working Hours</div>
                                    <div className="font-medium">{person.centre?.hours}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                This person has been found and is currently at the above center. 
                                If you are the guardian, please bring proper identification documents to collect them during the specified working hours. Go to <Link className="text-blue-500" to={'/centres'}>Centres Details</Link>
                            </AlertDescription>
                        </Alert>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="grid gap-6 p-6">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Guardian Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                                <div className="text-sm text-gray-500">Guardian Name</div>
                                <div className="font-medium">{person.guardian.name}</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-primary" />
                            <div>
                                <div className="text-sm text-gray-500">Contact Number</div>
                                <div className="font-medium">{person.guardian.phoneNumber}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Tag className="h-5 w-5 text-primary" />
                            <div>
                                <div className="text-sm text-gray-500">Relationship</div>
                                <div className="font-medium">{person.guardian.relation}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-4">Guardian's Address</h3>
                    <div className="space-y-2">
                        {person.guardian.address.street && (
                            <div className="text-gray-600">{person.guardian.address.street}</div>
                        )}
                        <div className="text-gray-600">
                            {[
                                person.guardian.address.city,
                                person.guardian.address.state,
                                person.guardian.address.postalCode
                            ].filter(Boolean).join(', ')}
                        </div>
                        {person.guardian.address.country && (
                            <div className="text-gray-600">{person.guardian.address.country}</div>
                        )}
                    </div>
                </div>

                {person.status === 'returned' && (
                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-600">
                            <Check className="h-5 w-5" />
                            Person Found and Returned
                        </h3>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-green-700">
                                This person has been safely returned to their guardian.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const PersonStatus = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'lost':
                return {
                    variant: 'destructive',
                    label: 'MISSING',
                    icon: AlertTriangle,
                    description: 'Currently Missing'
                };
            case 'found':
                return {
                    variant: 'warning',
                    label: 'FOUND',
                    icon: Check,
                    description: 'Found but Not Yet Returned'
                };
            case 'returned':
                return {
                    variant: 'success',
                    label: 'RETURNED',
                    icon: Check,
                    description: 'Safely Returned'
                };
            default:
                return {
                    variant: 'secondary',
                    label: status.toUpperCase(),
                    icon: Tag,
                    description: 'Status Unknown'
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <div className="flex gap-2 items-center flex-wrap">
            <Badge variant={config.variant} className="text-sm font-medium gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
            <Badge variant="outline" className="gap-1">
                {config.description}
            </Badge>
        </div>
    );
};

const PersonPage = () => {
    const { personId } = useParams();
    const { data, isLoading, error } = useGetPersonByIdQuery(personId);
    const person = data?.person;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        if (error) {
            toast({
                title: "Failed to Load Person Details",
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

    if (!person) {
        return (
            <Card className="m-8">
                <CardContent className="p-8 text-center text-gray-500">
                    Person not found or has been removed.
                </CardContent>
            </Card>
        );
    }

    return (
        <PhotoProvider>
            <div className="container mx-auto px-4 py-8">
                <Link 
                    to="/menu"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                
                {person.status === 'lost' && (
                    <Alert className="mb-6 bg-red-50 border-red-200">
                        <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            This person is currently missing. If you have any information, please contact the authorities immediately.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid lg:grid-cols-2 gap-12">
                    <ImageGallery
                        images={person.images}
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
                            <h1 className="text-4xl font-bold">{person.name}</h1>
                            <div className="text-lg text-gray-600">Age: {person.age} years</div>
                            <PersonStatus status={person.status} />
                        </div>

                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="description">Description</TabsTrigger>
                                <TabsTrigger value="details">Contact Info</TabsTrigger>
                                <TabsTrigger value="location">Location</TabsTrigger>
                            </TabsList>

                            <TabsContent value="description" className="space-y-6">
                                <p className="text-gray-600 leading-relaxed">{person.description}</p>
                            </TabsContent>

                            <TabsContent value="details">
                                <DetailsCard person={person} />
                            </TabsContent>

                            <TabsContent value="location" className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span className="font-medium">Last Known Location</span>
                                </div>
                                <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                                    <MapComponent
                                        latitude={person.location.latitude}
                                        longitude={person.location.longitude}
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

export default PersonPage;