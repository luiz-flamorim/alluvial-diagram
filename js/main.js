import { Alluvial } from "./alluvial.js";
import { exportSVG } from "./exportSvg.js";
import { setupFileLoader } from "./fileLoader.js";

// match label titles accordingly to the reevant headers
// let source = "Label";
// let target = "Service";

let chart = null;
let currentData = null;
let container = document.querySelector("#chart");

setupFileLoader((data) => {
  currentData = data;
  buildChart();
});

document.querySelector("#exportBtn").addEventListener("click", () => {
  exportSVG("#chart", "alluvial.svg");
});

window.addEventListener("resize", () => {
  if (chart && currentData) {
    chart.render("#chart");
  }
});

function buildChart() {
  if (!currentData) return;

  let columns = Object.keys(currentData[0]);
  let source = columns[0];
  let target = columns[1];

  currentData.sort((a, b) => d3.ascending(a[source], b[source]));

  chart = new Alluvial(source, target, currentData);
  chart.build();
  chart.render("#chart");
}