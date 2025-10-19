import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Phone, Clock, Navigation, Loader, ArrowRight, Search } from 'lucide-react';
import { useGetStoresQuery } from '@/slices/storeSlice';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const StoreCard = ({ store, isSelected, onSelect }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`relative overflow-hidden ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}
  >
    <div
      className={`p-6 rounded-xl cursor-pointer transition-all duration-300 bg-white hover:shadow-lg ${
        isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Open Now
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Navigation className="h-4 w-4 mt-1 text-gray-400" />
          <span className="flex-1">{store.address}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{store.phone}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{store.hours}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button 
          variant="secondary" 
          className="flex-1 text-sm"
          onClick={() => window.open(
            `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
          )}
        >
          Get Directions
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  </motion.div>
);

export default function StoresPage() {
  const { data, isLoading, error } = useGetStoresQuery();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (data?.stores) {
      setStores(data.stores);

      const map = L.map('map').setView([25.42, 81.7760], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const createCustomIcon = (name, isSelected = false) => {
        return L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative">
              <div class="absolute transform -translate-x-1/2 -translate-y-full">
                <div class="${isSelected ? 'bg-primary' : 'bg-white'} 
                            text-${isSelected ? 'white' : 'gray-800'} 
                            px-3 py-1.5 rounded-lg shadow-lg 
                            border border-gray-200
                            whitespace-nowrap
                            text-sm font-medium
                            flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ${name}
                </div>
                <div class="absolute left-1/2 transform -translate-x-1/2 translate-y-[-2px]">
                  <div class="w-2 h-2 rotate-45 ${isSelected ? 'bg-primary' : 'bg-white'} border-r border-b border-gray-200"></div>
                </div>
              </div>
            </div>
          `,
          iconSize: null,
          iconAnchor: [0, 0],
        });
      };

      data.stores.forEach((store) => {
        const marker = L.marker([store.latitude, store.longitude], {
          icon: createCustomIcon(store.name)
        }).addTo(map);

        const updateMarker = () => {
          const isSelected = selectedStore?.id === store.id;
          marker.setIcon(createCustomIcon(store.name, isSelected));
        };

        marker.on('click', () => {
          setSelectedStore(store);
          map.flyTo([store.latitude, store.longitude], 15);
        });

        markersRef.current[store.id] = {
          marker,
          updateIcon: updateMarker
        };
      });

      map.on('zoomend', () => {
        Object.values(markersRef.current).forEach(({ updateIcon }) => {
          updateIcon();
        });
      });

      return () => map.remove();
    }
  }, [data, selectedStore]);

  useEffect(() => {
    if (selectedStore) {
      Object.values(markersRef.current).forEach(({ updateIcon }) => {
        updateIcon();
      });
    }
  }, [selectedStore]);

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    mapRef.current.flyTo([store.latitude, store.longitude], 15);
    markersRef.current[store.id].marker.openPopup();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Our Centers</CardTitle>
                <p className="text-gray-500">Find the nearest center location</p>
              </CardHeader>
              <CardContent>
                <div id="map" className="h-[600px] rounded-xl overflow-hidden shadow-inner" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Center Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search centers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="h-[575px] pr-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500 p-4">Unable to load centers</div>
                  ) : filteredStores.length === 0 ? (
                    <div className="text-center text-gray-500 p-4">No centers found</div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {filteredStores.map((store) => (
                          <StoreCard
                            key={store.id}
                            store={store}
                            isSelected={selectedStore?.id === store.id}
                            onSelect={() => handleStoreSelect(store)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}