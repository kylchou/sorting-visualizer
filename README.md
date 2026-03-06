# Sorting Visualizer

A vanilla JS/HTML/CSS tool for visualizing how sorting algorithms move
through an array, bar by bar. Made for my DSA class to actually *see* the
difference between algorithms instead of just tracing pseudocode on paper.

No build step, no dependencies -- just open `index.html` in a browser.

## Features

- **Algorithms:** Bubble Sort, Selection Sort, Insertion Sort, Merge Sort
- **Speed slider** to slow the animation down for demos or speed it up for
  bigger arrays
- **Array size slider** (10-150 elements)
- **Color legend** -- yellow bars are being compared, red bars are being
  swapped/written, blue is untouched
- **Complexity panel** that shows each algorithm's time/space complexity when
  you run it
- Responsive layout for mobile

## Project layout

```
index.html    # markup + controls
style.css     # dark theme, flex-based bars, mobile breakpoint
script.js     # array state, rendering, and the four sorting algorithms
```

Every algorithm is written as an `async` function that calls `render()` and
`await sleep(delayMs)` between steps -- that's the whole animation trick,
no animation library needed.

## License

MIT, see [LICENSE](LICENSE).
