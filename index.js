
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function point(x, y, thickness=5) {
  ctx.fillRect(x-thickness/2, y-thickness/2, thickness, thickness);
}

function text(content, x, y) {
  ctx.font = "12px sans-serif";
  ctx.fillText(content, x, y);
}

function sortXY(x, y) {
  if (x.length !== y.length) {
    throw new Error("Arrays x and y must have the same length");
  }

  let pairs = x.map((value, index) => [value, y[index]]);

  pairs.sort((a, b) => a[0] - b[0]);

  let new_xs = pairs.map(pair => pair[0]);
  let new_ys = pairs.map(pair => pair[1]);

  return { new_xs, new_ys };
}

class Graph {
  constructor(xs, ys, offset=1) {
    let sorted = sortXY(xs, ys);
    this.xs = sorted.new_xs;
    this.ys = sorted.new_ys;
    this.offset = offset;
    this.xrange = {
      min: Math.min(...xs)-offset,
      max: Math.max(...xs)+offset,
      range: Math.max(...xs)-Math.min(...xs)+2*offset,
    };
    this.yrange = {
      min: Math.min(...ys)-offset,
      max: Math.max(...ys)+offset,
      range: Math.max(...ys)-Math.min(...ys)+2*offset
    };
  }

  toCanvasX(graph_x) {
    let offset = 5;
    return (graph_x - this.xrange.min) / this.xrange.range * (canvas.width - offset*2) + offset;
  }

  toCanvasY(graph_y) {
    let offset = 5;
    return canvas.height - ((graph_y - this.yrange.min) / this.yrange.range * (canvas.height - offset*2) + offset);
  }

  lineToCanvas(x1, y1, x2, y2) {
    line(this.toCanvasX(x1), this.toCanvasY(y1), this.toCanvasX(x2), this.toCanvasY(y2));
  }

  drawAxes() {
    this.lineToCanvas(this.xrange.min, this.yrange.min, this.xrange.max, this.yrange.min);
    this.lineToCanvas(this.xrange.min, this.yrange.min, this.xrange.min, this.yrange.max);

    let offset = 5;

    let xtick_spacing = (this.xrange.range / 10);
    xtick_spacing = xtick_spacing < 1 ? xtick_spacing.toFixed(2) : xtick_spacing.toFixed(0);
    let xtick_amount = (this.xrange.range / xtick_spacing).toFixed(0);
    for (let i = 0; i < xtick_amount; i++) {
      let x = (this.xs[0] + i*xtick_spacing).toFixed(2);
      line(this.toCanvasX(x), this.toCanvasY(this.yrange.min), this.toCanvasX(x), this.toCanvasY(this.yrange.min) - offset);
      text(x, this.toCanvasX(x), this.toCanvasY(this.yrange.min)-offset);
    }

    let sorted_ys = this.ys.toSorted((a, b) => a - b);
    let ytick_spacing = (this.yrange.range / 5);
    ytick_spacing = ytick_spacing < 1 ? ytick_spacing.toFixed(2) : ytick_spacing.toFixed(0);
    let ytick_amount = (this.yrange.range / ytick_spacing).toFixed(0);
    for (let i = 0; i < ytick_amount; i++) {
      let y = (sorted_ys[0] + i*ytick_spacing).toFixed(2);
      line(this.toCanvasX(this.xrange.min), this.toCanvasY(y), this.toCanvasX(this.xrange.min)+offset, this.toCanvasY(y));
      text(y, this.toCanvasX(this.xrange.min)+offset, this.toCanvasY(y)-offset);
    }
  }

  drawPoints() {
    point(this.toCanvasX(this.xs[0]),this.toCanvasY(this.ys[0]));
    for (let i = 1; i < this.xs.length; i++) {
      point(this.toCanvasX(this.xs[i]),this.toCanvasY(this.ys[i]));
      this.lineToCanvas(this.xs[i-1], this.ys[i-1], this.xs[i], this.ys[i]);
    }
  }

  draw() {
    this.drawAxes();
    this.drawPoints();
  }
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let xs = document.getElementById("xs").value.split(", ").map((x) => parseFloat(x));
  let ys = document.getElementById("ys").value.split(", ").map((y) => parseFloat(y));
  
  let graph = new Graph(xs, ys);
  graph.draw();
}

