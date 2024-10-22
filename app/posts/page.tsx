'use client'

import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import { useUser } from '../context/UserContext';
import { RotatingLines } from 'react-loader-spinner';

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function MyPosts() {
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadWidget, setUploadWidget] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { profilePicture, posts, setPosts } = useUser()

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
                  setNewImage(data.imageUrl);
                  setUploadError('');
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
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPost.trim() !== '') {
      setPosts(prevPosts => [
        { id: Date.now(), content: newPost, image: newImage },
        ...prevPosts,
      ])
      setNewPost('')
      setNewImage('')
      setUploadError('')
    }
  }

  const openUploadWidget = () => {
    if (uploadWidget) {
      uploadWidget.open();
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Posts</h1>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded"
        />
        {loading ? (
          <RotatingLines
          visible={true}
          width="96"
          strokeColor="#de5e14"
          strokeWidth="5"
          animationDuration="0.75"
        />
        ):
        newImage && (
          <CldImage 
             src={newImage} 
             alt="New post" 
             width={200} 
             height={200} 
             crop="auto" 
             className="rounded" />
        )}
        <div>
          <button
            type="button"
            onClick={openUploadWidget}
            className="bg-green-500 text-white p-2 rounded mr-2"
          >
            Upload Image
          </button>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Post
          </button>
        </div>
        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
      </form>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded flex items-start">
            <div className="flex-shrink-0 w-[75px] h-[75px] mr-4">
            <CldImage
              src={profilePicture || 'avatar'}
              alt="Profile"
              width={75}
              height={75}
              rawTransformations={['ar_1,c_fill,g_face,h_75', 'r_max', 'co_pink,e_outline']}

            />
            </div>
            <div>
              <p>{post.content}</p>
              {post.image && (
                <CldImage src={post.image} alt="Post" width={200} height={200} crop="auto" className="mt-2 rounded" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}