const router = require('express').Router();
const {
  listAlbums,
  getAlbum,
  createAlbum,
  deleteAlbum,
  listAlbumPhotos,
} = require('../controllers/albumController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', listAlbums);
router.post('/', createAlbum);
router.get('/:id', getAlbum);
router.delete('/:id', deleteAlbum);
router.get('/:id/photos', listAlbumPhotos);

module.exports = router;
