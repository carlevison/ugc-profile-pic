import { Cloudinary } from "@cloudinary/url-gen";

// Create a Cloudinary instance for the product environment.
const cld = new Cloudinary({
  cloud: {
    cloudName: "cld-demo-ugc"
  }
});

export default cld;