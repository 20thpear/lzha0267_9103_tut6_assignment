let graphicsObjects = []; 
let colourPalette;
let shadowRings = [];
let waveEffect;
let gridLayer;
let noiseOffsetX = 0;
let noiseOffsetY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initialiseGraphics();
  pixelDensity(1);

  // Initialise the ripple effect in a blue colour scheme
  let poolColour = color(44, 169, 225);
  waveEffect = new WaveEffect(120, poolColour, 3, 200);

  // Create the grid layer with distortion effects
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer);
}

function draw() {
  // Update grid layer with dynamic time offset for wave effect
  drawGridAndDistortion(gridLayer, frameCount);

  image(gridLayer, 0, 0); // Display the updated grid layer

  // Update and display the water ripple effect
  waveEffect.update();
  waveEffect.display();

  graphicsObjects.forEach(obj => obj.display());
}

function initialiseGraphics() {
  // Reset the graphic objects and shadow rings arrays
  graphicsObjects = [];
  shadowRings = [];

  // Define a colour palette for the rings and other elements
  colourPalette = [
    color(245, 185, 193),
    color(237, 170, 63),
    color(166, 233, 156),
    color(238, 116, 178),
    color(65, 124, 180),
    color(149, 205, 232)
  ];

  // Set the minimum distance between shadow rings to avoid overlap
  const minDistance = 250;

  // Create multiple shadow rings that do not overlap
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

    // Add a shadow ring to the graphics array and stores its position and radius
    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, color(6, 38, 96, 20), color(6, 38, 96, 20), color(6, 38, 96, 20)));
    shadowRings.push({ x: posX, y: posY, radius: 80 });
  }

  // Add gradient rings and decorative circles for each shadow ring
  for (let ring of shadowRings) {
    let posX = ring.x - 80;
    let posY = ring.y - 80;

    let shadowColour = random(colourPalette);
    let midColour = random(colourPalette);
    let highlightColour = random(colourPalette);

    graphicsObjects.push(new GradientRing(posX, posY, 40, 120, 80, shadowColour, midColour, highlightColour));

    let circleColour = random(colourPalette);
    graphicsObjects.push(new ConcentricCircles(posX, posY, 5, 40, 70, circleColour));

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

  // Regenerate the grid layer to adapt to new canvas dimensions
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer);

  // Regenerate the ripple effect to fit the new canvas size
  waveEffect = new WaveEffect(80, color(0, 164, 223), 3, 200);

  // Adjust positions of graphics objects to match the resized canvas
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
  constructor(x, y, innerRadius, outerRadius, numRings, shadowColour, midColour, highlightColour) {
    this.x = x;
    this.y = y;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.numRings = numRings;
    this.colours = [shadowColour, midColour, highlightColour];
  }

  // Calculate the colour for each ring segment based on its position
  calculateColour(t) {
    if (t < 0.5) {
      return lerpColor(this.colours[0], this.colours[1], t * 2);
    } else {
      return lerpColor(this.colours[1], this.colours[2], (t - 0.5) * 2);
    }
  }

  // Draw each ring with a gradient effect
  display() {
    let step = (this.outerRadius - this.innerRadius) / this.numRings;
    for (let r = this.innerRadius; r <= this.outerRadius; r += step) {
      let t = map(r, this.innerRadius, this.outerRadius, 0, 1);
      stroke(this.calculateColour(t));
      strokeWeight(5);
      noFill();
      ellipse(this.x, this.y, r * 2, r * 2);
    }
  }
}

// Class representing concentric circles, used for decorative purposes
class ConcentricCircles {
  constructor(x, y, numCircles, minRadius, maxRadius, strokeColour) {
    this.x = x;
    this.y = y;
    this.numCircles = numCircles;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.strokeColour = strokeColour;
  }

  // Draw concentric circles from minRadius to maxRadius
  display() {
    noFill();
    stroke(this.strokeColour);
    strokeWeight(2);
    for (let i = 0; i < this.numCircles; i++) {
      let radius = map(i, 0, this.numCircles - 1, this.minRadius, this.maxRadius);
      ellipse(this.x, this.y, radius * 2, radius * 2);
    }
  }
}

