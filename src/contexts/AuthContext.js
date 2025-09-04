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
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ session, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        setError(error.message)
      } else {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadUserProfile(session.user.id)
        }
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load user profile from database
  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await db.profiles.getById(userId)
      if (error) {
        console.error('Error loading profile:', error)
        setError(error.message)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile loading error:', err)
      setError('Failed to load user profile')
    }
  }

  // Sign up new user
  const signUp = async (email, password, userData) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      // Create profile in database
      if (data.user) {
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          roles: userData.roles || ['applicant']
        }

        const { error: profileError } = await db.profiles.create(profileData)
        if (profileError) {
          console.error('Error creating profile:', profileError)
          setError('Account created but profile setup failed')
        }
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during signup'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Sign in existing user
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during signin'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Sign out user
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await auth.signOut()
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(null)
      setProfile(null)
      return { success: true }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during signout'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setError(null)

      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await db.profiles.update(user.id, updates)
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setProfile(data[0])
      return { success: true, data: data[0] }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return profile?.roles?.includes(role) || false
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}