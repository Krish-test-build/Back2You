import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  name: String,
  image: {
    data: Buffer,
    contentType: String
  }
});

const Image = mongoose.models.Image || mongoose.model('Image', ImageSchema);

export default Image;
