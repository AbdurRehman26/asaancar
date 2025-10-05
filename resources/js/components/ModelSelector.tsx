import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  brandId: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface ModelOption {
  id: number;
  name: string;
  slug: string;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  brandId,
  placeholder = "Type or select a model...",
  disabled = false,
  className = ""
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(selectedModel);
  const [options, setOptions] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch models when brand changes
  useEffect(() => {
    if (brandId) {
      fetchModels(brandId);
    } else {
      setOptions([]);
    }
  }, [brandId]);

  // Update input value when selectedModel changes externally
  useEffect(() => {
    setInputValue(selectedModel);
  }, [selectedModel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchModels = async (brandId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/car-models/brand/${brandId}`);
      const data = await response.json();
      if (data.success) {
        setOptions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (brandId) {
      setIsOpen(true);
    }
  };

  const handleSelectModel = (model: ModelOption) => {
    setInputValue(model.name);
    onModelChange(model.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    if (inputValue.trim() && brandId) {
      onModelChange(inputValue.trim());
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = () => {
    setInputValue('');
    onModelChange('');
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showCreateOption = searchTerm.trim() && 
    !filteredOptions.some(option => 
      option.name.toLowerCase() === searchTerm.toLowerCase()
    );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={disabled ? "Select a brand first" : placeholder}
          disabled={disabled || !brandId}
          className={`w-full border rounded px-3 py-2 pr-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
            disabled || !brandId ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''
          }`}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center"
              disabled={disabled}
            >
              <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center"
            disabled={disabled || !brandId}
          >
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </button>
        </div>
      </div>

      {isOpen && brandId && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">Loading models...</div>
          ) : (
            <>
              {filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectModel(option)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                >
                  {option.name}
                </button>
              ))}
              
              {showCreateOption && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none text-blue-600 dark:text-blue-400 border-t border-gray-200 dark:border-gray-600"
                >
                  Create "{searchTerm}"
                </button>
              )}
              
              {filteredOptions.length === 0 && !showCreateOption && searchTerm && (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  No models found for "{searchTerm}"
                </div>
              )}
              
              {filteredOptions.length === 0 && !searchTerm && (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  No models available for this brand
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
