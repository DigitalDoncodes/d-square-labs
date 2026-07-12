const router = require('express').Router();
const c = require('../controllers/projectController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', c.listProjects);
router.post('/', c.createProject);
router.get('/:id', c.getProject);
router.put('/:id', c.updateProject);
router.delete('/:id', c.deleteProject);
router.post('/:id/members', c.addMember);
router.delete('/:id/members/:userId', c.removeMember);
router.get('/:id/tasks', c.listTasks);
router.post('/:id/tasks', c.createTask);
router.put('/:id/tasks/:taskId', c.updateTask);
router.delete('/:id/tasks/:taskId', c.deleteTask);

module.exports = router;
