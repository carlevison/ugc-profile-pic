'use client'

import { CloudinaryImage } from '@cloudinary/url-gen/index'
import React, { createContext, useState, useContext } from 'react'

interface Post {
  id: number
  content: string
  image?: string
}


interface UserContextType {
  profilePublicId: string
  setProfilePublicId: (publicId: string) => void
  profileImage: CloudinaryImage | undefined;
  setProfileImage: React.Dispatch<React.SetStateAction<CloudinaryImage | undefined>>;  // And this line
  name: string
  setName: (name: string) => void
  location: string
  setLocation: (location: string) => void
  birthday: string
  setBirthday: (birthday: string) => void
  posts: Post[]
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
  profileIsPoorQuality: boolean;
  setProfileIsPoorQuality: (isPoorQuality: boolean) => void;
}

// The UserContext ensures the user information persists when switching pages
const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profilePublicId, setProfilePublicId] = useState('')
  const [profileImage, setProfileImage] = useState<CloudinaryImage | undefined>(undefined)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [birthday, setBirthday] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [profileIsPoorQuality, setProfileIsPoorQuality] = useState(false)


  return (
    <UserContext.Provider value={{ 
      profilePublicId, setProfilePublicId,
      profileImage, setProfileImage,
      name, setName,
      location, setLocation,
      birthday, setBirthday,
      posts, setPosts,
      profileIsPoorQuality, setProfileIsPoorQuality
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}