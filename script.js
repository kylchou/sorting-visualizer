const barsContainer = document.getElementById('bars-container');
const newArrayBtn = document.getElementById('new-array-btn');
const bubbleSortBtn = document.getElementById('bubble-sort-btn');
const selectionSortBtn = document.getElementById('selection-sort-btn');
const insertionSortBtn = document.getElementById('insertion-sort-btn');
const mergeSortBtn = document.getElementById('merge-sort-btn');
const quickSortBtn = document.getElementById('quick-sort-btn');
const heapSortBtn = document.getElementById('heap-sort-btn');
const pauseBtn = document.getElementById('pause-btn');
const speedSlider = document.getElementById('speed-slider');
const sizeSlider = document.getElementById('size-slider');
const statusText = document.getElementById('status-text');

const controlButtons = [
  newArrayBtn,
  bubbleSortBtn,
  selectionSortBtn,
  insertionSortBtn,
  mergeSortBtn,
  quickSortBtn,
  heapSortBtn,
  sizeSlider,
];

// Wires up a listener only if the element actually exists. Without this, one
// missing/mismatched element (e.g. a stale cached copy of index.html served
// alongside a newer script.js) throws during setup and silently stops every
// listener after it from ever being attached -- so ALL the buttons would
// look dead, not just the one tied to the missing element.
function on(el, event, handler) {
  if (el) el.addEventListener(event, handler);
}

let array = [];
// Slider is 1 (slow) - 100 (fast); invert it into an actual delay in ms.
let delayMs = 101 - Number(speedSlider.value);

on(speedSlider, 'input', () => {
  delayMs = 101 - Number(speedSlider.value);
});

// Pausing works by having every sleep() also block on this after its timer
// fires, so a pause always lands on a clean step boundary instead of cutting
// an animation off mid-way.
let isPaused = false;
let resumeCallback = null;

function waitIfPaused() {
  if (!isPaused) return Promise.resolve();
  return new Promise((resolve) => {
    resumeCallback = resolve;
  });
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  await waitIfPaused();
}

on(pauseBtn, 'click', () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  if (!isPaused && resumeCallback) {
    const resume = resumeCallback;
    resumeCallback = null;
    resume();
  }
});

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
  if (statusText) statusText.textContent = 'Pick an algorithm to start.';
}

on(sizeSlider, 'input', () => generateArray());

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

  // Same info as the bar colors, but as text -- so this isn't only readable
  // by people who can tell yellow from red, and a screen reader (aria-live
  // on the element) actually has something to announce.
  if (statusText) {
    if (swapIndices.length) {
      statusText.textContent = `Swapping index ${swapIndices.join(' and ')}`;
    } else if (compareIndices.length) {
      statusText.textContent = `Comparing index ${compareIndices.join(' and ')}`;
    }
  }
}

// Pseudocode shown in the code panel for each algorithm, plus which line
// number corresponds to each step so the sort functions below can highlight
// the line that matches what's currently animating in the bars.
const ALGORITHM_CODE = {
  Bubble: [
    'for i in range(n - 1):',
    '    for j in range(n - i - 1):',
    '        if arr[j] > arr[j + 1]:',
    '            swap(arr[j], arr[j + 1])',
  ],
  Selection: [
    'for i in range(n - 1):',
    '    min_index = i',
    '    for j in range(i + 1, n):',
    '        if arr[j] < arr[min_index]:',
    '            min_index = j',
    '    if min_index != i:',
    '        swap(arr[i], arr[min_index])',
  ],
  Insertion: [
    'for i in range(1, n):',
    '    current = arr[i]',
    '    j = i - 1',
    '    while j >= 0 and arr[j] > current:',
    '        arr[j + 1] = arr[j]',
    '        j -= 1',
    '    arr[j + 1] = current',
  ],
  Merge: [
    'function merge(start, mid, end):',
    '    left = arr[start:mid]',
    '    right = arr[mid:end]',
    '    i = j = 0',
    '    for k in range(start, end):',
    '        if left[i] <= right[j]:',
    '            arr[k] = left[i]; i += 1',
    '        else:',
    '            arr[k] = right[j]; j += 1',
  ],
  Quick: [
    'function partition(low, high):',
    '    pivot = arr[high]',
    '    i = low - 1',
    '    for j in range(low, high):',
    '        if arr[j] < pivot:',
    '            i += 1',
    '            swap(arr[i], arr[j])',
    '    swap(arr[i + 1], arr[high])',
    '    return i + 1',
  ],
  Heap: [
    'function heapify(n, i):',
    '    largest = i',
    '    left, right = 2i + 1, 2i + 2',
    '    if left < n and arr[left] > arr[largest]:',
    '        largest = left',
    '    if right < n and arr[right] > arr[largest]:',
    '        largest = right',
    '    if largest != i:',
    '        swap(arr[i], arr[largest])',
    '        heapify(n, largest)',
    '',
    'for i in range(n - 1, 0, -1):',
    '    swap(arr[0], arr[i])',
    '    heapify(i, 0)',
  ],
};

