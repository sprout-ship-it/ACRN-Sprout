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
    
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        console.log('📡 Getting initial session...')
        
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

  // ✅ SIMPLIFIED: Load only registrant_profiles (no more basic_profiles)
  const loadUserProfile = async (userId) => {
    console.log('📄 Loading profile for user:', userId)
    
    try {
      // Load only the registrant profile
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

      // Use the registrant profile directly (no more basic_profiles to merge)
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
  }

  // ✅ SIMPLIFIED: Enhanced signup (no basic_profiles creation needed)
// src/contexts/AuthContext.js
// FIXED: Enhanced signup using existing auth and db imports (no supabase import needed)

// Replace the signUp function (around line 110) with this:

const signUp = async (email, password, userData) => {
  console.log('📝 Signing up user:', email)
  
  try {
    setLoading(true)
    setError(null)

    // Step 1: Create the auth user using existing auth helper
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
        
        // Step 4: Manually create the registrant_profiles entry
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
          console.log('✅ Profile created manually');
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

  // ✅ SIMPLIFIED: Update profile (only registrant_profiles table)
const updateProfile = async (updates) => {
  console.log('📝 Updating profile:', updates)
  
  try {
    setError(null)

    if (!user) {
      throw new Error('No authenticated user')
    }

    // All updates go to registrant_profiles table now
    console.log('📝 Updating registrant_profiles table')
    const result = await db.profiles.update(user.id, updates)
    
    const { data, error } = result
    
    if (error) {
      console.error('❌ Profile update error:', error)
      setError(error.message)
      return { success: false, error: error.message }
    }

    console.log('✅ Profile updated successfully')
    
    // ✅ FIXED: Update local profile state directly instead of reloading
    // This prevents the timeout issue when reloading from database
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

  // Role checking functions
  const hasRole = (role) => {
    const result = Array.isArray(profile?.roles) && profile.roles.includes(role)
    console.log('🔍 hasRole check:', { 
      role, 
      result, 
      userRoles: profile?.roles,
      rolesType: typeof profile?.roles,
      isArray: Array.isArray(profile?.roles),
      hasProfile: !!profile
    })
    return result
  }

  const hasAnyRole = (roles) => {
    if (!Array.isArray(profile?.roles)) return false
    return roles.some(role => profile.roles.includes(role))
  }

  const getPrimaryRole = () => {
    return Array.isArray(profile?.roles) && profile.roles.length > 0 ? profile.roles[0] : null
  }

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