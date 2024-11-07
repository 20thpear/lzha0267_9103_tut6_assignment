let graphicsObjects = []; 
let colorPalette;
let shadowRings = [];
let waveEffect;
let gridLayer;
let noiseOffsetX = 0;
let noiseOffsetY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initializeGraphics();
  pixelDensity(1);

  // Initializes the ripple effect in a blue color scheme
  let poolColor = color(44, 169, 225);
  waveEffect = new WaveEffect(120, poolColor, 3, 200);

  // Creates the grid layer with distortion effects
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer);
}

function draw() {
  background(240);
  image(gridLayer, 0, 0);
  
  // Updates the ripple effect only every third frame to enhance performance
  if (frameCount % 3 === 0) {
    waveEffect.update();
  }
  waveEffect.display();
  graphicsObjects.forEach(obj => obj.display());
}

function initializeGraphics() {
  // Resets the graphic objects and shadow rings arrays
  graphicsObjects = [];
  shadowRings = [];

  // Defines a color palette for the rings and other elements
  colorPalette = [
    color(245, 185, 193),
    color(237, 170, 63),
    color(166, 233, 156),
    color(238, 116, 178),
    color(65, 124, 180),
    color(149, 205, 232)
  ];

  // Sets the minimum distance between shadow rings to avoid overlap
  const minDistance = 250;

  // Creates multiple shadow rings that do not overlap
  for (let i = 0; i < 10; i++) {
    let posX, posY;
    let isOverlapping;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      posX = random(100, width - 50);
      posY = random(100, height - 50);
      isOverlapping = false;

      for (let ring of shadowRings) {
        let distance = dist(posX, posY, ring.x, ring.y);
        if (distance < minDistance) {
          isOverlapping = true;
          break;
        }
      }
      attempts++;
    } while (isOverlapping && attempts < maxAttempts);

    if (attempts >= maxAttempts) continue;

    // Adds a shadow ring to the graphics array and stores its position and radius
    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, color(6, 38, 96, 20), color(6, 38, 96, 20), color(6, 38, 96, 20)));
    shadowRings.push({ x: posX, y: posY, radius: 80 });
  }

  // Adds gradient rings and decorative circles for each shadow ring
  for (let ring of shadowRings) {
    let posX = ring.x - 80;
    let posY = ring.y - 80;

    let shadowColor = random(colorPalette);
    let midColor = random(colorPalette);
    let highlightColor = random(colorPalette);

    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, shadowColor, midColor, highlightColor));

    let circleColor = random(colorPalette);
    graphicsObjects.push(new ConcentricCircles(posX, posY, 5, 40, 70, circleColor));

    let baseRadius = 80;
    let baseOpacity = 180;
    let radiusIncrement = 10;
    let opacityDecrement = 20;

    for (let j = 0; j < 4; j++) {
      graphicsObjects.push(new DecorativeCircleRing(posX, posY, baseRadius + j * radiusIncrement, 36 + j * 6, color(255, 255, 255, baseOpacity - j * opacityDecrement)));
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Regenerates the grid layer to adapt to new canvas dimensions
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer);

  // Regenerates the ripple effect to fit the new canvas size
  waveEffect = new WaveEffect(80, color(0, 164, 223), 3, 200);

  // Adjusts positions of graphics objects to match the resized canvas
  graphicsObjects.forEach(obj => {
    if (obj instanceof GradientRing || obj instanceof ConcentricCircles || obj instanceof DecorativeCircleRing) {
      obj.x = map(obj.x, 0, width, 0, windowWidth);
      obj.y = map(obj.y, 0, height, 0, windowHeight);
    }
  });

  redraw();
}

// Class representing a gradient ring with multiple concentric circles
class GradientRing {
  constructor(x, y, innerRadius, outerRadius, numRings, shadowColor, midColor, highlightColor) {
    this.x = x;
    this.y = y;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.numRings = numRings;
    this.colors = [shadowColor, midColor, highlightColor];
  }

  // Calculates the color for each ring segment based on its position
  calculateColor(t) {
    if (t < 0.5) {
      return lerpColor(this.colors[0], this.colors[1], t * 2);
    } else {
      return lerpColor(this.colors[1], this.colors[2], (t - 0.5) * 2);
    }
  }

  // Draws each ring with a gradient effect
  display() {
    let step = (this.outerRadius - this.innerRadius) / this.numRings;
    for (let r = this.innerRadius; r <= this.outerRadius; r += step) {
      let t = map(r, this.innerRadius, this.outerRadius, 0, 1);
      stroke(this.calculateColor(t));
      strokeWeight(5);
      noFill();
      ellipse(this.x, this.y, r * 2, r * 2);
    }
  }
}

// Class representing concentric circles, used for decorative purposes
class ConcentricCircles {
  constructor(x, y, numCircles, minRadius, maxRadius, strokeColor) {
    this.x = x;
    this.y = y;
    this.numCircles = numCircles;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.strokeColor = strokeColor;
  }

