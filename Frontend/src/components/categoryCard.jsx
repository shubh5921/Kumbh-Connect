import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { StyledPlaceholder } from './ui/styledPlaceholder';

const CategoryCard = ({ category }) => {
  if (!category) return null;
  const hasValidImage = category?.image;
  
  return (
    <Card className="group relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-6 flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-slate-100 rounded-full scale-125 transition-transform duration-300 group-hover:scale-150 -z-10" />
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center overflow-hidden">
            {hasValidImage ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-12 h-12 md:w-16 md:h-16 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
                <StyledPlaceholder />
              </div>
            )}
          </div>
        </div>

        <CardTitle className="text-center text-lg font-medium text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
          {category.name}
        </CardTitle>

        <div className="w-12 h-1 bg-slate-200 rounded-full transition-all duration-300 group-hover:w-24 group-hover:bg-slate-300" />
      </CardContent>
    </Card>
  );
};

export default CategoryCard;