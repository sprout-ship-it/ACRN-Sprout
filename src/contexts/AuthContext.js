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

  // Load user profile from database
// Load user profile from database
const loadUserProfile = async (userId) => {
  console.log('📄 Loading profile for user:', userId)
  
  try {
    // Load from BOTH tables
    const [profileResult, basicProfileResult] = await Promise.all([
      db.profiles.getById(userId),
      db.basicProfiles.getByUserId(userId)
    ]);

    // Combine the data
    const combinedProfile = {
      // Main profile data (including roles)
      ...profileResult.data,
      // Basic profile data
      ...basicProfileResult.data
    };

    console.log('📄 Combined profile loaded:', { 
      hasRoles: !!combinedProfile?.roles,
      roles: combinedProfile?.roles,
      hasBasicData: !!basicProfileResult.data,
      fullProfile: combinedProfile
    });

    setProfile(combinedProfile);

  } catch (err) {
    console.error('💥 Profile loading error:', err);
    console.log('ℹ️ Continuing without profile data');
  }
}

  // Sign up new user
// Replace your signUp function in AuthContext.js with this:
const signUp = async (email, password, userData) => {
  console.log('📝 Signing up user:', email)
  
  try {
    setLoading(true)
    setError(null)

    // Call your auth helper - the trigger will create the profile automatically
    const { data, error } = await auth.signUp(email, password, userData)
    
    if (error) {
      console.error('❌ Signup error:', error)
      setError(error.message)
      return { success: false, error: error.message }
    }

    if (data.user) {
      console.log('✅ User created successfully via trigger:', data.user.id)
      // The database trigger should have created the profile automatically
      // We'll load it in the auth state change listener
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

  // Update user profile
  const updateProfile = async (updates) => {
    console.log('📝 Updating profile:', updates)
    
    try {
      setError(null)

      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await db.profiles.update(user.id, updates)
      
      if (error) {
        console.error('❌ Profile update error:', error)
        setError(error.message)
        return { success: false, error: error.message }
      }

      console.log('✅ Profile updated successfully')
      setProfile(data[0])
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('💥 Profile update failed:', err)
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    const result = profile?.roles?.includes(role) || false
    console.log('🔍 hasRole check:', { 
      role, 
      result, 
      userRoles: profile?.roles,
      hasProfile: !!profile,
      profileKeys: profile ? Object.keys(profile) : 'no profile'
    })
    return result
}

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!profile?.roles) return false
    return roles.some(role => profile.roles.includes(role))
  }

  // Get user's primary role (first in array)
  const getPrimaryRole = () => {
    return profile?.roles?.[0] || null
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
    error: !!error
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}