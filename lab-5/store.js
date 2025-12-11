// store.js
import { getRandomPastelColor } from './helpers.js';

const STORAGE_KEY = 'shapes-app-state-v1';

class Store {
  constructor() {
    this.subscribers = [];

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.shapes) && typeof parsed.nextId === 'number') {
          this.state = parsed;
        } else {
          this.state = this.getEmptyState();
        }
      } catch (e) {
        console.warn('Błędny stan w localStorage, resetuję.', e);
        this.state = this.getEmptyState();
      }
    } else {
      this.state = this.getEmptyState();
    }
  }

  getEmptyState() {
    return {
      shapes: [], // { id, type: 'square' | 'circle', color }
      nextId: 1,
    };
  }

  getState() {
    return this.state;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.state, { type: 'init' });
  }

  notify(change) {
    this.saveToLocalStorage();
    for (const cb of this.subscribers) {
      cb(this.state, change);
    }
  }

  saveToLocalStorage() {
    try {
      const json = JSON.stringify(this.state);
      window.localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
      console.warn('Nie udało się zapisać stanu do localStorage', e);
    }
  }

  // --- akcje na stanie ---

  addShape(type) {
    if (type !== 'square' && type !== 'circle') {
      throw new Error(`Niepoprawny typ kształtu: ${type}`);
    }

    const newShape = {
      id: this.state.nextId++,
      type,
      color: getRandomPastelColor(),
    };

    this.state.shapes.push(newShape);
    this.notify({ type: 'add', shape: newShape });
  }

  removeShape(id) {
    const idx = this.state.shapes.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const [removed] = this.state.shapes.splice(idx, 1);
    this.notify({ type: 'remove', shape: removed });
  }

  recolorByType(type) {
    if (type !== 'square' && type !== 'circle') return;

    let changed = false;
    for (const s of this.state.shapes) {
      if (s.type === type) {
        s.color = getRandomPastelColor();
        changed = true;
      }
    }
    if (changed) {
      this.notify({ type: 'recolor', shapeType: type });
    }
  }
}

export const store = new Store();
