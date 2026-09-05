const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
  res.status(201).json({ url: `${baseUrl}/uploads/${req.file.filename}` });
};

module.exports = { uploadImage };