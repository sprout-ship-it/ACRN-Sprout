// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../utils/supabase'

const AuthContext = createContext({})

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

  // Initialize auth state
  useEffect(() => {
    console.log('🔄 AuthContext useEffect starting')
    
    let isMounted = true // Prevent state updates if component unmounts
    
    const initializeAuth = async () => {
      try {
        console.log('📡 Getting initial session...')
        
        // Add timeout to prevent hanging
        const sessionPromise = auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        )
        
        const { session, error } = await Promise.race([sessionPromise, timeoutPromise])
        
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
          console.log('✅ Auth initialization complete, setting loading to false')
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

    // Initialize auth
    initializeAuth()

    // Listen for auth changes
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

    // Cleanup function
    return () => {
      console.log('🧹 AuthContext cleanup')
      isMounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array is intentional

  // ✅ FIXED: Improved profile loading with better error handling and fallback logic
  const loadUserProfile = async (userId) => {
    console.log('📄 Loading profile for user:', userId)
    
    try {
      // Load both profile parts with individual error handling
      const [registrantResult, basicProfileResult] = await Promise.allSettled([
        db.profiles.getById(userId),           // registrant_profiles table
        db.basicProfiles.getByUserId(userId)   // basic_profiles table
      ])

      console.log('📄 Profile loading results:', {
        registrant: registrantResult.status,
        basic: basicProfileResult.status,
        registrantError: registrantResult.status === 'rejected' ? registrantResult.reason : null,
        basicError: basicProfileResult.status === 'rejected' ? basicProfileResult.reason : null
      })

      // Extract data from successful results
      const registrantData = registrantResult.status === 'fulfilled' && !registrantResult.value.error 
        ? registrantResult.value.data 
        : null

      const basicData = basicProfileResult.status === 'fulfilled' && !basicProfileResult.value.error
        ? basicProfileResult.value.data 
        : null

      // ✅ FIXED: Create fallback profile if registrant profile is missing
      if (!registrantData) {
        console.warn('⚠️ No registrant profile found - profile may not have been created by trigger')
        console.log('ℹ️ This suggests the database trigger is not working correctly')
        
        // Set a minimal profile to prevent app crashes
        const fallbackProfile = {
          id: userId,
          email: user?.email,
          roles: [], // Empty roles array
          ...basicData // Include basic profile data if available
        }
        
        console.log('📄 Using fallback profile:', fallbackProfile)
        setProfile(fallbackProfile)
        return
      }

      // Combine the profile data
      const combinedProfile = {
        // Main profile data (including roles) from registrant_profiles
        ...registrantData,
        // Additional profile data from basic_profiles (if available)
        ...(basicData || {})
      }

      console.log('📄 Combined profile loaded successfully:', { 
        hasRoles: !!combinedProfile?.roles,
        roles: combinedProfile?.roles,
        hasBasicData: !!basicData,
        registrantKeys: registrantData ? Object.keys(registrantData) : [],
        basicKeys: basicData ? Object.keys(basicData) : [],
        fullProfile: combinedProfile
      })

      setProfile(combinedProfile)

    } catch (err) {
      console.error('💥 Critical profile loading error:', err)
      
      // Create emergency fallback profile to prevent app crashes
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
  }

  // ✅ FIXED: Enhanced signup with better trigger handling
  const signUp = async (email, password, userData) => {
    console.log('📝 Signing up user:', email)
    
    try {
      setLoading(true)
      setError(null)

      // Call your auth helper - the trigger should create the profile automatically
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        console.error('❌ Signup error:', error)
        setError(error.message)
        return { success: false, error: error.message }
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.id)
        console.log('⏳ Database trigger should create profile automatically...')
        
        // ✅ ADDED: Wait a moment for trigger to complete, then verify profile exists
        setTimeout(async () => {
          try {
            const { data: profileCheck } = await db.profiles.getById(data.user.id)
            if (!profileCheck) {
              console.warn('⚠️ Profile not created by trigger - manual creation may be needed')
              console.warn('🔧 Check your database triggers in Supabase dashboard')
            } else {
              console.log('✅ Profile confirmed created by trigger')
            }
          } catch (err) {
            console.warn('⚠️ Could not verify profile creation:', err.message)
          }
        }, 2000)
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

  // Sign in existing user
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

  // Sign out user
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

  // ✅ FIXED: Enhanced update profile with proper data handling
  const updateProfile = async (updates) => {
    console.log('📝 Updating profile:', updates)
    
    try {
      setError(null)

      if (!user) {
        throw new Error('No authenticated user')
      }

      // Determine which table to update based on the fields being updated
      const registrantFields = ['email', 'first_name', 'last_name', 'roles']
      const isRegistrantUpdate = Object.keys(updates).some(key => registrantFields.includes(key))
      
      let result
      if (isRegistrantUpdate) {
        console.log('📝 Updating registrant_profiles table')
        result = await db.profiles.update(user.id, updates)
      } else {
        console.log('📝 Updating basic_profiles table')
        result = await db.basicProfiles.update(user.id, updates)
      }
      
      const { data, error } = result
      
      if (error) {
        console.error('❌ Profile update error:', error)
        setError(error.message)
        return { success: false, error: error.message }
      }

      console.log('✅ Profile updated successfully')
      
      // Reload the full profile to ensure consistency
      await loadUserProfile(user.id)
      
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('💥 Profile update failed:', err)
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // ✅ IMPROVED: Enhanced role checking with better debugging
  const hasRole = (role) => {
    const result = Array.isArray(profile?.roles) && profile.roles.includes(role)
    console.log('🔍 hasRole check:', { 
      role, 
      result, 
      userRoles: profile?.roles,
      rolesType: typeof profile?.roles,
      isArray: Array.isArray(profile?.roles),
      hasProfile: !!profile,
      profileKeys: profile ? Object.keys(profile) : 'no profile'
    })
    return result
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!Array.isArray(profile?.roles)) return false
    return roles.some(role => profile.roles.includes(role))
  }

  // Get user's primary role (first in array)
  const getPrimaryRole = () => {
    return Array.isArray(profile?.roles) && profile.roles.length > 0 ? profile.roles[0] : null
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  const value = {
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
    
    // Computed values
    isAuthenticated: !!user,
    isApplicant: hasRole('applicant'),
    isLandlord: hasRole('landlord'),
    isPeerSupport: hasRole('peer')
  }

  console.log('🎯 AuthProvider rendering with state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    error: !!error,
    userRoles: profile?.roles
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}