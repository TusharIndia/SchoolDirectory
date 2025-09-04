'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Phone, Mail, School, Grid, List as ListIcon, Star, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

export default function ShowSchools() {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [displayMode, setDisplayMode] = useState('grid');

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schools, searchQuery, selectedCity, selectedState]);

  const loadSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      const data = await response.json();

      if (data.success) {
        setSchools(data.data);
      } else {
        toast.error('Unable to load schools. Please try again.');
      }
    } catch (error) {
      console.error('Error loading schools:', error);
      toast.error('Something went wrong while loading schools.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schools];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(school => 
        school.name.toLowerCase().includes(query) ||
        school.city.toLowerCase().includes(query) ||
        school.address.toLowerCase().includes(query) ||
        school.state.toLowerCase().includes(query)
      );
    }

    if (selectedCity) {
      filtered = filtered.filter(school => 
        school.city.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    if (selectedState) {
      filtered = filtered.filter(school => 
        school.state.toLowerCase() === selectedState.toLowerCase()
      );
    }

    setFilteredSchools(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedState('');
  };

  const availableCities = [...new Set(schools.map(school => school.city))].sort();
  const availableStates = [...new Set(schools.map(school => school.state))].sort();

  const SchoolCard = ({ school, index }) => {
    const optimizedImageUrl = getOptimizedImageUrl(school.image, 'medium');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
      >
        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
          {optimizedImageUrl ? (
            <Image
              src={optimizedImageUrl}
              alt={`${school.name} school building`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <School size={48} className="text-blue-400" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
              <Star size={14} className="text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {school.name}
          </h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-start space-x-2 text-gray-600">
              <MapPin size={14} className="mt-1 flex-shrink-0 text-blue-500" />
              <span className="text-sm line-clamp-2">{school.address}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin size={14} className="flex-shrink-0 text-green-500" />
              <span className="text-sm font-medium">{school.city}, {school.state}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              <a
                href={`tel:${school.contact}`}
                className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                title="Call school"
              >
                <Phone size={14} />
              </a>
              <a
                href={`mailto:${school.email_id}`}
                className="flex items-center justify-center w-8 h-8 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                title="Send email"
              >
                <Mail size={14} />
              </a>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 group">
              <span>View Details</span>
              <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search schools, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">All Cities</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">All States</option>
              {availableStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {(searchQuery || selectedCity || selectedState) && (
              <button
                onClick={resetFilters}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={14} />
                <span>Clear</span>
              </button>
            )}

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  displayMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  displayMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="List view"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {filteredSchools.length === 0 ? 'No schools found' : 
             `Showing ${filteredSchools.length} of ${schools.length} schools`}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {filteredSchools.length === 0 ? (
          <div className="text-center py-16">
            <School size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No schools found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCity || selectedState
                ? "Try adjusting your search criteria"
                : "No schools have been added yet"}
            </p>
            {(searchQuery || selectedCity || selectedState) && (
              <button
                onClick={resetFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Show All Schools
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school, index) => (
              <SchoolCard key={school.id} school={school} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
