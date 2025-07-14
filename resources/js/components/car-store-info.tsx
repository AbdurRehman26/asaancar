import React from 'react';
import { Star, MapPin } from 'lucide-react';

type CarStoreInfoProps = {
  store: {
    name: string;
    address: string;
    phone: string;
    rating: number;
    reviews: number;
  };
};

const CarStoreInfo: React.FC<CarStoreInfoProps> = ({ store }) => (
  <div className="border-t pt-4 mb-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-semibold text-gray-800">{store.name}</h4>
      <div className="flex items-center">
        <Star className="h-4 w-4 text-yellow-400 fill-current" />
        <span className="text-sm text-gray-700 ml-1">{store.rating}</span>
        <span className="text-sm text-gray-500 ml-1">({store.reviews})</span>
      </div>
    </div>
    <div className="flex items-center text-sm text-gray-700 mb-1">
      <MapPin className="h-4 w-4 mr-2" />
      {store.address}
    </div>
    <div className="text-sm text-gray-700">
      📞 {store.phone}
    </div>
  </div>
);

export default CarStoreInfo; 