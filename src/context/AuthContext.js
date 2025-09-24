// src/context/AuthContext.js - FIXED VERSION
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../utils/supabase'

// Create and export AuthContext
export const AuthContext = createContext({})

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Main AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state on mount
  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing auth state...')
    
    let mounted = true
    let initTimeout = null

    const initializeAuth = async () => {
      try {
        // Prevent infinite loading with timeout
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.log('⚠️ AuthProvider: Initialization timeout - setting unauthenticated')
            setUser(null)
            setProfile(null)
            setLoading(false)
            setError(null)
          }
        }, 8000)

        // Get current session
        console.log('🔐 AuthProvider: Checking for existing session...')
        const sessionResult = await auth.getSession()
        
        // Clear timeout on response
        if (initTimeout) {
          clearTimeout(initTimeout)
          initTimeout = null
        }

        if (!mounted) return

        if (sessionResult.error) {
          console.error('❌ AuthProvider: Session error:', sessionResult.error.message)
          setUser(null)
          setProfile(null)
          setLoading(false)
          setError(null)
          return
        }

        if (sessionResult.session?.user) {
          console.log('✅ AuthProvider: Active session found, loading profile...')
          setUser(sessionResult.session.user)
          
          // Load profile with error handling
          try {
            await loadUserProfile(sessionResult.session.user.id)
          } catch (profileErr) {
            console.error('⚠️ AuthProvider: Profile load failed, but keeping user logged in:', profileErr)
            // Create minimal profile to prevent blocking
            setProfile({
              id: sessionResult.session.user.id,
              user_id: sessionResult.session.user.id, // ✅ ADDED: Correct field
              email: sessionResult.session.user.email,
              first_name: sessionResult.session.user.user_metadata?.firstName || 'User',
              last_name: sessionResult.session.user.user_metadata?.lastName || '',
              roles: ['applicant'],
              is_active: true
            })
          }
        } else {
          console.log('ℹ️ AuthProvider: No active session')
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
        setError(null)

      } catch (err) {
        if (initTimeout) {
          clearTimeout(initTimeout)
        }
        
        if (mounted) {
          console.error('💥 AuthProvider: Init failed:', err.message)
          setUser(null)
          setProfile(null)
          setLoading(false)
          setError(null)
        }
      }
    }

    // Set up auth state listener
    console.log('🔐 AuthProvider: Setting up auth state listener...')
    const subscription = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('🔐 AuthProvider: Auth state changed:', event)

      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('🚪 AuthProvider: User signed out')
        setUser(null)
        setProfile(null)
        setError(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' && session.user) {
        console.log('👤 AuthProvider: User signed in')
        setUser(session.user)
        setLoading(true)
        
        const profileResult = await loadUserProfile(session.user.id)
        
        // ✅ FIXED: Check if profile was found, if not create one
        if (!profileResult || profileResult.error?.code === 'NOT_FOUND') {
          console.log('⚠️ AuthProvider: No profile found after sign in, attempting to create...')
          
          try {
            const userData = session.user.user_metadata
            console.log('👤 AuthProvider: User metadata for profile creation:', userData)
            
            if (userData?.firstName) {
              console.log('👤 AuthProvider: Creating missing profile after sign in...')
              
              // ✅ FIXED: Correct schema for registrant_profiles table
              const profileData = {
                user_id: session.user.id, // ✅ FIXED: Use user_id, not id
                email: session.user.email,
                first_name: userData.firstName || '',
                last_name: userData.lastName || '',
                roles: userData.roles || ['applicant']
              }

              console.log('👤 AuthProvider: Creating profile with data:', profileData)

              const createResult = await db.profiles.create(profileData)
              
              if (createResult.success && createResult.data) {
                console.log('✅ AuthProvider: Profile created successfully after sign in')
                setProfile(createResult.data)
              } else {
                console.error('❌ AuthProvider: Profile creation failed:', createResult.error)
                throw createResult.error
              }
            } else {
              console.log('⚠️ AuthProvider: No user metadata available, creating basic profile')
              // Create basic profile without metadata
              const profileData = {
                user_id: session.user.id,
                email: session.user.email,
                first_name: 'User',
                last_name: '',
                roles: ['applicant']
              }
              
              const createResult = await db.profiles.create(profileData)
              if (createResult.success && createResult.data) {
                console.log('✅ AuthProvider: Basic profile created successfully')
                setProfile(createResult.data)
              } else {
                throw new Error('Failed to create basic profile')
              }
            }
          } catch (createErr) {
            console.error('❌ AuthProvider: Profile creation failed after sign in:', createErr)
            // Create minimal in-memory profile to unblock user
            setProfile({
              user_id: session.user.id,
              email: session.user.email,
              first_name: session.user.user_metadata?.firstName || 'User',
              last_name: session.user.user_metadata?.lastName || '',
              roles: ['applicant'],
              is_active: true
            })
          }
        }
        
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session.user) {
        console.log('🔄 AuthProvider: Token refreshed')
        setUser(session.user)
        // Don't reload profile on token refresh
      }
    })

    // Initialize
    initializeAuth()

    // Cleanup
    return () => {
      mounted = false
      if (initTimeout) {
        clearTimeout(initTimeout)
      }
      subscription?.unsubscribe()
    }
  }, [])

  // ✅ FIXED: Load user profile by auth.users.id (but look up by user_id in registrant_profiles)
  const loadUserProfile = async (authUserId) => {
    console.log('👤 AuthProvider: Loading profile for auth user:', authUserId)
    
    return new Promise((resolve, reject) => {
      const profileTimeout = setTimeout(() => {
        reject(new Error('Profile loading timed out'))
      }, 6000)

      // ✅ FIXED: Query by user_id field (which references auth.users.id)
      db.profiles.getByUserId(authUserId)
        .then((result) => {
          clearTimeout(profileTimeout)
          
          if (result.error) {
            if (result.error.code === 'NOT_FOUND' || result.error.code === 'PGRST116') {
              console.log('ℹ️ AuthProvider: No profile found (new user)')
              setProfile(null)
              resolve()
            } else {
              console.error('❌ AuthProvider: Profile error:', result.error.message)
              reject(result.error)
            }
            return
          }

          if (result.data) {
            console.log('✅ AuthProvider: Profile loaded successfully')
            setProfile(result.data)
            setError(null)
            resolve()
          } else {
            console.log('ℹ️ AuthProvider: No profile data')
            setProfile(null)
            resolve()
          }
        })
        .catch(err => {
          clearTimeout(profileTimeout)
          reject(err)
        })
    })
  }

  // ✅ FIXED: Sign up new user - simplified, profile creation moved to auth state change
  const signUp = async (email, password, userData) => {
    console.log('🔐 AuthProvider: Starting sign up for:', email)
    setLoading(true)
    setError(null)

    try {
      // ✅ FIXED: Handle the correct return format from authService
      const authResult = await auth.signUp(email, password, userData)
      
      if (!authResult.success || authResult.error) {
        console.error('❌ AuthProvider: Sign up error:', authResult.error?.message)
        setError(authResult.error)
        setLoading(false)
        return { data: null, error: authResult.error }
      }

      console.log('✅ AuthProvider: Sign up successful - profile creation will happen in auth state change')
      setLoading(false)
      return { data: authResult.data, error: null }

    } catch (err) {
      console.error('💥 AuthProvider: Sign up failed:', err.message)
      setError({ message: err.message, code: 'signup_exception' })
      setLoading(false)
      return { data: null, error: { message: err.message, code: 'signup_exception' } }
    }
  }

  // ✅ FIXED: Sign in existing user - handle correct return format
  const signIn = async (email, password) => {
    console.log('🔐 AuthProvider: Starting sign in for:', email)
    setLoading(true)
    setError(null)

    try {
      const authResult = await auth.signIn(email, password)
      
      if (!authResult.success || authResult.error) {
        console.error('❌ AuthProvider: Sign in error:', authResult.error?.message)
        setError(authResult.error)
        setLoading(false)
        return { data: null, error: authResult.error }
      }

      console.log('✅ AuthProvider: Sign in successful')
      setLoading(false)
      return { data: authResult.data, error: null }

    } catch (err) {
      console.error('💥 AuthProvider: Sign in failed:', err.message)
      setError({ message: err.message, code: 'signin_exception' })
      setLoading(false)
      return { data: null, error: { message: err.message, code: 'signin_exception' } }
    }
  }

  // Sign out user with aggressive timeout
  const signOut = async () => {
    console.log('🔐 AuthProvider: Starting sign out...')
    setLoading(true)

    try {
      // Race logout against aggressive timeout
      const logoutPromise = auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timed out')), 3000)
      )

      const result = await Promise.race([logoutPromise, timeoutPromise])

      if (result.error) {
        console.error('❌ AuthProvider: Sign out error:', result.error.message)
      }

      // Always clear local state regardless of server response
      console.log('✅ AuthProvider: Clearing local auth state')
      setUser(null)
      setProfile(null)
      setError(null)
      setLoading(false)

      return { error: null }

    } catch (err) {
      console.error('💥 AuthProvider: Sign out failed or timed out:', err.message)
      
      // Clear local state even on failure/timeout
      console.log('🔧 AuthProvider: Force clearing local state after timeout')
      setUser(null)
      setProfile(null)
      setError(null)
      setLoading(false)
      
      return { error: null }
    }
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user?.id) {
      console.log('⚠️ AuthProvider: Cannot refresh profile - no user')
      return
    }
    
    console.log('🔄 AuthProvider: Refreshing profile...')
    try {
      await loadUserProfile(user.id)
    } catch (err) {
      console.error('💥 AuthProvider: Profile refresh failed:', err.message)
      setError(err)
    }
  }

  // Clear error state
  const clearError = () => {
    setError(null)
  }

  // Helper: Check if user has specific role
  const hasRole = (role) => {
    return profile?.roles?.includes(role) || false
  }

  // Helper: Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!profile?.roles || !Array.isArray(profile.roles)) return false
    return roles.some(role => profile.roles.includes(role))
  }

  // Computed values
  const isAuthenticated = !!(user && profile)
  const isNewUser = !!(user && !profile)

  // Context value
  const value = {
    // State
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    isNewUser,

    // Methods
    signUp,
    signIn,
    signOut,
    refreshProfile,
    clearError,

    // Helpers
    hasRole,
    hasAnyRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Default export
export default AuthProvider