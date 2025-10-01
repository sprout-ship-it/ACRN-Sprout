// src/hooks/useSavedProperties.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

const useSavedProperties = (user) => {
  const [savedProperties, setSavedProperties] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch saved properties from database
  const fetchSavedProperties = useCallback(async () => {
    if (!user?.id) {
      setSavedProperties(new Set());
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('favorited_property_id')
        .eq('favoriting_user_id', user.id)
        .eq('favorite_type', 'property');

      if (error) {
        console.error('Error fetching saved properties:', error);
        return;
      }

      // Convert to Set for efficient lookups
      const propertyIds = new Set(data.map(item => item.favorited_property_id));
      setSavedProperties(propertyIds);
      
    } catch (err) {
      console.error('Error in fetchSavedProperties:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Save a property to favorites
  const saveProperty = async (property) => {
    if (!user?.id) {
      console.warn('User must be logged in to save properties');
      return false;
    }

    if (savedProperties.has(property.id)) {
      console.log('Property already saved');
      return true; // Already saved
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          favoriting_user_id: user.id,
          favorited_property_id: property.id,
          favorite_type: 'property'
        });

      if (error) {
        console.error('Error saving property:', error);
        return false;
      }

      // Update local state
      setSavedProperties(prev => new Set([...prev, property.id]));
      return true;

    } catch (err) {
      console.error('Error in saveProperty:', err);
      return false;
    }
  };

  // Remove a property from favorites
  const unsaveProperty = async (propertyId) => {
    if (!user?.id) {
      console.warn('User must be logged in to unsave properties');
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('favoriting_user_id', user.id)
        .eq('favorited_property_id', propertyId)
        .eq('favorite_type', 'property');

      if (error) {
        console.error('Error unsaving property:', error);
        return false;
      }

      // Update local state
      setSavedProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      return true;

    } catch (err) {
      console.error('Error in unsaveProperty:', err);
      return false;
    }
  };

  // Toggle save status
  const toggleSaveProperty = async (property) => {
    if (savedProperties.has(property.id)) {
      return await unsaveProperty(property.id);
    } else {
      return await saveProperty(property);
    }
  };

  // Check if a property is saved
  const isPropertySaved = (propertyId) => {
    return savedProperties.has(propertyId);
  };

  // Get all saved property IDs as array
  const getSavedPropertyIds = () => {
    return Array.from(savedProperties);
  };

  // Load saved properties on mount and when user changes
  useEffect(() => {
    fetchSavedProperties();
  }, [fetchSavedProperties]);

  return {
    savedProperties,
    loading,
    saveProperty,
    unsaveProperty,
    toggleSaveProperty,
    isPropertySaved,
    getSavedPropertyIds,
    refetchSavedProperties: fetchSavedProperties
  };
};

export default useSavedProperties;