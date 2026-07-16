const { get } = require('../modules/registry');

async function moduleContext(req, res, next) {
  const slug = req.headers['x-program'] || req.query.program || req.user?.activeProgram || 'mba';
  const mod = get(slug);
  req.module = mod || get('mba');
  req.moduleSlug = req.module.slug;
  next();
}

module.exports = moduleContext;
