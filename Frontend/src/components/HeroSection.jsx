import { Link } from "react-router-dom";
import { Card, CardHeader, CardDescription, CardTitle, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, UserX, Package } from "lucide-react";

export const HeroSection = () => {
  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      
      <div className="relative">
        <CardHeader className="pb-6">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Mahakumbh Lost & Found Portal
          </CardTitle>
          <CardDescription className="text-gray-100 text-xl font-medium mt-2">
            Lost something? Found something? We're here to help.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <p className="text-gray-300 max-w-2xl">
            Our portal helps reconnect lost items and missing persons with their rightful owners during the Mahakumbh festival. Report or search for lost belongings and help others find what they've lost.
          </p>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-4">
          <Link to="/report/person">
            <Button 
              variant="default" 
              size="lg"
              className="bg-red-600 hover:bg-red-700 gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <UserX className="h-5 w-5" />
              Report Missing Person
            </Button>
          </Link>
          
          <div className="flex gap-3">
            <Link to="/report/item">
              <Button 
                variant="secondary" 
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Package className="h-5 w-5" />
                Report Lost/Found Item
              </Button>
            </Link>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};
