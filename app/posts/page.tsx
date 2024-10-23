'use client'

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { useUser } from '../context/UserContext';
import { RotatingLines } from 'react-loader-spinner';
import UploadWidget from '../components/upload-widget';

interface Post {
  id: number
  content: string
  image?: string
}

export default function MyPosts() {
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const { profilePicture, posts, setPosts } = useUser()

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

  const handleUploadSuccess = (imageUrl: string) => {
    setLoading(false);
    setNewImage(imageUrl)
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
        <div className="flex space-x-2">
          <UploadWidget
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            setLoading={setLoading}
            buttonText="Upload Image"
            onClick={handleImageUpload}
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Post
          </button>
        </div>
        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
      </form>
      <div className="space-y-4">
        {posts.map((post: Post) => (
          <div key={post.id} className="border p-4 rounded flex items-start">
            <div className="flex-shrink-0 w-[75px] h-[75px] mr-4">
            <CldImage
              src={profilePicture || 'avatar-pic'}
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