const barsContainer = document.getElementById('bars-container');
const newArrayBtn = document.getElementById('new-array-btn');
const bubbleSortBtn = document.getElementById('bubble-sort-btn');

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

newArrayBtn.addEventListener('click', () => generateArray());
bubbleSortBtn.addEventListener('click', async () => {
  bubbleSortBtn.disabled = true;
  newArrayBtn.disabled = true;
  await bubbleSort();
  bubbleSortBtn.disabled = false;
  newArrayBtn.disabled = false;
});

generateArray();
