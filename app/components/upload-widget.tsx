'use client'

import { useState, useEffect } from 'react'
import { CloudinaryWidget } from '../types';

interface UploadWidgetProps {
  onUploadSuccess: (imageUrl: string, poorQuality: boolean) => void
  onUploadError: (error: string) => void
  setLoading: (loading: boolean) => void
  buttonText: string
  onClick: (e: React.MouseEvent) => void
}

export default function UploadWidget({ onUploadSuccess, onUploadError, setLoading, buttonText, onClick  }: UploadWidgetProps) {
    const [uploadWidget, setUploadWidget] = useState<CloudinaryWidget | null>(null)

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
          cropping: true,
          croppingAspectRatio: 1,
          showSkipCropButton: true,
        },
        async (error: any, result: any) => {
          if (error) {
            console.error('Upload error:', error)
            onUploadError(`Upload failed: ${error.statusText || 'Unknown error'}`)
            return
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
                })
                const data = await response.json()
                if (data.status === 'approved') {
                  onUploadSuccess(data.imageUrl, data.poorQuality)
                } else if (data.status === 'rejected') {
                  onUploadError(data.message)
                } else {
                  // If still pending, check again after a delay
                  setTimeout(checkModeration, 1000)
                }
              }

              checkModeration()
            } catch (error) {
              console.error('Error checking moderation status:', error)
              onUploadError('An error occurred while processing your image.')
            }
          } else if (result && result.event === 'close') {
            if (!result.info) {
              onUploadError('Upload cancelled or failed. Please try again.')
            }
          }
        }
      )
      setUploadWidget(widget)
    }

    return () => {
      if (uploadWidget) {
        uploadWidget.destroy()
      }
    }
  }, [onUploadSuccess, onUploadError])

  const openUploadWidget = (e: React.MouseEvent) => {
    onClick(e)
    if (uploadWidget) {
      uploadWidget.open()
    }
  }

  return (
    <button
      onClick={openUploadWidget}
      className="bg-green-500 text-white p-2 rounded mr-2"
    >
      {buttonText}
    </button>
  )
}