const codeView = document.getElementById('code-view');

function renderCode(label) {
  if (!codeView) return;
  codeView.textContent = '';
  ALGORITHM_CODE[label].forEach((line, index) => {
    const span = document.createElement('span');
    span.className = 'code-line';
    span.dataset.line = String(index);
    span.textContent = line;
    codeView.appendChild(span);
    codeView.appendChild(document.createTextNode('\n'));
  });
}

// type is 'compare' (yellow, matches the bar highlight) or 'swap' (red).
// Pass line = -1 to clear the highlight once a sort finishes.
function highlightLine(line, type) {
  if (!codeView) return;
  codeView.querySelectorAll('.code-line').forEach((el) => {
    const isActive = Number(el.dataset.line) === line;
    el.classList.toggle('active-compare', isActive && type === 'compare');
    el.classList.toggle('active-swap', isActive && type === 'swap');
  });
}

async function bubbleSort() {
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      highlightLine(2, 'compare');
      render([j, j + 1]);
      await sleep(delayMs);
      if (array[j] > array[j + 1]) {
        highlightLine(3, 'swap');
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        render([], [j, j + 1]);
        await sleep(delayMs);
      }
    }
  }
  highlightLine(-1);
  render();
}

async function selectionSort() {
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      highlightLine(3, 'compare');
      render([minIndex, j]);
      await sleep(delayMs);
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      highlightLine(6, 'swap');
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      render([], [i, minIndex]);
      await sleep(delayMs);
    }
  }
  highlightLine(-1);
  render();
}

async function insertionSort() {
  for (let i = 1; i < array.length; i++) {
    let j = i - 1;
    const current = array[i];
    render([i]);
    await sleep(delayMs);
    while (j >= 0) {
      highlightLine(3, 'compare');
      render([j]);
      await sleep(delayMs);
      if (array[j] <= current) break;
      highlightLine(4, 'swap');
      array[j + 1] = array[j];
      render([], [j, j + 1]);
      await sleep(delayMs);
      j--;
    }
    highlightLine(6, 'swap');
    array[j + 1] = current;
    render([], [j + 1]);
    await sleep(delayMs);
  }
  highlightLine(-1);
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
    highlightLine(5, 'compare');
    render([k]);
    await sleep(delayMs);
    if (left[i] <= right[j]) {
      highlightLine(6, 'swap');
      array[k] = left[i++];
    } else {
      highlightLine(8, 'swap');
      array[k] = right[j++];
    }
    render([], [k]);
    await sleep(delayMs);
    k++;
  }
  while (i < left.length) {
    highlightLine(6, 'swap');
    array[k] = left[i++];
    render([], [k]);
    await sleep(delayMs);
    k++;
  }
  while (j < right.length) {
    highlightLine(8, 'swap');
    array[k] = right[j++];
    render([], [k]);
    await sleep(delayMs);
    k++;
  }
}

async function mergeSort() {
  await mergeSortRange(0, array.length);
  highlightLine(-1);
  render();
}

