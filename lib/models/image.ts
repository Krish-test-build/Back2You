const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  name: String,
  image: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('Image', ImageSchema);
