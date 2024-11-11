'use client'

import { useState } from 'react'
import { useUser } from './context/UserContext'
import { RotatingLines } from 'react-loader-spinner'
import UploadWidget from './components/upload-widget'
import cld from "./components/cld"
import { AdvancedImage } from '@cloudinary/react'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { enhance, generativeRestore, upscale } from "@cloudinary/url-gen/actions/effect"
import { focusOn, autoGravity } from "@cloudinary/url-gen/qualifiers/gravity"
import { face } from "@cloudinary/url-gen/qualifiers/focusOn"

// The Profile page lets the user input their personal information and upload a profile picture.
export default function MyProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const { 
    setProfilePublicId,
    profileImage, setProfileImage,
    name, setName,
    location, setLocation,
    birthday, setBirthday,
    setProfileIsPoorQuality
  } = useUser()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
  }

  const handleUploadSuccess = (publicId: string, poorQuality: boolean) => {
    setLoading(false)
    setUploadError('')
    setProfilePublicId(publicId)
    setProfileIsPoorQuality(poorQuality)

    // Create the delivery URL for the profile picture:
    const profileImage = cld.image(publicId)

    profileImage.resize(fill().width(300).height(300).gravity(
      focusOn(face()).fallbackGravity(autoGravity())))
      .format('auto').quality('auto')

    if (poorQuality) {
      profileImage.effect(enhance()).effect(generativeRestore()).effect(upscale())
    }

    setProfileImage(profileImage)
  }

  const handleUploadError = (error: string) => {
    setLoading(false)
    setUploadError(error)
  }

  const handleImageUpload = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    // The actual upload logic is handled in the UploadWidget component
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-300">
          Save
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p><strong>Name:</strong> {name || 'Not set'}</p>
          <p><strong>Location:</strong> {location || 'Not set'}</p>
          <p><strong>Birthday:</strong> {birthday || 'Not set'}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition duration-300"
          >
            Edit Profile
          </button>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
        <p>Upload an image for your profile picture.</p>
        <p className="mb-6">We&apos;ll check that it&apos;s not offensive and doesn&apos;t contain malware.</p>
        <div className="space-y-4">
        {loading ? (
          <RotatingLines
          visible={true}
          width="96"
          strokeColor="#de5e14"
          strokeWidth="5"
          animationDuration="0.75"
        />
        ):
        profileImage ? (
          <AdvancedImage cldImg={profileImage} width={300} height={300} alt="Profile"/>

        ) : (
          <AdvancedImage cldImg={cld.image("avatar-pic").
            resize(fill().width(300).height(300).gravity(autoGravity())).format('auto').quality('auto')} width={300} height={300} alt="Profile" />
        )}
        <UploadWidget
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          setLoading={setLoading}
          buttonText="Edit Profile Picture"
          onClick={handleImageUpload}
        />
        </div>
        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
      </div>
    </div>
  )
}