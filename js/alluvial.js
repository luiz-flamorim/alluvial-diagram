// js/alluvial.js
export class Alluvial {
  constructor(sourceKey, targetKey, data) {
    this.sourceKey = sourceKey;
    this.targetKey = targetKey;
    this.data = data;

    this.links = [];
    this.nodes = [];
    this.graph = null;

    // layout
    this.sidePadding = 0; // minimum (will be auto-expanded from labels)
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    if (typeof this.margin === "number") {
      this.margin = {
        top: this.margin,
        right: this.margin,
        bottom: this.margin,
        left: this.margin,
      };
    }

    // sankey
    this.nodeWidth = 5;
    this.nodePadding = 3;
    this.equalSourceThickness = false;

    // styling
    this.labelFontSize = 5;
    this.labelInset = this.nodeWidth + 5;
    this.linkOpacity = 0.4;
    this.nodeOpacity = 0.6;
    this.linkWidthFactor = 0.98;

    // svg
    this.preserveAspectRatio = "xMidYMid meet";
  }

  buildLinks() {
    const map = new Map();

    this.data.forEach((d) => {
      const source = d[this.sourceKey];
      const target = d[this.targetKey];
      const key = `${source}|||${target}`;

      if (!map.has(key)) map.set(key, { source, target, value: 0 });
      map.get(key).value += 1;
    });

    this.links = Array.from(map.values());
    return this.links;
  }

  buildNodes() {
    const set = new Set();
    this.links.forEach((l) => {
      set.add(l.source);
      set.add(l.target);
    });
    this.nodes = Array.from(set).map((name) => ({ name }));
    return this.nodes;
  }

  build() {
    this.buildLinks();
    this.buildNodes();
    this.graph = { nodes: this.nodes, links: this.links };
    return this.graph;
  }

  toAlluvial({ equalSourceThickness = this.equalSourceThickness } = {}) {
    const targetCategories = [...new Set(this.links.map((d) => d.target))];

    const targetNodes = targetCategories.map((t) => ({
      id: `tgt|||${t}`,
      display: t,
      side: "target",
      targetCategory: t,
    }));

    const sourceNodes = this.links.map((l) => ({
      id: `src|||${l.source}|||${l.target}`,
      display: l.source,
      side: "source",
      targetCategory: l.target,
      ...(equalSourceThickness ? { fixedValue: 1 } : {}),
    }));

    const nodes = [...sourceNodes, ...targetNodes];

    const links = this.links.map((l) => ({
      source: `src|||${l.source}|||${l.target}`,
      target: `tgt|||${l.target}`,
      value: l.value,
      targetCategory: l.target,
    }));

    return { nodes, links, targetCategories };
  }

  render(container) {
    // ensure data is ready
    if (!this.links.length) this.build();

    const root = d3.select(container);
    const el = root.node();

    // container-driven sizing (CSS controls it)
    const bounds = el.getBoundingClientRect();
    const width = Math.max(1, bounds.width || 960);
    const height = Math.max(1, bounds.height || 600);

    // build node/link objects (split sources, unique targets)
    const { nodes, links, targetCategories } = this.toAlluvial({
      equalSourceThickness: this.equalSourceThickness,
    });

    // dynamic palette
    const palette =
      targetCategories.length <= 10
        ? d3.schemeCategory10
        : d3.quantize(d3.interpolateRainbow, targetCategories.length);

    const color = d3.scaleOrdinal().domain(targetCategories).range(palette);

    // ---- dynamic side padding (MUST be computed BEFORE layout + translate) ----
    const maxLabelLength =
      d3.max(nodes, (d) => (d.display ? d.display.length : 0)) || 0;
    const approxCharWidth = this.labelFontSize * 0.6;
    const dynamicPadding =
      maxLabelLength * approxCharWidth + this.labelInset + 20;

    // clamp so it can't eat the whole canvas
    const sidePadding = Math.min(
      width * 0.35,
      Math.max(this.sidePadding, dynamicPadding),
    );

    // clear and build responsive svg
    root.selectAll("*").remove();

    const svg = root
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", this.preserveAspectRatio)
      .style("width", "100%")
      .style("height", "100%");

    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${this.margin.left + sidePadding},${this.margin.top})`,
      );

    // available layout size (uses computed sidePadding)
    const innerW = Math.max(
      1,
      width - this.margin.left - this.margin.right - sidePadding * 2,
    );
    const innerH = Math.max(1, height - this.margin.top - this.margin.bottom);

    // sankey layout
    const sankey = d3
      .sankey()
      .nodeId((d) => d.id)
      .nodeWidth(this.nodeWidth)
      .nodePadding(this.nodePadding)
      .nodeSort((a, b) => d3.ascending(a.id, b.id))
      .extent([
        [0, 0],
        [innerW, innerH],
      ]);

    const sankeyGraph = sankey({
      nodes: nodes.map((d) => ({ ...d })),
      links: links.map((d) => ({ ...d })),
    });

    // links
    g.append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", this.linkOpacity)
      .selectAll("path")
      .data(sankeyGraph.links)
      .join("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", (d) => color(d.targetCategory))
      .attr("stroke-width", (d) => Math.max(1, d.width * this.linkWidthFactor));

    // nodes
    const node = g.append("g").selectAll("g").data(sankeyGraph.nodes).join("g");

    node
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) =>color(d.targetCategory),
      )
      .attr("fill-opacity", this.nodeOpacity)

    // labels (inside, mirrored)
    node
      .append("text")
      .attr("x", (d) =>
        d.side === "source" ? d.x1 - this.labelInset : d.x0 + this.labelInset,
      )
      .attr("text-anchor", (d) => (d.side === "source" ? "end" : "start"))
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("font-size", this.labelFontSize)
      .text((d) => d.display);
  }
}
