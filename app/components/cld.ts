import { Cloudinary } from "@cloudinary/url-gen"
import { CLOUDINARY_CONFIG } from "../config/cloudinary"

// Create a Cloudinary instance for the product environment.
const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CONFIG.cloudName
  }
})

export default cld