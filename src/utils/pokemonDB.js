// IndexedDB wrapper for Pokemon data caching
const DB_NAME = 'PokedexDB';
const DB_VERSION = 1;
const STORE_NAME = 'pokemon';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

class PokemonDB {
  constructor() {
    this.db = null;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('name', 'name', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Save all Pokemon list to cache
  async saveAllPokemon(pokemonList) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      const data = {
        id: 'all_pokemon_list',
        data: pokemonList,
        timestamp: Date.now()
      };

      const request = objectStore.put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all Pokemon list from cache
  async getAllPokemon() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get('all_pokemon_list');

      request.onsuccess = () => {
        const result = request.result;
        
        // Check if data exists and is not stale
        if (result && (Date.now() - result.timestamp) < CACHE_DURATION) {
          resolve(result.data);
        } else {
          resolve(null); // Cache miss or stale data
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Save individual Pokemon details
  async savePokemonDetails(pokemon) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      const data = {
        id: `pokemon_${pokemon.id}`,
        data: pokemon,
        timestamp: Date.now()
      };

      const request = objectStore.put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get individual Pokemon details from cache
  async getPokemonDetails(pokemonId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(`pokemon_${pokemonId}`);

      request.onsuccess = () => {
        const result = request.result;
        
        // Check if data exists and is not stale
        if (result && (Date.now() - result.timestamp) < CACHE_DURATION) {
          resolve(result.data);
        } else {
          resolve(null); // Cache miss or stale data
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Save batch of Pokemon details
  async savePokemonBatch(pokemonArray) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      let completed = 0;
      const total = pokemonArray.length;

      pokemonArray.forEach(pokemon => {
        const data = {
          id: `pokemon_${pokemon.id}`,
          data: pokemon,
          timestamp: Date.now()
        };

        const request = objectStore.put(data);
        
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        
        request.onerror = () => reject(request.error);
      });

      if (total === 0) resolve();
    });
  }

  // Get batch of Pokemon details from cache
  async getPokemonBatch(pokemonIds) {
    if (!this.db) await this.init();

    const results = await Promise.all(
      pokemonIds.map(id => this.getPokemonDetails(id))
    );

    return results;
  }

  // Clear stale cache entries
  async clearStaleCache() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('timestamp');
      
      const cutoffTime = Date.now() - CACHE_DURATION;
      const range = IDBKeyRange.upperBound(cutoffTime);
      
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Clear all cache
  async clearAll() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cache statistics
  async getCacheStats() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const countRequest = objectStore.count();

      countRequest.onsuccess = () => {
        resolve({
          totalEntries: countRequest.result,
          cacheAge: CACHE_DURATION,
          dbName: DB_NAME,
          storeName: STORE_NAME
        });
      };

      countRequest.onerror = () => reject(countRequest.error);
    });
  }
}

// Export singleton instance
const pokemonDB = new PokemonDB();
export default pokemonDB;

