'use client'

import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import { useUser } from './context/UserContext';
import { RotatingLines } from 'react-loader-spinner';

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function MyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isPoorQuality, setIsPoorQuality] = useState(false);
  const [uploadWidget, setUploadWidget] = useState<any>(null);
  const { 
    profilePicture, setProfilePicture,
    name, setName,
    location, setLocation,
    birthday, setBirthday
  } = useUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'cld-demo-ugc',
          clientAllowedFormats: 'image',
          uploadPreset: 'ugc-profile-photo',
          sources: ['local'],
          multiple: false,
          maxFiles: 1,
        },
        async (error: any, result: any) => {
          if (error) {
            console.error('Upload error:', error);
            setUploadError(`Upload failed: ${error.status || 'Unknown error'}`);
            return;
          }
          if (result && result.event === 'success') {
            try {
              setLoading(true);
              const checkModeration = async () => {
                const response = await fetch('/api/test', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(result.info),
                });
                const data = await response.json();
                if (data.status === 'approved') {
                  setLoading(false);
                  setProfilePicture(data.imageUrl);
                  setUploadError('');
                  setIsPoorQuality(data.poorQuality);
                } else if (data.status === 'rejected') {
                  setLoading(false);
                  setUploadError(data.message);
                } else {
                  // If still pending, check again after a delay
                  setTimeout(checkModeration, 1000);
                }
              };

              checkModeration();
            } catch (error) {
              console.error('Error checking moderation status:', error);
              setUploadError('An error occurred while processing your image.');
            }
          } else if (result && result.event === 'close') {
            if (!result.info) {
              setUploadError('Upload cancelled or failed. Please try again.');
            }
          }
        }
      )
      setUploadWidget(widget);
    }

    return () => {
      if (uploadWidget) {
        uploadWidget.destroy();
      }
    }
  }, [setProfilePicture, setUploadWidget])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
  }

  const openUploadWidget = () => {
    if (uploadWidget) {
      uploadWidget.open();
    }
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
          src={"avatar.png"}
          alt="Profile"
          crop="fill"
          gravity="auto"
          width={300}
          height={450}
        />
        )}
        <button
          onClick={openUploadWidget}
          className="mt-2 bg-blue-500 text-white p-2 rounded"
        >
          Edit Profile Picture
        </button>
        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
      </div>
    </div>
  )
}