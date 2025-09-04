'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Upload, School, MapPin, Phone, Mail, Image as ImageIcon, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { validationRules } from '../../utils/validation';
const formSchema = yup.object({
  name: yup
    .string()
    .required('Please enter the school name')
    .min(2, 'School name should be at least 2 characters')
    .max(100, 'School name is too long'),
  address: yup
    .string()
    .required('Please provide the school address')
    .min(10, 'Please provide a complete address')
    .max(500, 'Address is too long'),
  city: yup
    .string()
    .required('Please select the city')
    .min(2, 'City name is too short')
    .max(50, 'City name is too long'),
  state: yup
    .string()
    .required('Please select the state'),
  contact: yup
    .string()
    .required('Contact number is required')
    .matches(validationRules.contact.regex, 'Please enter a valid 10-digit mobile number'),
  email_id: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address')
    .max(100, 'Email address is too long'),
});

export default function AddSchool({ onSchoolAdded }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(formSchema)
  });

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadSchoolImage = async () => {
    if (!selectedImage) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.isDuplicate) {
          toast.success('Image already exists in our system - using existing copy!');
        } else {
          toast.success('Image uploaded successfully to Cloudinary!');
        }
        return result.url;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      // First, check for duplicates BEFORE uploading image
      setCheckingDuplicates(true);
      console.log('🔍 Checking for duplicates...');
      const duplicateCheckResponse = await fetch('/api/schools/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_id: formData.email_id,
          contact: formData.contact,
        }),
      });

      const duplicateResult = await duplicateCheckResponse.json();
      setCheckingDuplicates(false);
      
      if (!duplicateResult.success) {
        toast.error(duplicateResult.message);
        setIsSubmitting(false);
        return;
      }

      // Only upload image if no duplicates found
      let imageUrl = null;
      if (selectedImage) {
        console.log('📸 No duplicates found, uploading image...');
        imageUrl = await uploadSchoolImage();
      }

      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('School added successfully! Thank you for contributing.');
        reset();
        setSelectedImage(null);
        setImagePreview(null);
        
        if (onSchoolAdded) {
          onSchoolAdded(result.data);
        }
      } else {
        toast.error(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to add school. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
      setCheckingDuplicates(false);
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <School size={16} className="mr-2 text-blue-600" />
            School Name *
          </label>
          <input
            type="text"
            {...register('name')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g. Delhi Public School"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin size={16} className="mr-2 text-blue-600" />
            Complete Address *
          </label>
          <textarea
            {...register('address')}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g. Mathura Road, New Delhi - 110076"
          />
          {errors.address && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="mr-2 text-blue-600" />
              City *
            </label>
            <input
              type="text"
              {...register('city')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. New Delhi"
            />
            {errors.city && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.city.message}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="mr-2 text-blue-600" />
              State *
            </label>
            <select
              {...register('state')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Choose a state</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.state.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="mr-2 text-blue-600" />
              Contact Number *
            </label>
            <input
              type="tel"
              {...register('contact')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.contact ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. 9876543210"
            />
            {errors.contact && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.contact.message}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="mr-2 text-blue-600" />
              Email Address *
            </label>
            <input
              type="email"
              {...register('email_id')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.email_id ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. info@school.com"
            />
            {errors.email_id && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.email_id.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <ImageIcon size={16} className="mr-2 text-blue-600" />
            School Photo (Optional)
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelection}
              className="sr-only"
              id="school-image"
            />
            <label
              htmlFor="school-image"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              {imagePreview ? (
                <div className="flex items-center space-x-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded"
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Image selected</p>
                    <p>Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload school photo</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <Plus size={12} className="rotate-45" />
              </button>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || uploadingImage || checkingDuplicates}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isSubmitting || uploadingImage || checkingDuplicates ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>
                  {checkingDuplicates 
                    ? 'Checking for duplicates...' 
                    : uploadingImage 
                    ? 'Uploading image...' 
                    : 'Adding school...'
                  }
                </span>
              </>
            ) : (
              <>
                <Plus size={20} />
                <span>Add School to Directory</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
