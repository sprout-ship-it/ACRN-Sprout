// src/contexts/AuthContext.js
// INTEGRATED: Optimized role checking + employer role support
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { auth, db } from '../utils/supabase'

const AuthContext = createContext({})
export { AuthContext };
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  console.log('🚀 AuthProvider starting...')
  
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ OPTIMIZED: Memoized role checking functions to prevent excessive calls
  const hasRole = useCallback((role) => {
    const result = Array.isArray(profile?.roles) && profile.roles.includes(role)
    
    // ✅ OPTIMIZED: Only log in development and when explicitly needed
    if (process.env.NODE_ENV === 'development' && window.debugRoles) {
      console.log('🔍 hasRole check:', { role, result, userRoles: profile?.roles })
    }
    
    return result
  }, [profile?.roles]) // Only re-create when roles actually change

  const hasAnyRole = useCallback((roles) => {
    if (!Array.isArray(profile?.roles)) return false
    return roles.some(role => profile.roles.includes(role))
  }, [profile?.roles])

  const getPrimaryRole = useCallback(() => {
    return Array.isArray(profile?.roles) && profile.roles.length > 0 ? profile.roles[0] : null
  }, [profile?.roles])

  // ✅ NEW: Add employer-specific helper function
  const getEmployerProfile = useCallback(async () => {
    if (!user?.id || !hasRole('employer')) {
      return { data: null, error: 'User is not an employer or not authenticated' }
    }
    
    try {
      const result = await db.employerProfiles.getByUserId(user.id)
      return result
    } catch (err) {
      console.error('💥 Error getting employer profile:', err)
      return { data: null, error: err.message }
    }
  }, [user?.id, hasRole])

  // ✅ INTEGRATED: Computed values with employer support - memoized for performance
  const computedValues = useMemo(() => {
    const roles = profile?.roles || []
    const isArrayRoles = Array.isArray(roles)
    
    return {
      // Basic auth state
      isAuthenticated: !!user,
      
      // Individual role checks
      isApplicant: isArrayRoles && roles.includes('applicant'),
      isLandlord: isArrayRoles && roles.includes('landlord'),
      isPeerSupport: isArrayRoles && roles.includes('peer'),
      isEmployer: isArrayRoles && roles.includes('employer'), // ✅ NEW
      
      // ✅ NEW: Multi-role helpers
      isMultiRole: isArrayRoles && roles.length > 1,
      allRoles: roles,
      
      // ✅ NEW: Role combinations
      canPostJobs: isArrayRoles && roles.includes('employer'),
      canListProperties: isArrayRoles && roles.includes('landlord'),
      canOfferPeerSupport: isArrayRoles && roles.includes('peer'),
      canSearchHousing: isArrayRoles && roles.includes('applicant'),
      canSearchJobs: isArrayRoles && roles.includes('applicant'),
      
      // ✅ NEW: Platform engagement helpers
      hasServiceProvider: isArrayRoles && roles.some(role => ['landlord', 'peer', 'employer'].includes(role)),
      hasServiceSeeker: isArrayRoles && roles.includes('applicant')
    }
  }, [user, profile?.roles]) // Only recalculate when user or roles change

  // Initialize auth state
  useEffect(() => {
    console.log('🔄 AuthContext useEffect starting')
    
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        console.log('📡 Getting initial session...')
        
        // ✅ OPTIMIZED: Simplified timeout handling
        const { session, error } = await auth.getSession()
        
        console.log('📡 Session result:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          error: error?.message 
        })
        
        if (!isMounted) return
        
        if (error) {
          console.error('❌ Error getting session:', error)
          setError(error.message)
        } else {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            console.log('👤 User found, loading profile for:', session.user.id)
            await loadUserProfile(session.user.id)
          } else {
            console.log('👤 No user session found')
          }
        }
        
        if (isMounted) {
          console.log('✅ Auth initialization complete')
          setLoading(false)
        }
      } catch (err) {
        console.error('💥 Auth initialization failed:', err)
        if (isMounted) {
          setError(err.message || 'Failed to initialize authentication')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    console.log('👂 Setting up auth state change listener')
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, { hasSession: !!session })
      
      if (!isMounted) return
      
      setUser(session?.user ?? null)
      
      try {
        if (session?.user) {
          console.log('👤 Auth changed: loading profile for user:', session.user.id)
          await loadUserProfile(session.user.id)
        } else {
          console.log('👤 Auth changed: no user, clearing profile')
          setProfile(null)
        }
      } catch (err) {
        console.error('💥 Error in auth state change:', err)
        setError(err.message || 'Error handling auth state change')
      }
      
      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      console.log('🧹 AuthContext cleanup')
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ✅ OPTIMIZED: Memoized profile loading to prevent unnecessary calls
  const loadUserProfile = useCallback(async (userId) => {
    console.log('📄 Loading profile for user:', userId)
    
    try {
      // Load only the registrant profile - no additional profile tables needed
      const { data: registrantData, error: registrantError } = await db.profiles.getById(userId)

      console.log('📄 Profile loading result:', {
        hasRegistrant: !!registrantData,
        registrantError: registrantError?.message
      })

      if (registrantError && registrantError.code !== 'PGRST116') {
        console.error('❌ Error loading registrant profile:', registrantError)
        
        // Create emergency fallback profile
        const emergencyProfile = {
          id: userId,
          email: user?.email,
          roles: [],
          first_name: '',
          last_name: ''
        }
        
        console.log('🚨 Using emergency fallback profile')
        setProfile(emergencyProfile)
        setError('Profile loading failed - using minimal profile')
        return
      }

      if (!registrantData) {
        console.warn('⚠️ No registrant profile found - may not have been created by trigger')
        
        // Set a minimal profile to prevent app crashes
        const fallbackProfile = {
          id: userId,
          email: user?.email,
          roles: [],
          first_name: '',
          last_name: ''
        }
        
        console.log('📄 Using fallback profile:', fallbackProfile)
        setProfile(fallbackProfile)
        return
      }

      // Use the registrant profile directly - that's all we need for the simplified flow
      console.log('📄 Profile loaded successfully:', { 
        hasRoles: !!registrantData?.roles,
        roles: registrantData?.roles,
        fullProfile: registrantData
      })

      setProfile(registrantData)

    } catch (err) {
      console.error('💥 Critical profile loading error:', err)
      
      // Create emergency fallback profile
      const emergencyProfile = {
        id: userId,
        email: user?.email,
        roles: [],
        first_name: '',
        last_name: ''
      }
      
      console.log('🚨 Using emergency fallback profile due to error')
      setProfile(emergencyProfile)
      setError('Profile loading failed - using minimal profile')
    }
  }, [user?.email])

  // SIMPLIFIED: Enhanced signup (only creates registrant_profiles entry)
  const signUp = async (email, password, userData) => {
    console.log('📝 Simplified signup for user:', email)
    
    try {
      setLoading(true)
      setError(null)

      // Step 1: Create the auth user
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        console.error('❌ Signup error:', error)
        setError(error.message)
        return { success: false, error: error.message }
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.id)
        
        // Step 2: Wait a moment for potential trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 3: Check if profile was created by trigger
        const { data: existingProfile } = await db.profiles.getById(data.user.id);
        
        if (!existingProfile) {
          console.log('⚠️ No profile found, creating manually...');
          
          // Step 4: Create ONLY the registrant_profiles entry (no other tables)
          const profileData = {
            id: data.user.id,
            email: email,
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
            roles: userData.roles || [],
            is_active: true
          };
          
          const { error: profileError } = await db.profiles.create(profileData);
          
          if (profileError) {
            console.error('❌ Failed to create profile manually:', profileError);
            // Don't fail the signup, but log the issue
          } else {
            console.log('✅ Profile created manually - user can proceed to role-specific forms');
          }
        } else {
          console.log('✅ Profile found - trigger worked');
        }
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('💥 Signup failed:', err)
      const errorMessage = err.message || 'An error occurred during signup'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    console.log('🔑 Signing in user:', email)
    
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        console.error('❌ Signin error:', error)
        setError(error.message)
        return { success: false, error: error.message }
      }

      console.log('✅ Signin successful')
      return { success: true, data }
    } catch (err) {
      console.error('💥 Signin failed:', err)
      const errorMessage = err.message || 'An error occurred during signin'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out user')
    
    try {
      setLoading(true)
      setError(null)

      const { error } = await auth.signOut()
      
      if (error) {
        console.error('❌ Signout error:', error)
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(null)
      setProfile(null)
      console.log('✅ Signout successful')
      return { success: true }
    } catch (err) {
      console.error('💥 Signout failed:', err)
      const errorMessage = err.message || 'An error occurred during signout'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // SIMPLIFIED: Update profile (only registrant_profiles table)
  const updateProfile = async (updates) => {
    console.log('📝 Updating profile:', updates)
    
    try {
      setError(null)

      if (!user) {
        throw new Error('No authenticated user')
      }

      // All updates go to registrant_profiles table
      console.log('📝 Updating registrant_profiles table')
      const result = await db.profiles.update(user.id, updates)
      
      const { data, error } = result
      
      if (error) {
        console.error('❌ Profile update error:', error)
        setError(error.message)
        return { success: false, error: error.message }
      }

      console.log('✅ Profile updated successfully')
      
      // Update local profile state directly instead of reloading
      if (data && data[0]) {
        setProfile(prev => ({
          ...prev,
          ...data[0]
        }))
      } else {
        // Fallback: update local state with the changes we made
        setProfile(prev => ({
          ...prev,
          ...updates
        }))
      }
      
      return { success: true, data: data?.[0] }
    } catch (err) {
      console.error('💥 Profile update failed:', err)
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const clearError = () => {
    setError(null)
  }

  // ✅ OPTIMIZED: Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    user,
    profile,
    loading,
    error,
    
    // Auth methods
    signUp,
    signIn,
    signOut,
    updateProfile,
    loadUserProfile,
    
    // Utility methods
    hasRole,
    hasAnyRole,
    getPrimaryRole,
    clearError,
    getEmployerProfile, // ✅ NEW: Employer helper
    
    // Computed values (now memoized and includes employer support)
    ...computedValues
  }), [
    user, 
    profile, 
    loading, 
    error, 
    hasRole, 
    hasAnyRole, 
    getPrimaryRole, 
    getEmployerProfile,
    computedValues,
    // Note: auth methods are stable and don't need to be in deps
  ])

  console.log('🎯 AuthProvider rendering with state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    error: !!error,
    userRoles: profile?.roles,
    isEmployer: computedValues.isEmployer,
    isMultiRole: computedValues.isMultiRole
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ✅ BONUS: Enable detailed role logging in dev tools
// Run `window.debugRoles = true` in console to see detailed role checks
if (process.env.NODE_ENV === 'development') {
  window.debugRoles = false
}