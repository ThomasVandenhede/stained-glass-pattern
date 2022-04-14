const canvas = document.getElementById("canvas");
const radialGridInput = document.querySelector("input#radial-grid");
const colorsContainer = document.getElementById("colors");
const ctx = canvas.getContext("2d");

let cameraX = -canvas.width / 2;
let cameraY = -canvas.height / 2;

// Grid
let nbPtsX = 8;
let nbPtsY = 7;
let gridSpacing = 125;

// Radial grid
let isRadialGrid = radialGridInput.checked;
let angle = degToRad(12); // should be 11.7
let a = (angle + 2) / (2 - angle);

// Shapes
let points = [];
let polygons = [];

// Transform origin (self-explanatory)
let transformOrigin = { x: 0, y: 1 * gridSpacing };

// Colors
const colors = [
  "hsla(240, 76%, 15%, 1)",
  "hsla(360, 76%, 15%, 1)",
  "hsla(30, 100%, 29%, 0.97)",
  "teal",
];
let currentColor = colors[0];

const createColorPickers = () => {
  for (let color of colors) {
    const colorInput = document.createElement("div");
    colorInput.className = "color";
    colorInput.style.backgroundColor = color;
    colorInput.addEventListener("click", () => {
      currentColor = color;
    });
    colorsContainer.appendChild(colorInput);
  }
};

// hovered shapes
let hoveredPolygon = null;

const mouse = {
  x: 0,
  y: 0,
};

function generateTransormOrigin() {
  transformOrigin = {
    x: 0,
    y: 2.2 * gridSpacing,
  };
}

function build2OriginHexagon(origin1, origin2, size) {
  const hexagon = [];
  for (let i = 0; i <= 2; i++) {
    hexagon.push({
      x: origin1.x + size * Math.cos(Math.PI / 6 + (i * 2 * Math.PI) / 6),
      y: origin1.y + size * Math.sin(Math.PI / 6 + (i * 2 * Math.PI) / 6),
    });
  }
  for (let i = 3; i <= 6; i++) {
    hexagon.push({
      x: origin2.x + size * Math.cos(Math.PI / 6 + (i * 2 * Math.PI) / 6),
      y: origin2.y + size * Math.sin(Math.PI / 6 + (i * 2 * Math.PI) / 6),
    });
  }
  return hexagon;
}

function buildHalfHexagonLeft(origin, size) {
  const halfHexagon = [];
  for (let i = -2; i <= 1; i++) {
    halfHexagon.push({
      x: origin.x + size * Math.cos(Math.PI / 6 + (i * 2 * Math.PI) / 6),
      y: origin.y + size * Math.sin(Math.PI / 6 + (i * 2 * Math.PI) / 6),
    });
  }
  return halfHexagon;
}

function buildHalfHexagonRight(origin, size) {
  const halfHexagon = [];
  for (let i = 1; i <= 4; i++) {
    halfHexagon.push({
      x: origin.x + size * Math.cos(Math.PI / 6 + (i * 2 * Math.PI) / 6),
      y: origin.y + size * Math.sin(Math.PI / 6 + (i * 2 * Math.PI) / 6),
    });
  }
  return halfHexagon;
}

