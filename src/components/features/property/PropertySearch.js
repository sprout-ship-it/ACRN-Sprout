// src/components/features/property/PropertySearch.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';
import '../../../styles/global.css';

const PropertySearch = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [searchMode, setSearchMode] = useState('basic'); // 'basic' or 'recovery'
  const [savedProperties, setSavedProperties] = useState(new Set()); // Track saved properties
  
  // ✅ FIXED: Restructured search filters to match database schema
  const [basicFilters, setBasicFilters] = useState({
    location: '',
    state: '',
    maxRent: '',
    minBedrooms: '',
    housingType: [], // Array to match database structure
    furnished: false,
    petsAllowed: false,
    utilityBudget: ''
  });

  // ✅ IMPROVED: Recovery-specific search filters
  const [recoveryFilters, setRecoveryFilters] = useState({
    recoveryHousingOnly: true,
    soberness: '',
    caseManagement: false,
    counselingServices: false,
    supportGroups: false,
    requiredPrograms: [],
    recoveryStage: ''
  });

  // ✅ ENHANCED: Advanced filters for detailed search
  const [advancedFilters, setAdvancedFilters] = useState({
    acceptedSubsidies: [],
    amenities: [],
    utilitiesIncluded: [],
    smokingPolicy: '',
    guestPolicy: '',
    backgroundCheck: '',
    leaseLength: '',
    moveInCost: ''
  });

  // Housing type options that match database structure
  const housingTypeOptions = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' },
    { value: 'shared_room', label: 'Shared Room' },
    { value: 'sober_living_level_1', label: 'Sober Living Level 1' },
    { value: 'sober_living_level_2', label: 'Sober Living Level 2' },
    { value: 'halfway_house', label: 'Halfway House' },
    { value: 'transitional_housing', label: 'Transitional Housing' }
  ];

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const subsidyOptions = [
    'Section 8', 'HUD-VASH', 'Veterans Benefits', 'SSI/SSDI', 
    'State Housing Vouchers', 'Local Housing Assistance', 'Medicaid',
    'SNAP Benefits', 'Housing Choice Voucher', 'Low Income Housing Tax Credit'
  ];

  const amenityOptions = [
    'Parking', 'Laundry In-Unit', 'Laundry On-Site', 'Gym/Fitness Center', 
    'Pool', 'Garden/Yard', 'Balcony/Patio', 'Air Conditioning', 'Heating', 
    'High-Speed Internet', 'Cable TV', 'Dishwasher', 'Microwave', 'Storage'
  ];

  const utilityOptions = [
    'Electric', 'Gas', 'Water', 'Sewer', 'Trash/Recycling', 
    'Internet', 'Cable', 'Heat', 'Hot Water'
  ];

  // ✅ FIXED: Load user preferences from applicant profile
  useEffect(() => {
    loadUserPreferences();
    loadSavedProperties();
  }, [user]);

  // Load properties on filter changes
  useEffect(() => {
    handleSearch();
  }, [basicFilters, recoveryFilters, advancedFilters, searchMode, currentPage]);

  /**
   * ✅ FIXED: Load user's housing preferences from applicant profile
   */
  const loadUserPreferences = async () => {
    if (!user?.id) return;

    try {
      console.log('👤 Loading user housing preferences...');
      const { data, error } = await supabase
        .from('applicant_forms')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not "no rows returned"
          console.error('Error loading user preferences:', error);
        }
        return;
      }

      if (data) {
        setUserPreferences(data);
        
        // ✅ FIXED: Auto-populate filters from user profile
        const autoFilters = {
          location: data.preferred_city || '',
          state: data.preferred_state || '',
          maxRent: data.budget_max?.toString() || '',
          minBedrooms: data.preferred_bedrooms?.toString() || '',
          housingType: data.housing_type || [],
          furnished: data.furnished_preference || false,
          petsAllowed: data.pets_owned || false
        };
        
        setBasicFilters(prev => ({ ...prev, ...autoFilters }));
        console.log('✅ Auto-populated search filters from user preferences');
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
  };

  /**
   * ✅ NEW: Load saved properties (future feature - currently just placeholder)
   */
  const loadSavedProperties = async () => {
    // Placeholder for saved properties functionality
    // In the future, this would load from a user_saved_properties table
    setSavedProperties(new Set());
  };

  /**
   * ✅ IMPROVED: Enhanced property search with better error handling
   */
  const handleSearch = async (resetPage = true) => {
    if (resetPage) {
      setCurrentPage(1);
    }
    
    setLoading(true);
    try {
      console.log('🔍 Searching properties with mode:', searchMode, 'Page:', currentPage);
      
      // ✅ FIXED: Build robust query based on search mode
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'available');

      // Basic location filtering with improved handling
      if (basicFilters.location.trim()) {
        const searchLocation = basicFilters.location.trim();
        const locationParts = searchLocation.split(',').map(part => part.trim());
        
        if (locationParts.length === 2) {
          // Handle "City, State" format
          const [city, state] = locationParts;
          query = query.or(`city.ilike.%${city}%,state.ilike.%${state}%,address.ilike.%${searchLocation}%`);
        } else {
          // Single location term - search across multiple fields
          query = query.or(`city.ilike.%${searchLocation}%,state.ilike.%${searchLocation}%,address.ilike.%${searchLocation}%`);
        }
      }

      if (basicFilters.state) {
        query = query.eq('state', basicFilters.state);
      }

      if (basicFilters.maxRent) {
        query = query.lte('monthly_rent', parseInt(basicFilters.maxRent));
      }

      if (basicFilters.minBedrooms) {
        query = query.gte('bedrooms', parseInt(basicFilters.minBedrooms));
      }

      // ✅ IMPROVED: Housing type filtering
      if (basicFilters.housingType.length > 0) {
        const typeConditions = basicFilters.housingType.map(type => `property_type.eq.${type}`).join(',');
        query = query.or(typeConditions);
      }

      // ✅ ENHANCED: Recovery housing mode filtering
      if (searchMode === 'recovery') {
        if (recoveryFilters.recoveryHousingOnly) {
          query = query.eq('is_recovery_housing', true);
        }
        
        if (recoveryFilters.caseManagement) {
          query = query.eq('case_management', true);
        }
        
        if (recoveryFilters.counselingServices) {
          query = query.eq('counseling_services', true);
        }
        
        if (recoveryFilters.supportGroups) {
          query = query.eq('support_groups', true);
        }

        if (recoveryFilters.requiredPrograms.length > 0) {
          query = query.overlaps('required_programs', recoveryFilters.requiredPrograms);
        }
      }

      // Basic property features
      if (basicFilters.furnished) {
        query = query.eq('furnished', true);
      }

      if (basicFilters.petsAllowed) {
        query = query.eq('pets_allowed', true);
      }

      // ✅ IMPROVED: Advanced filters with proper handling
      if (showAdvancedFilters) {
        if (advancedFilters.acceptedSubsidies.length > 0) {
          query = query.overlaps('accepted_subsidies', advancedFilters.acceptedSubsidies);
        }

        if (advancedFilters.amenities.length > 0) {
          query = query.overlaps('amenities', advancedFilters.amenities);
        }

        if (advancedFilters.utilitiesIncluded.length > 0) {
          query = query.overlaps('utilities_included', advancedFilters.utilitiesIncluded);
        }

        if (advancedFilters.smokingPolicy) {
          query = query.eq('smoking_allowed', advancedFilters.smokingPolicy === 'allowed');
        }

        if (advancedFilters.leaseLength) {
          query = query.gte('min_lease_months', parseInt(advancedFilters.leaseLength));
        }
      }

      // Pagination
      const pageSize = 12;
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);

      // ✅ IMPROVED: Smart ordering based on search mode
      if (searchMode === 'recovery') {
        query = query.order('is_recovery_housing', { ascending: false })
                    .order('case_management', { ascending: false })
                    .order('monthly_rent', { ascending: true });
      } else {
        query = query.order('is_recovery_housing', { ascending: false })
                    .order('monthly_rent', { ascending: true });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Search error:', error);
        throw new Error(error.message || 'Failed to search properties');
      }

      const results = data || [];
      setProperties(results);
      setTotalResults(count || 0);
      
      console.log(`✅ Found ${results.length} properties (${count} total)`);
      
    } catch (error) {
      console.error('Error searching properties:', error);
      setProperties([]);
      setTotalResults(0);
      alert('Error searching properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ FIXED: Handle search mode toggle
   */
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setCurrentPage(1);
    
    // Update recovery filters based on mode
    if (mode === 'recovery') {
      setRecoveryFilters(prev => ({
        ...prev,
        recoveryHousingOnly: true
      }));
    }
  };

  /**
   * ✅ IMPROVED: Filter change handlers
   */
  const handleBasicFilterChange = (field, value) => {
    setBasicFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page
  };

  const handleRecoveryFilterChange = (field, value) => {
    setRecoveryFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  /**
   * Handle array filter changes (checkboxes)
   */
  const handleArrayFilterChange = (filterGroup, field, value, isChecked) => {
    const setFilter = filterGroup === 'basic' ? setBasicFilters : 
                     filterGroup === 'recovery' ? setRecoveryFilters : 
                     setAdvancedFilters;
    
    setFilter(prev => ({
      ...prev,
      [field]: isChecked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
    setCurrentPage(1);
  };

  /**
   * ✅ IMPROVED: Use user preferences with better error handling
   */
  const handleUseMyPreferences = () => {
    if (userPreferences) {
      const autoFilters = {
        location: userPreferences.preferred_city || '',
        state: userPreferences.preferred_state || '',
        maxRent: userPreferences.budget_max?.toString() || '',
        minBedrooms: userPreferences.preferred_bedrooms?.toString() || '',
        housingType: userPreferences.housing_type || [],
        furnished: userPreferences.furnished_preference || false,
        petsAllowed: userPreferences.pets_owned || false
      };
      
      setBasicFilters(prev => ({ ...prev, ...autoFilters }));
      alert('Search filters updated with your profile preferences!');
    } else {
      alert('No preferences found in your profile. Please complete your matching profile first.');
    }
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    setBasicFilters({
      location: '',
      state: '',
      maxRent: '',
      minBedrooms: '',
      housingType: [],
      furnished: false,
      petsAllowed: false,
      utilityBudget: ''
    });
    
    setRecoveryFilters({
      recoveryHousingOnly: searchMode === 'recovery',
      soberness: '',
      caseManagement: false,
      counselingServices: false,
      supportGroups: false,
      requiredPrograms: [],
      recoveryStage: ''
    });
    
    setAdvancedFilters({
      acceptedSubsidies: [],
      amenities: [],
      utilitiesIncluded: [],
      smokingPolicy: '',
      guestPolicy: '',
      backgroundCheck: '',
      leaseLength: '',
      moveInCost: ''
    });

    setCurrentPage(1);
  };

  /**
   * ✅ IMPROVED: Enhanced contact landlord with better UX
   */
  const handleContactLandlord = async (property) => {
    try {
      // Try to get landlord info for better contact experience
      let landlordName = 'Property Owner';
      let contactEmail = property.contact_email;
      let contactPhone = property.phone;

      // If we have a landlord_id, try to get their info
      if (property.landlord_id) {
        try {
          const { data: landlordProfile } = await supabase
            .from('registrant_profiles')
            .select('first_name, email')
            .eq('id', property.landlord_id)
            .single();

          if (landlordProfile) {
            landlordName = landlordProfile.first_name || 'Property Owner';
            contactEmail = contactEmail || landlordProfile.email;
          }
        } catch (err) {
          console.warn('Could not load landlord profile:', err);
        }
      }

      const subject = `Inquiry about ${property.title}`;
      const body = `Hi ${landlordName},

I'm interested in your property listing "${property.title}" at ${property.address}, ${property.city}, ${property.state}.

Property Details:
- Monthly Rent: $${property.monthly_rent}
- Bedrooms: ${property.bedrooms || 'Studio'}
- Bathrooms: ${property.bathrooms}
${property.is_recovery_housing ? '- Recovery Housing: Yes' : ''}

Could you please provide more information about:
- Availability dates
- Application process
- Any specific requirements

I look forward to hearing from you.

Thank you!`;

      if (contactEmail) {
        const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
      } else if (contactPhone) {
        alert(`Please call the property owner at: ${contactPhone}`);
      } else {
        alert('Contact information not available for this property. Please try contacting through the property listing platform or check back later.');
      }
    } catch (err) {
      console.error('Error preparing contact info:', err);
      alert('Unable to contact landlord at this time. Please try again later.');
    }
  };

  /**
   * ✅ IMPROVED: Enhanced save property with future integration
   */
  const handleSaveProperty = (property) => {
    // Update local state
    setSavedProperties(prev => new Set([...prev, property.id]));
    
    // Future: Save to database
    // const { error } = await supabase
    //   .from('user_saved_properties')
    //   .insert({ user_id: user.id, property_id: property.id });
    
    alert(`Property "${property.title}" saved to your favorites! (Feature coming soon)`);
  };

  /**
   * ✅ NEW: Send housing inquiry (integration with connection system)
   */
  const handleSendHousingInquiry = async (property) => {
    if (!property.landlord_id) {
      alert('Direct inquiries are not available for this property. Please use the contact owner option.');
      return;
    }

    try {
      const requestData = {
        requester_id: user.id,
        target_id: property.landlord_id,
        request_type: 'housing',
        message: `Hi! I'm interested in your property "${property.title}" at ${property.address}. I'm looking for ${property.is_recovery_housing ? 'recovery-friendly ' : ''}housing and this property looks like it could be a great fit for my needs.

Property Details I'm interested in:
- Monthly Rent: $${property.monthly_rent}
- Bedrooms: ${property.bedrooms || 'Studio'}
- Location: ${property.city}, ${property.state}

I'd love to discuss availability and the application process. Thank you!`,
        status: 'pending'
      };

      const result = await supabase
        .from('match_requests')
        .insert(requestData)
        .select();

      if (result.error) {
        throw new Error(result.error.message);
      }

      alert('Housing inquiry sent! The landlord will be notified and can respond through their dashboard.');
    } catch (err) {
      console.error('Error sending housing inquiry:', err);
      alert('Failed to send inquiry. Please try the contact owner option instead.');
    }
  };

  // Pagination
  const totalPages = Math.ceil(totalResults / 12);
  const showPagination = totalPages > 1;

  return (
    <div className="content">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Find Recovery-Friendly Housing</h1>
        <p className="welcome-text">
          Search for housing options that support your recovery journey and meet your needs
        </p>
      </div>

      {/* ✅ IMPROVED: Search Mode Toggle */}
      <div className="card mb-4">
        <h3 className="card-title">Search Type</h3>
        <div className="navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <button
                className={`nav-button ${searchMode === 'basic' ? 'active' : ''}`}
                onClick={() => handleSearchModeChange('basic')}
              >
                <span className="nav-icon">🏠</span>
                <span>All Housing</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-button ${searchMode === 'recovery' ? 'active' : ''}`}
                onClick={() => handleSearchModeChange('recovery')}
              >
                <span className="nav-icon">🏡</span>
                <span>Recovery Housing</span>
              </button>
            </li>
          </ul>
        </div>
        <p className="text-gray-600 mt-2">
          {searchMode === 'basic' 
            ? 'Search all available housing with recovery-friendly options prioritized'
            : 'Search specifically for recovery housing with specialized support services'
          }
        </p>
      </div>

      {/* ✅ IMPROVED: Basic Search Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Basic Housing Criteria</h3>
          {userPreferences && (
            <button
              className="btn btn-outline btn-sm"
              onClick={handleUseMyPreferences}
            >
              Use My Preferences
            </button>
          )}
        </div>
        
        <div className="grid-auto mb-4">
          <div className="form-group">
            <label className="label">Location</label>
            <input
              className="input"
              type="text"
              placeholder="City, State, or Address"
              value={basicFilters.location}
              onChange={(e) => handleBasicFilterChange('location', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">State</label>
            <select
              className="input"
              value={basicFilters.state}
              onChange={(e) => handleBasicFilterChange('state', e.target.value)}
            >
              <option value="">Any State</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Max Monthly Rent</label>
            <select
              className="input"
              value={basicFilters.maxRent}
              onChange={(e) => handleBasicFilterChange('maxRent', e.target.value)}
            >
              <option value="">Any price</option>
              <option value="500">Up to $500</option>
              <option value="750">Up to $750</option>
              <option value="1000">Up to $1,000</option>
              <option value="1500">Up to $1,500</option>
              <option value="2000">Up to $2,000</option>
              <option value="2500">Up to $2,500</option>
              <option value="3000">Up to $3,000</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Min Bedrooms</label>
            <select
              className="input"
              value={basicFilters.minBedrooms}
              onChange={(e) => handleBasicFilterChange('minBedrooms', e.target.value)}
            >
              <option value="">Any</option>
              <option value="0">Studio</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>

        {/* ✅ IMPROVED: Housing type selection */}
        <div className="form-group mb-4">
          <label className="label">Housing Types (select all that work for you)</label>
          <div className="grid-auto">
            {housingTypeOptions.map(type => (
              <div
                key={type.value}
                className={`checkbox-item ${basicFilters.housingType.includes(type.value) ? 'selected' : ''}`}
                onClick={() => handleArrayFilterChange('basic', 'housingType', type.value, !basicFilters.housingType.includes(type.value))}
              >
                <input
                  type="checkbox"
                  checked={basicFilters.housingType.includes(type.value)}
                  onChange={() => {}}
                />
                <span>{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Basic toggles and search button */}
        <div className="grid-auto mb-4">
          <div className="checkbox-item" onClick={() => handleBasicFilterChange('furnished', !basicFilters.furnished)}>
            <input
              type="checkbox"
              checked={basicFilters.furnished}
              onChange={() => {}}
            />
            <span>Furnished</span>
          </div>
          
          <div className="checkbox-item" onClick={() => handleBasicFilterChange('petsAllowed', !basicFilters.petsAllowed)}>
            <input
              type="checkbox"
              checked={basicFilters.petsAllowed}
              onChange={() => {}}
            />
            <span>Pet Friendly</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => handleSearch()}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Housing'}
          </button>

          <button
            className="btn btn-outline"
            onClick={clearAllFilters}
            disabled={loading}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ✅ ENHANCED: Recovery-Specific Filters */}
      {searchMode === 'recovery' && (
        <div className="card mb-4">
          <h3 className="card-title">Recovery Support Features</h3>
          
          <div className="grid-auto mb-4">
            <div className="checkbox-item" onClick={() => handleRecoveryFilterChange('caseManagement', !recoveryFilters.caseManagement)}>
              <input
                type="checkbox"
                checked={recoveryFilters.caseManagement}
                onChange={() => {}}
              />
              <span>Case Management Available</span>
            </div>
            
            <div className="checkbox-item" onClick={() => handleRecoveryFilterChange('counselingServices', !recoveryFilters.counselingServices)}>
              <input
                type="checkbox"
                checked={recoveryFilters.counselingServices}
                onChange={() => {}}
              />
              <span>Counseling Services</span>
            </div>

            <div className="checkbox-item" onClick={() => handleRecoveryFilterChange('supportGroups', !recoveryFilters.supportGroups)}>
              <input
                type="checkbox"
                checked={recoveryFilters.supportGroups}
                onChange={() => {}}
              />
              <span>Support Groups</span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ IMPROVED: Advanced Filters */}
      <div className="card mb-4">
        <div className="text-center">
          <button
            className="btn btn-outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4">
            <h4 className="card-title">Advanced Search Options</h4>
            
            {/* Accepted Subsidies */}
            <div className="form-group">
              <label className="label">Accepted Subsidies/Benefits</label>
              <div className="grid-auto">
                {subsidyOptions.map(subsidy => (
                  <div
                    key={subsidy}
                    className={`checkbox-item ${advancedFilters.acceptedSubsidies.includes(subsidy) ? 'selected' : ''}`}
                    onClick={() => handleArrayFilterChange('advanced', 'acceptedSubsidies', subsidy, !advancedFilters.acceptedSubsidies.includes(subsidy))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.acceptedSubsidies.includes(subsidy)}
                      onChange={() => {}}
                    />
                    <span>{subsidy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Amenities */}
            <div className="form-group">
              <label className="label">Required Amenities</label>
              <div className="grid-auto">
                {amenityOptions.map(amenity => (
                  <div
                    key={amenity}
                    className={`checkbox-item ${advancedFilters.amenities.includes(amenity) ? 'selected' : ''}`}
                    onClick={() => handleArrayFilterChange('advanced', 'amenities', amenity, !advancedFilters.amenities.includes(amenity))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.amenities.includes(amenity)}
                      onChange={() => {}}
                    />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilities Included */}
            <div className="form-group">
              <label className="label">Utilities Included</label>
              <div className="grid-auto">
                {utilityOptions.map(utility => (
                  <div
                    key={utility}
                    className={`checkbox-item ${advancedFilters.utilitiesIncluded.includes(utility) ? 'selected' : ''}`}
                    onClick={() => handleArrayFilterChange('advanced', 'utilitiesIncluded', utility, !advancedFilters.utilitiesIncluded.includes(utility))}
                  >
                    <input
                      type="checkbox"
                      checked={advancedFilters.utilitiesIncluded.includes(utility)}
                      onChange={() => {}}
                    />
                    <span>{utility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Smoking Policy</label>
                <select
                  className="input"
                  value={advancedFilters.smokingPolicy}
                  onChange={(e) => handleAdvancedFilterChange('smokingPolicy', e.target.value)}
                >
                  <option value="">Any Policy</option>
                  <option value="not_allowed">Non-Smoking Only</option>
                  <option value="allowed">Smoking Allowed OK</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Minimum Lease Length</label>
                <select
                  className="input"
                  value={advancedFilters.leaseLength}
                  onChange={(e) => handleAdvancedFilterChange('leaseLength', e.target.value)}
                >
                  <option value="">Any Length</option>
                  <option value="1">1+ months</option>
                  <option value="3">3+ months</option>
                  <option value="6">6+ months</option>
                  <option value="12">12+ months</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="card mb-4">
        <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title">
              {loading ? 'Searching...' : `${totalResults} Properties Found`}
            </h3>
            {totalResults > 0 && (
              <p className="text-gray-600">
                {searchMode === 'recovery' 
                  ? 'Recovery housing properties with specialized support'
                  : 'Recovery housing properties are prioritized in results'
                }
              </p>
            )}
          </div>
          
          {showPagination && (
            <div className="text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p className="loading-text">Finding the perfect housing options for you...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3 className="empty-state-title">No properties found</h3>
          <p>Try adjusting your search criteria or switching search modes.</p>
          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={clearAllFilters}
            >
              Clear Filters
            </button>
            <button
              className="btn btn-outline ml-2"
              onClick={() => handleSearchModeChange(searchMode === 'basic' ? 'recovery' : 'basic')}
            >
              Try {searchMode === 'basic' ? 'Recovery Housing' : 'All Housing'} Search
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid-auto">
            {properties.map(property => (
              <div key={property.id} className="card">
                {/* Property Image Placeholder */}
                <div className="card" style={{ 
                  background: 'var(--bg-light-cream)', 
                  marginBottom: 'var(--spacing-lg)', 
                  textAlign: 'center', 
                  padding: '60px 20px' 
                }}>
                  <div style={{ fontSize: '3rem', color: 'var(--primary-purple)' }}>
                    {property.is_recovery_housing ? '🏡' : '🏠'}
                  </div>
                </div>
                
                <div>
                  {/* Badges */}
                  <div className="mb-2">
                    {property.is_recovery_housing && (
                      <span className="badge badge-warning mr-1">
                        Recovery Housing
                      </span>
                    )}
                    {property.furnished && (
                      <span className="badge badge-info mr-1">
                        Furnished
                      </span>
                    )}
                    {property.pets_allowed && (
                      <span className="badge badge-success mr-1">
                        Pet Friendly
                      </span>
                    )}
                    {property.accepted_subsidies && property.accepted_subsidies.length > 0 && (
                      <span className="badge badge-info mr-1">
                        Subsidies OK
                      </span>
                    )}
                    {savedProperties.has(property.id) && (
                      <span className="badge badge-warning mr-1">
                        Saved
                      </span>
                    )}
                  </div>
                  
                  <h4 className="card-title">{property.title}</h4>
                  <p className="text-gray-600 mb-2">
                    {property.address}, {property.city}, {property.state} {property.zip_code}
                  </p>
                  <p className="card-title text-secondary-teal mb-2">
                    ${property.monthly_rent}/month
                  </p>
                  
                  <div className="text-gray-600 mb-3">
                    {property.bedrooms || 'Studio'} bed • {property.bathrooms} bath
                    {property.property_type && (
                      <span> • {property.property_type.replace(/_/g, ' ')}</span>
                    )}
                  </div>

                  {/* Amenities Preview */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="text-gray-600 mb-3">
                      <small>{property.amenities.slice(0, 3).join(' • ')}</small>
                      {property.amenities.length > 3 && (
                        <small> • +{property.amenities.length - 3} more</small>
                      )}
                    </div>
                  )}

                  {/* Recovery Housing Details */}
                  {property.is_recovery_housing && (
                    <div className="alert alert-info mb-3">
                      <small>
                        <strong>Recovery Support:</strong>
                        {property.case_management && ' Case Management'}
                        {property.counseling_services && ' • Counseling'}
                        {property.required_programs && property.required_programs.length > 0 && ` • Program Requirements`}
                      </small>
                    </div>
                  )}

                  {/* ✅ IMPROVED: Action Buttons */}
                  <div className="grid-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleContactLandlord(property)}
                    >
                      Contact Owner
                    </button>
                    
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSaveProperty(property)}
                      disabled={savedProperties.has(property.id)}
                    >
                      {savedProperties.has(property.id) ? 'Saved' : 'Save Property'}
                    </button>
                  </div>

                  {/* ✅ NEW: Housing inquiry option for registered landlords */}
                  {property.landlord_id && (
                    <div className="mt-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSendHousingInquiry(property)}
                        style={{ width: '100%' }}
                      >
                        Send Housing Inquiry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="text-center mt-5">
              <div className="grid-auto" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </button>
                
                <span className="text-center" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '15px'
                }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertySearch;