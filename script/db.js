let db;
let dbReady = false;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("menuAppDB", 1);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      dbReady = true;
      console.log("DB loaded successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains("menus")) {
        const store = db.createObjectStore("menus", { keyPath: "id" });
        store.createIndex("date", "date", { unique: false });
        store.createIndex("type", "type", { unique: false });
      }
    };
  });
}

function waitForDB() {
  return new Promise((resolve, reject) => {
    if (dbReady) {
      resolve(db);
    } else {
      const checkDB = setInterval(() => {
        if (dbReady) {
          clearInterval(checkDB);
          resolve(db);
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkDB);
        reject(new Error("Database initialization timeout"));
      }, 5000);
    }
  });
}

// Save or update a menu
export function saveMenu(menu) {
  return waitForDB().then(() => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("menus", "readwrite");
      const store = tx.objectStore("menus");
      const req = store.put(menu);

      req.onsuccess = () => {
        console.log("✅ Menu saved:", menu);
        resolve(true);
      };
      req.onerror = () => {
        console.error("❌ Error saving menu:", req.error);
        reject(req.error);
      };
    });
  });
}

// Load a menu by ID
export function getMenu(id) {
  return waitForDB().then(() => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("menus", "readonly");
      const store = tx.objectStore("menus");
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

// Delete a menu by ID
export function deleteMenu(id) {
  return waitForDB().then(() => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("menus", "readwrite");
      const store = tx.objectStore("menus");
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  });
}

// Get all saved menus (for menu dashboard view)
export function getAllMenus() {
  return waitForDB().then(() => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("menus", "readonly");
      const store = tx.objectStore("menus");
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}
