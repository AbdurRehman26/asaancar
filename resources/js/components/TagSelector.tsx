import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/utils';

interface Tag {
  id: number;
  name: string;
  type: string;
  color: string;
}

interface TagSelectorProps {
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
  placeholder?: string;
}

export default function TagSelector({ selectedTags, onTagsChange, placeholder = "Search tags..." }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  // Search tags when query changes
  useEffect(() => {
    if (searchQuery.length > 0) {
      const timeoutId = setTimeout(() => {
        searchTags(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchTags();
    }
  }, [searchQuery]);

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

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/cars/filters');
      const data = await response.json();
      setTags(data.data?.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchTags = async (query: string) => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/cars/tags/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setTags(data.data || []);
    } catch (error) {
      console.error('Error searching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const getSelectedTags = () => {
    return tags.filter(tag => selectedTags.includes(tag.id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full border rounded px-3 py-2 pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">Loading...</div>
          ) : tags.length === 0 ? (
            <div className="p-3 text-center text-gray-500">No tags found</div>
          ) : (
            <div className="py-1">
              {tags.map(tag => (
                <label
                  key={tag.id}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="mr-3 rounded"
                  />
                  <span 
                    className="text-sm px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                      color: tag.color || '#374151',
                      border: `1px solid ${tag.color || '#d1d5db'}`
                    }}
                  >
                    {tag.name}
                  </span>
                  {tag.type && (
                    <span className="ml-2 text-xs text-gray-500">({tag.type})</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected tags display */}
      {getSelectedTags().length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {getSelectedTags().map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm"
              style={{ 
                backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                color: tag.color || '#374151',
                border: `1px solid ${tag.color || '#d1d5db'}`
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
