export interface CloudinaryWidget {
    open: () => void;
    destroy: () => void;
  }
  
  export interface Cloudinary {
    createUploadWidget: (
      options: any,
      callback: (error: any, result: any) => void
    ) => CloudinaryWidget;
  }
  
  declare global {
    interface Window {
      cloudinary: Cloudinary;
    }
  }