function buildPattern() {
  polygons = [];
  const originDistance = 0;
  for (let i = 0; i <= nbPtsX - 2; i++) {
    for (let j = 1; j <= 2 * (nbPtsY - 1) - 1; j++) {
      // Bottom origin
      const origin1 = {
        x: (i - 3) * gridSpacing,
        y: (j + originDistance / 2) * gridSpacing * Math.tan(Math.PI / 6),
      };
      // Top origin
      const origin2 = {
        x: (i - 3) * gridSpacing,
        y: (j - originDistance / 2) * gridSpacing * Math.tan(Math.PI / 6),
      };

      if ((i + j) % 2 === 0) {
        const hexagon = build2OriginHexagon(
          origin1,
          origin2,
          (gridSpacing * 0.25) / Math.cos(Math.PI / 6)
        );
        polygons.push({
          points: hexagon,
          color: colors[0],
        });
      }
    }
  }

  // Right half hexagon
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 10; j++) {
      if ((i + j) % 2 === 1) {
        const origin = {
          x: (i - 2.5) * gridSpacing,
          y: (j + 1 + originDistance / 2) * gridSpacing * Math.tan(Math.PI / 6),
        };
        const polygon = buildHalfHexagonRight(
          origin,
          (gridSpacing * 0.25) / Math.cos(Math.PI / 6)
        );
        polygons.push({
          points: polygon,
          color: colors[3],
        });
      }
    }
  }

  // Left hexagon
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 10; j++) {
      const origin1 = {
        x: (i - 3.25) * gridSpacing,
        y:
          (j + 1 + originDistance / 2 + Math.sin(Math.PI / 6) * 0.5) *
          gridSpacing *
          Math.tan(Math.PI / 6),
      };
      const origin2 = {
        x: (i - 3.25) * gridSpacing,
        y:
          (j + 1 - originDistance / 2 - Math.sin(Math.PI / 6) * 0.5) *
          gridSpacing *
          Math.tan(Math.PI / 6),
      };
      if ((i + j) % 2 === 0) {
        const hexagon = build2OriginHexagon(
          origin1,
          origin2,
          (gridSpacing * 0.25) / Math.cos(Math.PI / 6)
        );
        polygons.push({
          points: hexagon,
          color: (j + 4) % 3 === 0 || (j + 3) % 4 === 1 ? colors[1] : colors[2],
        });
      }
    }
  }

  // Right hexagon
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 10; j++) {
      const origin1 = {
        x: (i - 2.75) * gridSpacing,
        y:
          (j + 1 + originDistance / 2 + Math.sin(Math.PI / 6) * 0.5) *
          gridSpacing *
          Math.tan(Math.PI / 6),
      };
      const origin2 = {
        x: (i - 2.75) * gridSpacing,
        y:
          (j + 1 - originDistance / 2 - Math.sin(Math.PI / 6) * 0.5) *
          gridSpacing *
          Math.tan(Math.PI / 6),
      };
      if ((i + j) % 2 === 0) {
        const hexagon = build2OriginHexagon(
          origin1,
          origin2,
          (gridSpacing * 0.25) / Math.cos(Math.PI / 6)
        );
        polygons.push({
          points: hexagon,
          color: (j + 4) % 3 === 0 || (j + 3) % 4 === 1 ? colors[1] : colors[2],
        });
      }
    }
  }

  // Left half hexagon
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 10; j++) {
      if ((i + j) % 2 === 1) {
        const origin = {
          x: (i - 3.5) * gridSpacing,
          y: (j + 1 + originDistance / 2) * gridSpacing * Math.tan(Math.PI / 6),
        };
        const polygon = buildHalfHexagonLeft(
          origin,
          (gridSpacing * 0.25) / Math.cos(Math.PI / 6)
        );
        polygons.push({ points: polygon, color: colors[3] });
      }
    }
  }
}

function generatePoints() {
  points = [];
  for (let i = 0; i < nbPtsX; i++) {
    points.push([]);
    for (let j = 0; j < nbPtsY; j++) {
      points[i].push({ x: (i - 3.5) * gridSpacing, y: j * gridSpacing });
    }
  }
}

function degToRad(deg) {
  return (deg / 180) * Math.PI;
}

function radialTransform({ x, y }) {
  const alpha = (angle * (x - transformOrigin.x)) / gridSpacing - Math.PI / 2;
  const startRadius = 1200;
  const r =
    startRadius * Math.pow(a, (y - transformOrigin.y - 900) / gridSpacing);
  const tx = transformOrigin.x + r * Math.cos(alpha);
  const ty = r * Math.sin(alpha) + 400;
  const transformedPoint = { x: tx * 1.3, y: ty * 1.3 + 400 };
  return transformedPoint;
}

function radialTransformReverse({ x, y }) {
  x = x / 1.3;
  y = (y - 400) * 1.3;
  const startRadius = 1200;
  const tx =
    (gridSpacing / angle) *
      Math.atan((y - 400) / (x - transformOrigin.x) + Math.PI / 2) +
    transformOrigin.x;
  const ty =
    Math.log(
      Math.sqrt(Math.pow(x - transformOrigin.x, 2) + Math.pow(y - 400, 2)) /
        startRadius
    ) *
      gridSpacing +
    transformOrigin.y +
    900;
  const transformedPoint = { x: tx, y: ty };
  return transformedPoint;
}

