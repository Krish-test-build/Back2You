import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  name: String,
  url: String,
  publicId: String,
  image: {
    data: Buffer,
    contentType: String
  }
}, {
  timestamps: true
});

const Image = mongoose.models.Image || mongoose.model('Image', ImageSchema);

export default Image;