  // Draws concentric circles from minRadius to maxRadius
  display() {
    noFill();
    stroke(this.strokeColor);
    strokeWeight(2);
    for (let i = 0; i < this.numCircles; i++) {
      let radius = map(i, 0, this.numCircles - 1, this.minRadius, this.maxRadius);
      ellipse(this.x, this.y, radius * 2, radius * 2);
    }
  }
}

// Class representing a ring of decorative circles positioned along a larger ring
class DecorativeCircleRing {
  constructor(x, y, radius, numCircles, fillColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.numCircles = numCircles;
    this.fillColor = fillColor;
    this.angleStep = TWO_PI / this.numCircles;
  }

  // Draws small circles evenly spaced along the outer radius
  display() {
    fill(this.fillColor);
    noStroke();
    for (let i = 0; i < this.numCircles; i++) {
      let angle = i * this.angleStep;
      let x = this.x + this.radius * cos(angle);
      let y = this.y + this.radius * sin(angle);
      ellipse(x, y, 6, 6);
    }
  }
}

// Function to draw a distorted grid with Perlin noise offsets
function drawGridAndDistortion(layer) {
  layer.background(173, 216, 230);
  layer.stroke(100, 150, 200);
  layer.strokeWeight(2);
  let gridSize = 40;
  
  for (let x = 0; x < width; x += gridSize) {
    layer.beginShape();
    for (let y = 0; y <= height; y += gridSize) {
      let offsetX = noise(x * 0.1, y * 0.1) * 10 - 5;
      layer.vertex(x + offsetX, y);
    }
    layer.endShape();
  }

  for (let y = 0; y < height; y += gridSize) {
    layer.beginShape();
    for (let x = 0; x <= width; x += gridSize) {
      let offsetY = noise(x * 0.1, y * 0.1) * 10 - 5;
      layer.vertex(x, y + offsetY);
    }
    layer.endShape();
  }
}

// Class representing a point that oscillates based on Perlin noise
class Point {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.baseX = x;
    this.baseY = y;
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);
  }

  // Updates the position of the point to create a wave-like motion
  update() {
    let moveX = map(noise(this.noiseOffsetX), 0, 1, -30, 30);
    let moveY = map(noise(this.noiseOffsetY), 0, 1, -30, 30);

    // Offset position around the original location to create wave effect
    this.position.x = this.baseX + moveX;
    this.position.y = this.baseY + moveY;

    // Increase noise offset for faster movement
    this.noiseOffsetX += 0.2;
    this.noiseOffsetY += 0.2;
  }
}

// Class representing the wave effect by generating and displaying ripple patterns
class WaveEffect {
  constructor(numPoints, bgColor, step, transparency) {
    this.points = [];
    this.step = step;
    this.transparency = transparency;
    this.bgColor = bgColor;

    for (let i = 0; i < numPoints; i++) {
      let x = random(width);
      let y = random(height);
      this.points.push(new Point(x, y));
    }

    this.waveLayer = createGraphics(width, height);
    this.waveLayer.pixelDensity(1);
    this.generateWaveLayer();
  }
  
  // Updates all feature points and regenerates the wave layer
  update() {
    this.points.forEach(point => point.update());
    this.generateWaveLayer();
  }

  // Generates the ripple effect based on distances to feature points
  generateWaveLayer() {
    this.waveLayer.clear();
    this.waveLayer.loadPixels();

    for (let x = 0; x < width; x += this.step) {
      for (let y = 0; y < height; y += this.step) {
        let minDist = Infinity;
        for (let point of this.points) {
          let d = (x - point.position.x) ** 2 + (y - point.position.y) ** 2;
          if (d < minDist) minDist = d;
        }

        let noiseVal = Math.sqrt(minDist);
        let colR = this.waveColor(noiseVal, red(this.bgColor), 14.5, 2.5);
        let colG = this.waveColor(noiseVal, green(this.bgColor), 21, 2.5);
        let colB = this.waveColor(noiseVal, blue(this.bgColor), 40, 3.0);

        for (let dx = 0; dx < this.step; dx++) {
          for (let dy = 0; dy < this.step; dy++) {
            let px = x + dx;
            let py = y + dy;
            if (px < width && py < height) {
              let index = (px + py * width) * 4;
              this.waveLayer.pixels[index + 0] = colR;
              this.waveLayer.pixels[index + 1] = colG;
              this.waveLayer.pixels[index + 2] = colB;
              this.waveLayer.pixels[index + 3] = this.transparency;
            }
          }
        }
      }
    }

    this.waveLayer.updatePixels();
  }

  // Calculates the color for wave effect based on distance and base color
  waveColor(distance, base, a, e) {
    return constrain(base + Math.pow(distance / a, e), 0, 255);
  }

  // Displays the wave effect layer on the canvas
  display() {
    image(this.waveLayer, 0, 0);
  }
}
