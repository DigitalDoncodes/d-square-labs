const errorHandler = (err, req, res, next) => {
  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large (max 10MB)' });
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
};

module.exports = errorHandler;
