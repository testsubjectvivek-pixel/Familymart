const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const filename = `img_${Date.now()}.jpg`;
    const outputPath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    const url = `/uploads/${filename}`;
    res.status(201).json({ url });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadImage };
