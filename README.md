# Alluvial Diagram

A small browser app that builds an alluvial (sankey-style) diagram from a CSV file. Import your data, view the chart, and download it as SVG.

## Stack

- [D3.js](https://d3js.org/) (v7) — data parsing, scales, and SVG rendering
- [d3-sankey](https://github.com/d3/d3-sankey) — sankey layout for the flows

## Usage

1. Serve the project locally (or open `index.html` in a browser).
2. Click **Import CSV file** — the first two columns are used as source and target.
3. Click **Download SVG** to export the chart.

## Data format

The file must be a valid CSV with **two columns**: the first is the source, the second is the target. Each row is one link in the diagram; repeated pairs are counted and summed.

Example (`aliens.csv`):

```csv
Crew Member,Where they end up
Ripley,Sulaco
Ripley,Hadley's Hope
Newt,Hadley's Hope
Hicks,Colony
Bishop,Sulaco
Burke,Processing
Hudson,Hadley's Hope
Vasquez,Hadley's Hope
Drake,Hadley's Hope
Apone,Hadley's Hope
Gorman,Colony
Carter Burke,Processing
Xenomorph,Hive
Facehugger,Med Lab
Queen Alien,Hive
```

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
