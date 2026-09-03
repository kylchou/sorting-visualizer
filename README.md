# Sorting Visualizer

Made this for my DSA class because tracing sort algorithms on paper wasn't
really clicking for me -- I wanted to actually watch the bars move around.

No installs, no build step. Just open `index.html`.

Right now it does Bubble, Selection, Insertion, and Merge sort. There's a
slider for speed and one for how many bars to show, plus a little legend so
you can tell yellow (comparing) apart from red (actually swapping/writing).
It also shows the time/space complexity for whichever algorithm you just
ran, which was mostly for my own studying.

It's all vanilla JS -- every sort is just an `async` function that calls
`render()` and waits a bit between each compare/swap. That's the entire
"animation," no library needed.

## Files

- `index.html` -- markup and controls
- `style.css` -- dark theme + the mobile breakpoint
- `script.js` -- the array state, rendering, and the actual algorithms

MIT licensed, do whatever you want with it.
