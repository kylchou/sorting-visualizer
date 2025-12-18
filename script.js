const barsContainer = document.getElementById('bars-container');
const newArrayBtn = document.getElementById('new-array-btn');
const bubbleSortBtn = document.getElementById('bubble-sort-btn');
const selectionSortBtn = document.getElementById('selection-sort-btn');
const insertionSortBtn = document.getElementById('insertion-sort-btn');
const mergeSortBtn = document.getElementById('merge-sort-btn');
const speedSlider = document.getElementById('speed-slider');
const sizeSlider = document.getElementById('size-slider');

const controlButtons = [newArrayBtn, bubbleSortBtn, selectionSortBtn, insertionSortBtn, mergeSortBtn, sizeSlider];

let array = [];
// Slider is 1 (slow) - 100 (fast); invert it into an actual delay in ms.
let delayMs = 101 - Number(speedSlider.value);

speedSlider.addEventListener('input', () => {
  delayMs = 101 - Number(speedSlider.value);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateArray(size = Number(sizeSlider.value)) {
  array = Array.from({ length: size }, () => Math.floor(Math.random() * 380) + 10);
  render();
}

sizeSlider.addEventListener('input', () => generateArray());

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
      await sleep(delayMs);
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        render([j, j + 1]);
        await sleep(delayMs);
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
      await sleep(delayMs);
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      render([i, minIndex]);
      await sleep(delayMs);
    }
  }
  render();
}

async function insertionSort() {
  for (let i = 1; i < array.length; i++) {
    let j = i - 1;
    const current = array[i];
    render([i]);
    await sleep(delayMs);
    while (j >= 0 && array[j] > current) {
      array[j + 1] = array[j];
      render([j, j + 1]);
      await sleep(delayMs);
      j--;
    }
    array[j + 1] = current;
    render([j + 1]);
    await sleep(delayMs);
  }
  render();
}

// Merge sort mutates `array` in place (writing merged runs back into it) so
// it can reuse the same render() as every other algorithm here.
async function mergeSortRange(start, end) {
  if (end - start <= 1) return;
  const mid = Math.floor((start + end) / 2);
  await mergeSortRange(start, mid);
  await mergeSortRange(mid, end);
  await merge(start, mid, end);
}

async function merge(start, mid, end) {
  const left = array.slice(start, mid);
  const right = array.slice(mid, end);
  let i = 0;
  let j = 0;
  let k = start;

  while (i < left.length && j < right.length) {
    render([k]);
    await sleep(delayMs);
    if (left[i] <= right[j]) {
      array[k] = left[i++];
    } else {
      array[k] = right[j++];
    }
    render([k]);
    await sleep(delayMs);
    k++;
  }
  while (i < left.length) {
    array[k] = left[i++];
    render([k]);
    await sleep(delayMs);
    k++;
  }
  while (j < right.length) {
    array[k] = right[j++];
    render([k]);
    await sleep(delayMs);
    k++;
  }
}

async function mergeSort() {
  await mergeSortRange(0, array.length);
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
attachSortHandler(mergeSortBtn, mergeSort);

generateArray();
