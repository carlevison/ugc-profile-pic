'use client'

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { useUser } from './context/UserContext';
import { RotatingLines } from 'react-loader-spinner';
import UploadWidget from './components/upload-widget';

export default function MyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isPoorQuality, setIsPoorQuality] = useState(false);

  const { 
    profilePicture, setProfilePicture,
    name, setName,
    location, setLocation,
    birthday, setBirthday
  } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
  }

  const handleUploadSuccess = (imageUrl: string, poorQuality: boolean) => {
    setLoading(false);
    setProfilePicture(imageUrl)
    setIsPoorQuality(poorQuality);
    setUploadError('')
  }

  const handleUploadError = (error: string) => {
    setLoading(false);
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
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
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
            className="bg-green-500 text-white p-2 rounded"
          >
            Edit Profile
          </button>
        </div>
      )}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Profile Picture</h2>
        {loading ? (
          <RotatingLines
          visible={true}
          width="96"
          strokeColor="#de5e14"
          strokeWidth="5"
          animationDuration="0.75"
        />
        ):
        profilePicture ? (
          <CldImage
            src={profilePicture}
            alt="Profile"
            crop="fill"
            gravity="face"
            width={300}
            height={450}
            enhance={isPoorQuality && true}
            restore={isPoorQuality && true}
          />
        ) : (
          <CldImage
          src={"avatar-pic"}
          alt="Profile"
          crop="fill"
          gravity="auto"
          width={300}
          height={450}
        />
        )}
        <UploadWidget
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          setLoading={setLoading}
          buttonText="Edit Profile Picture"
          onClick={handleImageUpload}
        />
        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
      </div>
    </div>
  )
}