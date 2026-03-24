(function () {
  var CART_KEY = 'iconLiquid_cart';
  var CACHE_KEY = 'iconLiquid_cart_cache_v1';
  var CACHE_TTL_MS = 10 * 60 * 1000;
  var memoryCart = null;
  var memoryTs = 0;

  function cloneArray(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      return [];
    }
  }

  function normalizeCart(value) {
    if (!Array.isArray(value)) return [];
    return value;
  }

  function readLocalStorageCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      if (!raw) return [];
      return normalizeCart(JSON.parse(raw));
    } catch (e) {
      return [];
    }
  }

  function readSessionCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.cart) || typeof parsed.ts !== 'number') return null;
      if ((Date.now() - parsed.ts) > CACHE_TTL_MS) return null;
      return parsed.cart;
    } catch (e) {
      return null;
    }
  }

  function writeSessionCache(cart) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), cart: cart }));
    } catch (e) {}
  }

  function getCart() {
    if (Array.isArray(memoryCart) && (Date.now() - memoryTs) <= CACHE_TTL_MS) {
      return cloneArray(memoryCart);
    }

    var cached = readSessionCache();
    if (Array.isArray(cached)) {
      memoryCart = normalizeCart(cached);
      memoryTs = Date.now();
      return cloneArray(memoryCart);
    }

    memoryCart = readLocalStorageCart();
    memoryTs = Date.now();
    writeSessionCache(memoryCart);
    return cloneArray(memoryCart);
  }

  function setCart(nextCart) {
    memoryCart = normalizeCart(cloneArray(nextCart));
    memoryTs = Date.now();
    writeSessionCache(memoryCart);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(memoryCart));
    } catch (e) {}
  }

  function clearCart() {
    memoryCart = [];
    memoryTs = Date.now();
    try { sessionStorage.removeItem(CACHE_KEY); } catch (e) {}
    try { localStorage.removeItem(CART_KEY); } catch (e) {}
  }

  window.IconLiquidCartCache = {
    getCart: getCart,
    setCart: setCart,
    clearCart: clearCart
  };
})();