function identity(point) {
  return point;
}

function transform(point) {
  let transformFn;
  if (isRadialGrid) {
    transformFn = radialTransform;
  } else {
    transformFn = identity;
  }

  return transformFn(point);
}

function drawPolygon(polygon) {
  const { points, color } = polygon;
  ctx.save();
  // const transformedMouse = transform(mouse);
  if (points.length > 2) {
    ctx.beginPath();
    const origin = transform(points[0]);
    ctx.moveTo(origin.x - cameraX, origin.y);
    for (let i = 1; i <= points.length - 1; i++) {
      const point = transform(points[i]);
      ctx.lineTo(point.x - cameraX, point.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }
  ctx.restore();
}

function drawOrthogonalGrid(ctx) {
  ctx.save();
  ctx.strokeStyle = "lightGray";
  for (let i = 1; i <= 11; i++) {
    const x = i * 100;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let j = 1; j <= 7; j++) {
    const y = j * 100;
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPoints(ctx) {
  ctx.save();
  for (let row of points) {
    for (let point of row) {
      const transformedPoint = transform(point);
      const x = transformedPoint.x;
      const y = transformedPoint.y;
      ctx.beginPath();
      ctx.arc(x - cameraX, y, 1, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawGridLines(ctx) {
  ctx.save();
  for (let row of points) {
    const startingPoint = transform(row[0]);
    const endPoint = transform(row[row.length - 1]);
    ctx.moveTo(startingPoint.x - cameraX, startingPoint.y);
    ctx.lineTo(endPoint.x - cameraX, endPoint.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTransformOrigin(ctx) {
  // Draw transform origin
  ctx.save();
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(transformOrigin.x - cameraX, transformOrigin.y, 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMouse(ctx) {
  ctx.save();
  ctx.fillStyle = currentColor;
  ctx.strokeStyle = "rgba(192, 192, 192, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.lineWidth = 0.5;
  // Clear
  ctx.save();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Draw polygons
  ctx.save();
  ctx.lineWidth = 7;
  for (let polygon of polygons) {
    const { color } = polygon;
    ctx.fillStyle = color;
    drawPolygon(polygon);
  }
  ctx.restore();

  ctx.save();
  if (hoveredPolygon) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    drawPolygon(hoveredPolygon);
  }
  ctx.restore();

  // drawOrthogonalGrid(ctx);
  // drawPoints(ctx);
  // drawGridLines(ctx);
  // drawTransformOrigin(ctx);
  drawMouse(ctx);

  ctx.save();
  const text =
    "Go make a kick-ass lamp!\nLove you, Thomas.\n(didn't expect that, did you?)";
  ctx.font = "12px sans";
  ctx.textAlign = "right";
  const lines = text.split("\n");
  const lineheight = 13;
  const x = canvas.width - 13;
  const y = canvas.height - lines.length * lineheight;

  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineheight);
  }
  ctx.restore();
}

const tick = () => {
  requestAnimationFrame(tick);
  hoveredPolygon = polygons.find((polygon) =>
    isPointWithinPolygon(
      polygon.points.map((point) => {
        return { x: transform(point).x - cameraX, y: transform(point).y };
      }),
      mouse
    )
  );
  draw();
};

const isPointWithinPolygon = (points, test) => {
  let c = false;
  for (let len = points.length, i = 0, j = len - 1; i < len; j = i++) {
    if (
      points[i].y > test.y !== points[j].y > test.y &&
      test.x <
        ((points[j].x - points[i].x) * (test.y - points[i].y)) /
          (points[j].y - points[i].y) +
          points[i].x
    ) {
      c = !c;
    }
  }
  return c;
};

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.x;
  mouse.y = event.clientY - rect.y;
});

canvas.addEventListener("click", (event) => {
  if (hoveredPolygon) {
    hoveredPolygon.color = currentColor;
  }
});

radialGridInput.addEventListener("input", () => {
  isRadialGrid = radialGridInput.checked;
});
createColorPickers();
buildPattern();
generatePoints();
generateTransormOrigin();
requestAnimationFrame(tick);

// export image
const url = canvas.toDataURL("image/png", 1.0);
const img = document.createElement("img");
img.src = url;
document.body.appendChild(img);
