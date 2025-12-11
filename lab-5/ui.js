// ui.js
import { store } from './store.js';

const DATA_ATTR_NAME = 'shape-id'; // atrybut w DOM: data-shape-id

function qs(selector) {
  return document.querySelector(selector);
}

function getShapeCssClass(type) {
  return type === 'circle' ? 'circle' : 'square';
}

// tworzy element DOM z obiektu kształtu
function createShapeElement(shape) {
  const el = document.createElement('div');
  el.classList.add('shape', getShapeCssClass(shape.type));
  // ustawiamy atrybut data-shape-id
  el.dataset.shapeId = String(shape.id);
  // na wszelki wypadek jawny atrybut
  el.setAttribute(`data-${DATA_ATTR_NAME}`, String(shape.id));
  el.style.backgroundColor = shape.color;
  return el;
}

function renderAllShapes(boardEl, shapes) {
  boardEl.innerHTML = '';
  for (const shape of shapes) {
    const el = createShapeElement(shape);
    boardEl.appendChild(el);
  }
}

function renderSingleShape(boardEl, shape) {
  const el = createShapeElement(shape);
  boardEl.appendChild(el);
}

function removeShapeElement(boardEl, shapeId) {
  const selector = `[data-${DATA_ATTR_NAME}="${shapeId}"]`;
  const el = boardEl.querySelector(selector);
  if (el) {
    el.remove();
  }
}

function updateCounters(state, cntSquaresEl, cntCirclesEl) {
  const squares = state.shapes.filter((s) => s.type === 'square').length;
  const circles = state.shapes.filter((s) => s.type === 'circle').length;
  cntSquaresEl.textContent = String(squares);
  cntCirclesEl.textContent = String(circles);
}

function applyColorsFromStateToDom(boardEl, state, type) {
  const shapesOfType = state.shapes.filter((s) => s.type === type);
  for (const shape of shapesOfType) {
    const selector = `[data-${DATA_ATTR_NAME}="${shape.id}"]`;
    const el = boardEl.querySelector(selector);
    if (el) {
      el.style.backgroundColor = shape.color;
    }
  }
}

export function initUI() {
  const addSquareBtn = qs('#addSquare');
  const addCircleBtn = qs('#addCircle');
  const recolorSquaresBtn = qs('#recolorSquares');
  const recolorCirclesBtn = qs('#recolorCircles');
  const cntSquaresEl = qs('#cntSquares');
  const cntCirclesEl = qs('#cntCircles');
  const boardEl = qs('#board');

  if (
    !addSquareBtn ||
    !addCircleBtn ||
    !recolorSquaresBtn ||
    !recolorCirclesBtn ||
    !cntSquaresEl ||
    !cntCirclesEl ||
    !boardEl
  ) {
    console.error('Brak któregoś z elementów UI – sprawdź index.html');
    return;
  }

  // --- przyciski ---

  addSquareBtn.addEventListener('click', () => {
    store.addShape('square');
  });

  addCircleBtn.addEventListener('click', () => {
    store.addShape('circle');
  });

  recolorSquaresBtn.addEventListener('click', () => {
    store.recolorByType('square');
  });

  recolorCirclesBtn.addEventListener('click', () => {
    store.recolorByType('circle');
  });

  // --- delegacja zdarzeń na board ---

  boardEl.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const shapeEl = target.closest('.shape');
    if (!shapeEl) return;

    const idStr = shapeEl.dataset.shapeId;
    if (!idStr) return;

    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) return;

    store.removeShape(id);
  });

  // --- subskrypcja stanu ---

  store.subscribe((state, change) => {
    updateCounters(state, cntSquaresEl, cntCirclesEl);

    switch (change.type) {
      case 'init':
        renderAllShapes(boardEl, state.shapes);
        break;
      case 'add':
        if (change.shape) {
          renderSingleShape(boardEl, change.shape);
        }
        break;
      case 'remove':
        if (change.shape) {
          removeShapeElement(boardEl, change.shape.id);
        }
        break;
      case 'recolor':
        if (change.shapeType) {
          applyColorsFromStateToDom(boardEl, state, change.shapeType);
        }
        break;
      default:
        break;
    }
  });
}
