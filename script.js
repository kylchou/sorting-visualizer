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

// One persistent <div> per bar, reused across renders. Rebuilding every bar
// from scratch on every frame (like we used to) meant a swap just popped to
// its new height instantly -- keeping the same element and only changing its
// height/color lets the CSS transition actually animate the swap.
let barElements = [];

function createBars() {
  barsContainer.innerHTML = '';
  barElements = array.map((value) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${value}px`;
    barsContainer.appendChild(bar);
    return bar;
  });
}

function generateArray(size = Number(sizeSlider.value)) {
  array = Array.from({ length: size }, () => Math.floor(Math.random() * 380) + 10);
  createBars();
}

sizeSlider.addEventListener('input', () => generateArray());

// compareIndices = bars currently being looked at (yellow)
// swapIndices = bars that just moved (red)
function render(compareIndices = [], swapIndices = []) {
  array.forEach((value, index) => {
    const bar = barElements[index];
    bar.style.height = `${value}px`;
    if (swapIndices.includes(index)) {
      bar.style.background = '#ff5c5c';
    } else if (compareIndices.includes(index)) {
      bar.style.background = '#ffd23f';
    } else {
      bar.style.background = '';
    }
  });
}

async function bubbleSort() {
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      render([j, j + 1]);
      await sleep(delayMs);
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        render([], [j, j + 1]);
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
      render([], [i, minIndex]);
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
      render([], [j, j + 1]);
      await sleep(delayMs);
      j--;
    }
    array[j + 1] = current;
    render([], [j + 1]);
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
    render([], [k]);
    await sleep(delayMs);
    k++;
  }
  while (i < left.length) {
    array[k] = left[i++];
    render([], [k]);
    await sleep(delayMs);
    k++;
  }
  while (j < right.length) {
    array[k] = right[j++];
    render([], [k]);
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

const complexityInfo = document.getElementById('complexity-info');
const COMPLEXITY = {
  Bubble: 'Bubble Sort -- Time: O(n^2) average/worst, O(n) best (already sorted). Space: O(1).',
  Selection: 'Selection Sort -- Time: O(n^2) in every case. Space: O(1).',
  Insertion: 'Insertion Sort -- Time: O(n^2) average/worst, O(n) best. Space: O(1).',
  Merge: 'Merge Sort -- Time: O(n log n) in every case. Space: O(n) for the temporary left/right arrays.',
};

function attachSortHandler(button, sortFn, label) {
  button.addEventListener('click', async () => {
    complexityInfo.textContent = COMPLEXITY[label];
    setControlsDisabled(true);
    await sortFn();
    setControlsDisabled(false);
  });
}

newArrayBtn.addEventListener('click', () => generateArray());
attachSortHandler(bubbleSortBtn, bubbleSort, 'Bubble');
attachSortHandler(selectionSortBtn, selectionSort, 'Selection');
attachSortHandler(insertionSortBtn, insertionSort, 'Insertion');
attachSortHandler(mergeSortBtn, mergeSort, 'Merge');

generateArray();