// Lomuto partition -- pivot is always the last element of the range.
async function partition(low, high) {
  const pivot = array[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    highlightLine(4, 'compare');
    render([j, high]);
    await sleep(delayMs);
    if (array[j] < pivot) {
      i++;
      highlightLine(6, 'swap');
      [array[i], array[j]] = [array[j], array[i]];
      render([], [i, j]);
      await sleep(delayMs);
    }
  }

  highlightLine(7, 'swap');
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  render([], [i + 1, high]);
  await sleep(delayMs);
  return i + 1;
}

async function quickSortRange(low, high) {
  if (low >= high) return;
  const pivotIndex = await partition(low, high);
  await quickSortRange(low, pivotIndex - 1);
  await quickSortRange(pivotIndex + 1, high);
}

async function quickSort() {
  await quickSortRange(0, array.length - 1);
  highlightLine(-1);
  render();
}

// Sift `i` down into a max-heap of size `n`.
async function heapify(n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  highlightLine(2, 'compare');
  render([i, left, right].filter((index) => index < n));
  await sleep(delayMs);

  if (left < n && array[left] > array[largest]) largest = left;
  if (right < n && array[right] > array[largest]) largest = right;

  if (largest !== i) {
    highlightLine(8, 'swap');
    [array[i], array[largest]] = [array[largest], array[i]];
    render([], [i, largest]);
    await sleep(delayMs);
    await heapify(n, largest);
  }
}

async function heapSort() {
  const n = array.length;
  // Build the max-heap first, then repeatedly pull the max to the end.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    highlightLine(12, 'swap');
    [array[0], array[i]] = [array[i], array[0]];
    render([], [0, i]);
    await sleep(delayMs);
    await heapify(i, 0);
  }
  highlightLine(-1);
  render();
}

// Sweeps a green highlight from the first bar to the last once a sort
// finishes, like most other sorting visualizers do for the "done" moment.
async function runSortedWave() {
  const totalDurationMs = 700;
  const perBar = Math.max(totalDurationMs / array.length, 4);
  for (let i = 0; i < array.length; i++) {
    barElements[i].style.background = '#4dff88';
    await sleep(perBar);
  }
}

function setControlsDisabled(disabled) {
  controlButtons.forEach((btn) => {
    if (btn) btn.disabled = disabled;
  });
}

const complexityInfo = document.getElementById('complexity-info');
const COMPLEXITY = {
  Bubble: 'Bubble Sort -- Time: O(n^2) average/worst, O(n) best (already sorted). Space: O(1).',
  Selection: 'Selection Sort -- Time: O(n^2) in every case. Space: O(1).',
  Insertion: 'Insertion Sort -- Time: O(n^2) average/worst, O(n) best. Space: O(1).',
  Merge: 'Merge Sort -- Time: O(n log n) in every case. Space: O(n) for the temporary left/right arrays.',
  Quick: 'Quick Sort -- Time: O(n log n) average, O(n^2) worst (bad pivot choice, e.g. already-sorted input). Space: O(log n) for the recursion stack.',
  Heap: 'Heap Sort -- Time: O(n log n) in every case. Space: O(1), sorts in place.',
};

function attachSortHandler(button, sortFn, label) {
  on(button, 'click', async () => {
    complexityInfo.textContent = COMPLEXITY[label];
    renderCode(label);
    setControlsDisabled(true);
    isPaused = false;
    if (pauseBtn) {
      pauseBtn.textContent = 'Pause';
      pauseBtn.disabled = false;
    }

    await sortFn();

    if (pauseBtn) pauseBtn.disabled = true;
    await runSortedWave();
    if (statusText) statusText.textContent = 'Sorted!';
    setControlsDisabled(false);
  });
}

on(newArrayBtn, 'click', () => generateArray());
attachSortHandler(bubbleSortBtn, bubbleSort, 'Bubble');
attachSortHandler(selectionSortBtn, selectionSort, 'Selection');
attachSortHandler(insertionSortBtn, insertionSort, 'Insertion');
attachSortHandler(mergeSortBtn, mergeSort, 'Merge');
attachSortHandler(quickSortBtn, quickSort, 'Quick');
attachSortHandler(heapSortBtn, heapSort, 'Heap');

generateArray();
