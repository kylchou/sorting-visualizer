const barsContainer = document.getElementById('bars-container');
const newArrayBtn = document.getElementById('new-array-btn');
const bubbleSortBtn = document.getElementById('bubble-sort-btn');
const selectionSortBtn = document.getElementById('selection-sort-btn');
const insertionSortBtn = document.getElementById('insertion-sort-btn');

const controlButtons = [newArrayBtn, bubbleSortBtn, selectionSortBtn, insertionSortBtn];

let array = [];
const ARRAY_SIZE = 40;
const DELAY_MS = 20;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateArray(size = ARRAY_SIZE) {
  array = Array.from({ length: size }, () => Math.floor(Math.random() * 380) + 10);
  render();
}

function render(activeIndices = []) {
  barsContainer.innerHTML = '';
  array.forEach((value, index) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${value}px`;
    if (activeIndices.includes(index)) {
      bar.style.background = '#ff5c5c';
    }
    barsContainer.appendChild(bar);
  });
}

async function bubbleSort() {
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      render([j, j + 1]);
      await sleep(DELAY_MS);
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        render([j, j + 1]);
        await sleep(DELAY_MS);
      }
    }
  }
  render();
}

async function selectionSort() {
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      render([minIndex, j]);
      await sleep(DELAY_MS);
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      render([i, minIndex]);
      await sleep(DELAY_MS);
    }
  }
  render();
}

async function insertionSort() {
  for (let i = 1; i < array.length; i++) {
    let j = i - 1;
    const current = array[i];
    render([i]);
    await sleep(DELAY_MS);
    while (j >= 0 && array[j] > current) {
      array[j + 1] = array[j];
      render([j, j + 1]);
      await sleep(DELAY_MS);
      j--;
    }
    array[j + 1] = current;
    render([j + 1]);
    await sleep(DELAY_MS);
  }
  render();
}

function setControlsDisabled(disabled) {
  controlButtons.forEach((btn) => {
    btn.disabled = disabled;
  });
}

function attachSortHandler(button, sortFn) {
  button.addEventListener('click', async () => {
    setControlsDisabled(true);
    await sortFn();
    setControlsDisabled(false);
  });
}

newArrayBtn.addEventListener('click', () => generateArray());
attachSortHandler(bubbleSortBtn, bubbleSort);
attachSortHandler(selectionSortBtn, selectionSort);
attachSortHandler(insertionSortBtn, insertionSort);

generateArray();
