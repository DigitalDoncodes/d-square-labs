const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const {
  listPosts, getPost, createPost, updatePost, deletePost, toggleLikePost,
  createReply, deleteReply, toggleLikeReply,
} = require('../controllers/postController');

router.use(verifyToken);

router.get('/',      listPosts);
router.get('/:id',   getPost);
router.post('/',     createPost);
router.put('/:id',   updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', toggleLikePost);

router.post('/:id/replies',              createReply);
router.delete('/:id/replies/:replyId',   deleteReply);
router.post('/:id/replies/:replyId/like', toggleLikeReply);

module.exports = router;
