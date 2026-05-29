# Alluvial Diagram

A small browser app that builds an alluvial (sankey-style) diagram from a CSV file. Import your data, view the chart, and download it as SVG.

## Stack

- [D3.js](https://d3js.org/) (v7) — data parsing, scales, and SVG rendering
- [d3-sankey](https://github.com/d3/d3-sankey) — sankey layout for the flows
- Vanilla JavaScript (ES modules)
- HTML & CSS

## Usage

1. Serve the project locally (or open `index.html` in a browser).
2. Click **Import CSV file** — the first two columns are used as source and target.
3. Click **Download SVG** to export the chart.

## Project structure

```
index.html
css/main.css
js/
  main.js        — app entry, resize handling
  alluvial.js    — chart class & rendering
  fileLoader.js  — CSV import
  exportSvg.js   — SVG download
```
