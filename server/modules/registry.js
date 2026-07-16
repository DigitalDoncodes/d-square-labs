const modules = new Map();

class Module {
  constructor({ slug, name, version, description, features, routes, defaults }) {
    this.slug = slug;
    this.name = name;
    this.version = version || '1.0.0';
    this.description = description || '';
    this.features = features || {};
    this.routes = routes || null;
    this.defaults = defaults || {};
    this._booted = false;
  }

  boot() {
    if (this._booted) return;
    this._booted = true;
  }
}

function register(slug, descriptor) {
  if (modules.has(slug)) throw new Error(`Module "${slug}" is already registered`);
  const mod = new Module({ slug, ...descriptor });
  modules.set(slug, mod);
  return mod;
}

function get(slug) {
  return modules.get(slug) || null;
}

function getAll() {
  return Array.from(modules.values());
}

function bootAll() {
  for (const mod of modules.values()) mod.boot();
}

module.exports = { Module, register, get, getAll, bootAll };