// Class representing a ring of decorative circles positioned along a larger ring
class DecorativeCircleRing {
  constructor(x, y, radius, numCircles, fillColour) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.numCircles = numCircles;
    this.fillColour = fillColour;
    this.angleStep = TWO_PI / this.numCircles;
  }

  // Draw small circles evenly spaced along the outer radius
  display() {
    fill(this.fillColour);
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
function drawGridAndDistortion(layer, timeOffset = 0) {
  layer.clear();
  layer.background(173, 216, 230);
  layer.stroke(100, 150, 200);
  layer.strokeWeight(2);

  let gridSize = 40;
  let noiseScale = 0.2;
  let noiseMagnitude = 25;

  // Loop through each grid cell
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      
      // Calculate offset for each corner of the grid cell using Perlin noise
      let offsetX1 = noise(x * noiseScale, y * noiseScale, timeOffset * 0.02) * noiseMagnitude - noiseMagnitude / 2;
      let offsetY1 = noise(x * noiseScale + 1000, y * noiseScale, timeOffset * 0.02) * noiseMagnitude - noiseMagnitude / 2;
      let offsetX2 = noise((x + gridSize) * noiseScale, y * noiseScale, timeOffset * 0.02) * noiseMagnitude - noiseMagnitude / 2;
      let offsetY2 = noise((x + gridSize) * noiseScale + 1000, y * noiseScale, timeOffset * 0.02) * noiseMagnitude - noiseMagnitude / 2;
      let offsetX3 = noise((x + gridSize) * noiseScale, (y + gridSize) * noiseScale, timeOffset * 0.02) * noiseMagnitude - noiseMagnitude / 2;
      let offsetY3 = noise((x + gridSize) * noiseScale + 1000, (y + gridSize) * noiseScale, timeOffset * 0.02) * noiseMagnitude - noiseMagnitude / 2;
      let offsetX4 = noise(x * noiseScale, (y + gridSize) * noiseScale, timeOffset * 0.02) * noiseMagnitude - noiseMagnitude / 2;
      let offsetY4 = noise(x * noiseScale + 1000, (y + gridSize) * noiseScale, timeOffset * 0.02) * noiseMagnitude - noiseMagnitude / 2;

      // Draw the grid cell using the distorted corners
      layer.beginShape();
      layer.vertex(x + offsetX1, y + offsetY1);              // Top-left corner
      layer.vertex(x + gridSize + offsetX2, y + offsetY2);   // Top-right corner
      layer.vertex(x + gridSize + offsetX3, y + gridSize + offsetY3); // Bottom-right corner
      layer.vertex(x + offsetX4, y + gridSize + offsetY4);   // Bottom-left corner
      layer.endShape(CLOSE);
    }
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

  // Update the position of the point to create a wave-like motion
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
  constructor(numPoints, bgColour, step, transparency) {
    this.points = [];
    this.step = step;
    this.transparency = transparency;
    this.bgColour = bgColour;

    for (let i = 0; i < numPoints; i++) {
      let x = random(width);
      let y = random(height);
      this.points.push(new Point(x, y));
    }

    this.waveLayer = createGraphics(width, height);
    this.waveLayer.pixelDensity(1);
    this.generateWaveLayer();
  }
  
  // Update all feature points and regenerate the wave layer
  update() {
    this.points.forEach(point => point.update());
    this.generateWaveLayer();
  }

  // Generate the ripple effect based on distances to feature points
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
        let colR = this.waveColor(noiseVal, red(this.bgColour), 14.5, 2.5);
        let colG = this.waveColor(noiseVal, green(this.bgColour), 21, 2.5);
        let colB = this.waveColor(noiseVal, blue(this.bgColour), 40, 3.0);

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

  // Calculate the colour for wave effect based on distance and base colour
  waveColor(distance, base, a, e) {
    return constrain(base + Math.pow(distance / a, e), 0, 255);
  }

  // Display the wave effect layer on the canvas
  display() {
    image(this.waveLayer, 0, 0);
  }
}
