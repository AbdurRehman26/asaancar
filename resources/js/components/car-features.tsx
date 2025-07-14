import React from 'react';

type CarFeaturesProps = {
  features: (string | null)[];
};

const CarFeatures: React.FC<CarFeaturesProps> = ({ features }) => (
  <div className="mb-4">
    <h4 className="text-sm font-semibold text-gray-800 mb-2">Features</h4>
    <div className="flex flex-wrap gap-1">
      {features.filter(Boolean).map((feature, index) => (
        <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
          {feature}
        </span>
      ))}
    </div>
  </div>
);

export default CarFeatures; 