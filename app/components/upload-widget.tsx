'use client'

import { useState, useEffect, useCallback  } from 'react'
import { CloudinaryWidget } from '../types';

interface UploadWidgetProps {
  onUploadSuccess: (publicId: string, poorQuality: boolean) => void
  onUploadError: (error: string) => void
  setLoading: (loading: boolean) => void
  buttonText: string
  onClick: (e: React.MouseEvent) => void
}

// The Upload widget component
export default function UploadWidget({ onUploadSuccess, onUploadError, setLoading, buttonText, onClick }: UploadWidgetProps) {
    const [uploadWidget, setUploadWidget] = useState<CloudinaryWidget | null>(null)
  
    // Check if the moderation result from the uploaded asset has been received at the moderate endpoint.
    // This check times out after a minute.
    const checkModeration = useCallback(async (info: any, startTime: number) => {
      if (Date.now() - startTime > 60000) {
        onUploadError('Moderation check timed out. Please try again.')
        return
      }

      // Once a second, check if the moderation result has been received at tge moderate endpoint.
      try {
        const response = await fetch('/api/moderate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(info),
        })
        const data = await response.json()
        if (data.status === 'approved') {
          onUploadSuccess(data.publicId, data.poorQuality)
        } else if (data.status === 'rejected') {
          onUploadError(data.message)
        } else {
          // If still pending, check again after a delay
          setTimeout(() => checkModeration(info, startTime), 1000)
        }
      } catch (error) {
        console.error('Error checking moderation status:', error)
        onUploadError('An error occurred while processing your image.')
      }
    }, [onUploadSuccess, onUploadError])


  useEffect(() => {
    if (typeof window !== 'undefined' && window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'cld-demo-ugc',
          clientAllowedFormats: 'image',
          uploadPreset: 'ugc-profile-photo-local',
          sources: ['local'],
          multiple: false,
          maxFiles: 1,
        },
        async (error: any, result: any) => {
          if (error) {
            console.error('Upload error:', error)
            onUploadError(`Upload failed: ${error.statusText || 'Unknown error'}`)
            return
          }

          if (result && result.event === 'success') {
            onUploadError('')
            setLoading(true);
            const startTime = Date.now();
            checkModeration(result.info, startTime);
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
  }, [checkModeration, onUploadError])

  const openUploadWidget = (e: React.MouseEvent) => {
    onClick(e)
    if (uploadWidget) {
      uploadWidget.open()
    }
  }

  // Return the button that opens the Upload widget
  return (
    <button
      onClick={openUploadWidget}
      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition duration-300"
    >
      {buttonText}
    </button>
  )
}