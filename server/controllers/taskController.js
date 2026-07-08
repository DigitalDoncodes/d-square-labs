const Task = require('../models/Task');

exports.listTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.subject) filter.subject = req.query.subject;
    const tasks = await Task.find(filter)
      .populate('createdBy', 'name')
      .populate('assignee', 'name')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, type, subject, dueDate, description, assignToSelf } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }
    const task = await Task.create({
      title,
      type,
      subject,
      dueDate,
      description,
      assignee: assignToSelf ? req.user.userId : null,
      createdBy: req.user.userId,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const canModify = (task, userId) =>
  task.createdBy.equals(userId) || (task.assignee && task.assignee.equals(userId));

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!canModify(task, req.user.userId)) {
      return res.status(403).json({ message: 'Only the creator or assignee can edit this task' });
    }
    const { title, type, subject, dueDate, description, status } = req.body;
    const updates = { title, type, subject, dueDate, description, status };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) task[key] = value;
    }
    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!canModify(task, req.user.userId)) {
      return res.status(403).json({ message: 'Only the creator or assignee can delete this task' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
