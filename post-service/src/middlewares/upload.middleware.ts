import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'instagram-posts',
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp4'],
      resource_type: 'auto', // optional: for images/videos
    };
  },
});

const upload = multer({ storage });
export default upload;
