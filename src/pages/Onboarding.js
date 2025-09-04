// src/pages/Onboarding.js
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../utils/supabase'
import LoadingSpinner from '../components/common/LoadingSpinner'
import '../styles/global.css';

const Onboarding = () => {
  const { profile, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  // Form data
  const [basicProfile, setBasicProfile] = useState({
    dateOfBirth: '',
    phone: '',
    gender: '',
    sex: ''
  })
  
  const [matchingProfile, setMatchingProfile] = useState({
    preferredLocation: '',
    recoveryStage: '',
    programType: [],
    aboutMe: '',
    lookingFor: ''
  })

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Gender and sex options
  const genderOptions = [
    { value: '', label: 'Select Gender Identity' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'genderfluid', label: 'Genderfluid' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ]

  const sexOptions = [
    { value: '', label: 'Select Biological Sex' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ]

  // Progress indicator
  const ProgressIndicator = () => {
    const steps = [
      { number: 1, label: 'Basic Info', completed: currentStep > 1 },
      { number: 2, label: 'Matching Profile', completed: currentStep > 2 },
      { number: 3, label: 'Complete', completed: currentStep > 3 }
    ]

    return (
      <div className="progress-indicator">
        <div className="progress-title">Complete Your Profile Setup</div>
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div key={step.number} className="progress-step">
              {index < steps.length - 1 && (
                <div className={`step-connector ${step.completed ? 'step-connector-active' : ''}`} />
              )}
              <div className={`step-number ${
                currentStep === step.number ? 'step-number-active' : 
                step.completed ? 'step-number-completed' : 'step-number-inactive'
              }`}>
                {step.completed ? '✓' : step.number}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Validate basic profile
  const validateBasicProfile = () => {
    const newErrors = {}
    
    if (!basicProfile.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!basicProfile.phone.trim()) newErrors.phone = 'Phone number is required'
    
    // Age validation
    if (basicProfile.dateOfBirth) {
      const today = new Date()
      const birthDate = new Date(basicProfile.dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be 18 or older'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validate matching profile
  const validateMatchingProfile = () => {
    const newErrors = {}
    
    if (!matchingProfile.preferredLocation.trim()) {
      newErrors.preferredLocation = 'Preferred location is required'
    }
    if (!matchingProfile.recoveryStage) {
      newErrors.recoveryStage = 'Recovery stage is required'
    }
    if (!matchingProfile.aboutMe.trim()) {
      newErrors.aboutMe = 'About me section is required'
    }
    if (!matchingProfile.lookingFor.trim()) {
      newErrors.lookingFor = 'Looking for section is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save basic profile
  const saveBasicProfile = async () => {
    if (!validateBasicProfile()) return

    setLoading(true)
    
    try {
      const profileData = {
        user_id: profile.id,
        date_of_birth: basicProfile.dateOfBirth,
        phone: basicProfile.phone,
        gender: basicProfile.gender,
        sex: basicProfile.sex
      }

      const { error } = await db.basicProfiles.create(profileData)
      
      if (error) throw error

      setCurrentStep(2)
    } catch (error) {
      console.error('Error saving basic profile:', error)
      setErrors({ submit: 'Failed to save profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Save matching profile and complete onboarding
  const saveMatchingProfile = async () => {
    if (!validateMatchingProfile()) return

    setLoading(true)
    
    try {
      const profileData = {
        user_id: profile.id,
        preferred_location: matchingProfile.preferredLocation,
        recovery_stage: matchingProfile.recoveryStage,
        program_type: matchingProfile.programType,
        about_me: matchingProfile.aboutMe,
        looking_for: matchingProfile.lookingFor,
        is_active: true
      }

      const { error } = await db.matchingProfiles.create(profileData)
      
      if (error) throw error

      setCurrentStep(3)
      
      // Redirect to main app after a short delay
      setTimeout(() => {
        navigate('/app')
      }, 2000)
      
    } catch (error) {
      console.error('Error saving matching profile:', error)
      setErrors({ submit: 'Failed to save profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (!profile) {
    return <LoadingSpinner message="Loading your profile..." />
  }

  // Step 1: Basic Profile
  if (currentStep === 1) {
    return (
      <div className="content">
        <ProgressIndicator />
        
        <div className="card">
          <h3 className="form-title">Basic Profile Information</h3>
          
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="label">First Name</label>
              <input
                className="input"
                type="text"
                value={profile.first_name || ''}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label className="label">Last Name</label>
              <input
                className="input"
                type="text"
                value={profile.last_name || ''}
                disabled
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={profile.email || ''}
              disabled
            />
          </div>
          
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="label">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                className={`input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                type="date"
                value={basicProfile.dateOfBirth}
                onChange={(e) => setBasicProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                disabled={loading}
              />
              {errors.dateOfBirth && (
                <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                  {errors.dateOfBirth}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="label">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                type="tel"
                value={basicProfile.phone}
                onChange={(e) => setBasicProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
                disabled={loading}
              />
              {errors.phone && (
                <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                  {errors.phone}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="label">Gender Identity</label>
              <select
                className="input"
                value={basicProfile.gender}
                onChange={(e) => setBasicProfile(prev => ({ ...prev, gender: e.target.value }))}
                disabled={loading}
              >
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="text-gray-500 mt-1" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                This information helps us provide better matches
              </div>
            </div>
            
            <div className="form-group">
              <label className="label">Biological Sex</label>
              <select
                className="input"
                value={basicProfile.sex}
                onChange={(e) => setBasicProfile(prev => ({ ...prev, sex: e.target.value }))}
                disabled={loading}
              >
                {sexOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="text-gray-500 mt-1" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                Used for housing compatibility purposes
              </div>
            </div>
          </div>
          
          <div className="grid-2">
            <button
              className="btn btn-outline"
              onClick={() => navigate('/app')}
              disabled={loading}
            >
              Skip for Now
            </button>
            
            <button
              className={`btn btn-primary ${loading ? 'disabled' : ''}`}
              onClick={saveBasicProfile}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Matching Profile
  if (currentStep === 2) {
    return (
      <div className="content">
        <ProgressIndicator />
        
        <div className="card">
          <h3 className="form-title">Matching Profile Setup</h3>
          
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="label">
                Preferred Location <span className="text-red-500">*</span>
              </label>
              <input
                className={`input ${errors.preferredLocation ? 'border-red-500' : ''}`}
                type="text"
                value={matchingProfile.preferredLocation}
                onChange={(e) => setMatchingProfile(prev => ({ ...prev, preferredLocation: e.target.value }))}
                placeholder="City, State"
                disabled={loading}
              />
              {errors.preferredLocation && (
                <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                  {errors.preferredLocation}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="label">
                Recovery Stage <span className="text-red-500">*</span>
              </label>
              <select
                className={`input ${errors.recoveryStage ? 'border-red-500' : ''}`}
                value={matchingProfile.recoveryStage}
                onChange={(e) => setMatchingProfile(prev => ({ ...prev, recoveryStage: e.target.value }))}
                disabled={loading}
              >
                <option value="">Select recovery stage</option>
                <option value="early">Early recovery (0-90 days)</option>
                <option value="stable">Stable recovery (3 months - 1 year)</option>
                <option value="maintained">Maintained recovery (1+ years)</option>
                <option value="long-term">Long-term recovery (5+ years)</option>
              </select>
              {errors.recoveryStage && (
                <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                  {errors.recoveryStage}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">
              Tell us about yourself <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`input ${errors.aboutMe ? 'border-red-500' : ''}`}
              value={matchingProfile.aboutMe}
              onChange={(e) => setMatchingProfile(prev => ({ ...prev, aboutMe: e.target.value }))}
              placeholder="Share your personality, interests, recovery journey, and what makes you a good roommate..."
              disabled={loading}
              style={{ minHeight: '120px', resize: 'vertical' }}
            />
            <div className="text-gray-500 mt-1" style={{ fontSize: '0.9rem' }}>
              {matchingProfile.aboutMe.length}/500 characters
            </div>
            {errors.aboutMe && (
              <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                {errors.aboutMe}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="label">
              What are you looking for in a roommate? <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`input ${errors.lookingFor ? 'border-red-500' : ''}`}
              value={matchingProfile.lookingFor}
              onChange={(e) => setMatchingProfile(prev => ({ ...prev, lookingFor: e.target.value }))}
              placeholder="Describe your ideal roommate and living situation..."
              disabled={loading}
              style={{ minHeight: '120px', resize: 'vertical' }}
            />
            <div className="text-gray-500 mt-1" style={{ fontSize: '0.9rem' }}>
              {matchingProfile.lookingFor.length}/500 characters
            </div>
            {errors.lookingFor && (
              <div className="text-red-500 mt-1" style={{ fontSize: '0.9rem' }}>
                {errors.lookingFor}
              </div>
            )}
          </div>
          
          <div className="grid-2">
            <button
              className="btn btn-outline"
              onClick={() => setCurrentStep(1)}
              disabled={loading}
            >
              Back
            </button>
            
            <button
              className={`btn btn-primary ${loading ? 'disabled' : ''}`}
              onClick={saveMatchingProfile}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Complete
  return (
    <div className="content">
      <ProgressIndicator />
      
      <div className="card text-center">
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉</div>
        <h3 className="form-title">Welcome to Recovery Housing Connect!</h3>
        <p className="text-gray-600 mb-4" style={{ fontSize: '1.1rem' }}>
          Your profile has been created successfully. You can now start finding compatible roommates
          and exploring recovery-friendly housing options.
        </p>
        <p className="text-gray-600" style={{ fontWeight: '600' }}>
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  )
}

export default Onboarding