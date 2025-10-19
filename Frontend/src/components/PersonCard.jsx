import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, AlertTriangle } from "lucide-react";
import { StyledPlaceholder } from './ui/styledPlaceholder';

const PersonCard = ({ person }) => {
  const formatDate = (date) => new Date(date).toLocaleDateString();
  const hasValidImage = person?.images?.[0]?.url;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full max-w-sm">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-video overflow-hidden">
            {hasValidImage ? (
              <img
                src={person.images[0].url}
                alt={person.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
                <StyledPlaceholder />
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <Badge
              variant={person.status === 'lost' ? 'destructive' : 'secondary'}
              className="font-semibold"
            >
              {person.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold line-clamp-1 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              {person.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {person.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Last seen: {formatDate(person.dateReported)}</span>
            </div>
            {person.status === 'missing' && person.urgency === 'high' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Urgent: Immediate attention needed</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link to={`/person/${person._id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PersonCard;