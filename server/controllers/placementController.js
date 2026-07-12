const PlacementDrive = require('../models/PlacementDrive');
const PlacementApplication = require('../models/PlacementApplication');

exports.listDrives = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const drives = await PlacementDrive.find(filter)
      .populate('createdBy', 'name')
      .sort({ applicationDeadline: 1, createdAt: -1 });
    res.json(drives);
  } catch (err) { next(err); }
};

exports.createDrive = async (req, res, next) => {
  try {
    const { name, company, role, package: pkg, eligibility, applicationDeadline, rounds, applyLink, notes } = req.body;
    if (!name || !company) return res.status(400).json({ message: 'Name and company are required' });
    const drive = await PlacementDrive.create({
      name, company, role, package: pkg, eligibility, applicationDeadline, rounds, applyLink, notes,
      createdBy: req.user.userId,
    });
    res.status(201).json(drive);
  } catch (err) { next(err); }
};

exports.updateDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    if (!drive.createdBy.equals(req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' });
    }
    const fields = ['name', 'company', 'role', 'eligibility', 'applicationDeadline', 'rounds', 'status', 'applyLink', 'notes'];
    fields.forEach((f) => { if (req.body[f] !== undefined) drive[f] = req.body[f]; });
    if (req.body.package !== undefined) drive.package = req.body.package;
    await drive.save();
    res.json(drive);
  } catch (err) { next(err); }
};

exports.deleteDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    if (!drive.createdBy.equals(req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' });
    }
    await drive.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.applyToDrive = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const app = await PlacementApplication.findOneAndUpdate(
      { drive: req.params.id, user: req.user.userId },
      { status: status || 'applied', notes },
      { upsert: true, new: true }
    );
    res.json(app);
  } catch (err) { next(err); }
};

exports.listMyApplications = async (req, res, next) => {
  try {
    const apps = await PlacementApplication.find({ user: req.user.userId })
      .populate({ path: 'drive', populate: { path: 'createdBy', select: 'name' } })
      .sort({ updatedAt: -1 });
    res.json(apps);
  } catch (err) { next(err); }
};

exports.updateMyApplication = async (req, res, next) => {
  try {
    const app = await PlacementApplication.findOne({ _id: req.params.appId, user: req.user.userId });
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (req.body.status) app.status = req.body.status;
    if (req.body.notes !== undefined) app.notes = req.body.notes;
    await app.save();
    res.json(app);
  } catch (err) { next(err); }
};
