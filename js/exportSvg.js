export function exportSVG(containerSelector, fileName = "thanks_luiz.svg") {

  const svgNode = d3.select(containerSelector).select("svg").node();

  if (!svgNode) {
    console.error("No SVG found in container");
    return;
  }

  const clone = svgNode.cloneNode(true);

  const viewBox = svgNode.getAttribute("viewBox");
  if (viewBox) {
    const [ , , width, height ] = viewBox.split(" ");
    clone.setAttribute("width", width);
    clone.setAttribute("height", height);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  // Serialize SVG
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);

  // Create file
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  // Download
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}