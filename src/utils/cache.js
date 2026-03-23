const cache = new Map();

const set = (key, value, ttl = 300000) => { // Default 5 mins
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
};

const get = (key) => {
  const data = cache.get(key);
  if (!data) return null;
  if (Date.now() > data.expiry) {
    cache.delete(key);
    return null;
  }
  return data.value;
};

const del = (key) => cache.delete(key);

const clear = () => cache.clear();

module.exports = { set, get, del, clear };
