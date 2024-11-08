// Array to store all graphic objects, including rings and decorative elements
let graphicsObjects = []; 
// Array holding colour palette inspired by the artwork
let colourPalette;
// Array to store shadow ring data for non-overlapping placement
let shadowRings = [];
// Object for creating the water ripple effect layer
let waveEffect;
// Graphics layer for drawing the distorted grid pattern
let gridLayer;

// Noise offsets for moving grid distortion
let noiseOffsetX = 0;
let noiseOffsetY = 0;


function setup() {
  // Create a canvas that has the same size as the browser window
  createCanvas(windowWidth, windowHeight);
  // Initialise graphic elements
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
  // Draw and update grid layer with dynamic time offset for wave effect
  drawGridAndDistortion(gridLayer, frameCount);
  image(gridLayer, 0, 0);

  // Update and display water surface
  waveEffect.update();
  waveEffect.display();

  // Update and display the swimming rings
  graphicsObjects.forEach(obj => {
    obj.update();
    obj.display();
  });
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Regenerate the grid layer to adapt to new canvas dimensions
  gridLayer = createGraphics(width, height);
  drawGridAndDistortion(gridLayer);

  // Regenerate the ripple effect to fit the new canvas size
  waveEffect = new WaveEffect(80, color(0, 164, 223), 3, 200);

  // Adjust positions of graphics objects to match the resized canvas
  for (let i = 0; i < graphicsObjects.length; i++) {
    let obj = graphicsObjects[i];
    
    // Apply the instanceof operator "to test the presence of constructor.prototype in object's prototype chain." This quotation and technique is from https://canvas.sydney.edu.au/courses/60108/assignments/556120
    // Classes: GradientRing, ConcentricCircles and DecorativeCircleRing contain the prototype property
    if (obj instanceof GradientRing || obj instanceof ConcentricCircles || obj instanceof DecorativeCircleRing) {
      obj.x = map(obj.x, 0, width, 0, windowWidth);
      obj.y = map(obj.y, 0, height, 0, windowHeight);
    }
  }

  redraw();
}


function initialiseGraphics() {
  // Initialise the graphic objects and shadow rings arrays
  graphicsObjects = [];
  shadowRings = [];

  // Define a colour palette inspired by the selected artwork for the rings and other elements
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

  // Create up to 10 non-ovelapping rings
  for (let i = 0; i < 10; i++) {
    let posX, posY;
    let isOverlapping;
    let attempts = 0;
    // Set the maximum number of attempts to 100
    const maxAttempts = 100;

    // Execute the loop
    do {
      // Random x and y coordinates
      posX = random(100, width - 50);
      posY = random(100, height - 50);
      isOverlapping = false;

      // Loop through the shadowRings array to check whether the new shadow ring and the existed shadow rings overlap
      for (let ring of shadowRings) {
        let distance = dist(posX, posY, ring.x, ring.y);
        if (distance < minDistance) {
          isOverlapping = true;
          break;
        }
      }
      attempts++;
    } while (isOverlapping && attempts < maxAttempts);

    // If the number of random attempts reaches the maximum number, and does not get a random ring which does not overlap with other rings, then stop drawing the current ring. "The continue statement breaks one iteration (in the loop)", and this quotation of this technique is from https://www.w3schools.com/js/js_break.asp
    if (attempts >= maxAttempts) continue;

    // Instantiate SwimRing objects and add them to the graphics object array
    let swimRing = new SwimRing(posX, posY, colourPalette);
    graphicsObjects.push(swimRing);
    shadowRings.push({ x: posX, y: posY, radius: 80 });
  }
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

// SwimRing class representing a swimming ring integrated all ring elements
class SwimRing {
  constructor(x, y, colourPalette) {
    // Base position
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    
    // Noise offsets for animation
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);

    // Initialise colours
    let shadowColour = random(colourPalette);
    let midColour = random(colourPalette);
    let highlightColour = random(colourPalette);
    let shadowRingColour = color(6, 38, 96, 20)
    let circleColour = random(colourPalette);

    // Instantiate each part of the swimming rings
    this.shadowRing = new GradientRing(x + 80, y + 80, 40, 120, 80, shadowRingColour, shadowRingColour, shadowRingColour);
    this.gradientRing = new GradientRing(x, y, 40, 120, 80, shadowColour, midColour, highlightColour);
    this.concentricCircles = new ConcentricCircles(x, y, 5, 40, 70, circleColour);
    
    this.decorativeCircles = [];
    let baseRadius = 80;
    let baseOpacity = 180;
    let radiusIncrement = 10;
    let opacityDecrement = 20;
    for (let j = 0; j < 4; j++) {
      this.decorativeCircles.push(
        new DecorativeCircleRing(x, y, baseRadius + j * radiusIncrement, 36 + j * 6, color(255, 255, 255, baseOpacity - j * opacityDecrement))
      );
    }
  }

  // Update position using Perlin noise
  update() {
    let offsetX = map(noise(this.noiseOffsetX), 0, 1, -30, 30);
    let offsetY = map(noise(this.noiseOffsetY), 0, 1, -30, 30);

    this.x = this.baseX + offsetX;
    this.y = this.baseY + offsetY;

    // Increment noise offsets to create smooth animation
    this.noiseOffsetX += 0.02;
    this.noiseOffsetY += 0.02;

    // Update the position of each part
    this.shadowRing.x = this.x + 80;
    this.shadowRing.y = this.y + 80;
    this.gradientRing.x = this.x;
    this.gradientRing.y = this.y;
    this.concentricCircles.x = this.x;
    this.concentricCircles.y = this.y;
    this.decorativeCircles.forEach(circle => {
      circle.x = this.x;
      circle.y = this.y;
    });
  }

  // Display each part of the swimming rings
  display() {
    this.shadowRing.display();
    this.gradientRing.display();
    this.concentricCircles.display();
    this.decorativeCircles.forEach(circle => circle.display());
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


// Original ripple effect implementation using Worley Noise from Kazuki Umeda
// Source: https://www.youtube.com/watch?app=desktop&v=kUexPZMIwuA
// GitHub: https://github.com/Creativeguru97/YouTube_tutorial/blob/master/Play_with_noise/waterSurface/sketch.js
// Modified for additional features and integration into project

// Point class representing each feature point
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
    this.noiseOffsetX += 0.1;
    this.noiseOffsetY += 0.1;
  }
}

// WaveEffect class responsible for generating and displaying ripple patterns
class WaveEffect {
  constructor(numPoints, bgColour, step, transparency) {
    this.points = [];
    // Spacing between calculated points in the ripple effect
    this.step = step;
    // Transparency of the ripple layer
    this.transparency = transparency;
    // Background colour of the pool effect
    this.bgColour = bgColour;

    // Generate random feature points within the canvas
    for (let i = 0; i < numPoints; i++) {
      let x = random(width);
      let y = random(height);
      this.points.push(new Point(x, y));
    }

    // Create a graphics layer for the wave effect
    this.waveLayer = createGraphics(width, height);
    // Set pixel density to 1 for consistency
    this.waveLayer.pixelDensity(1);
    this.generateWaveLayer();
  }
  
  // Update all feature points and regenerate the wave layer
  update() {
    this.points.forEach(point => point.update());
    this.generateWaveLayer();
  }

  // Method to generate the ripple effect based on distances to feature points
  generateWaveLayer() {
    // Clear the layer to remove any previous drawings
    this.waveLayer.clear();
    this.waveLayer.clear();
    this.waveLayer.loadPixels();

    // Iterate over the canvas in steps to create the wave pattern
    for (let x = 0; x < width; x += this.step) {
      for (let y = 0; y < height; y += this.step) {

        // Find the minimum distance from the current position to any feature point
        let minDist = Infinity;
        for (let point of this.points) {
          let d = (x - point.position.x) ** 2 + (y - point.position.y) ** 2;
          if (d < minDist) minDist = d;
        }

        // Calculate noise value based on the distance to the nearest feature point
        let noiseVal = Math.sqrt(minDist);

        // Calculate colour values for each channel based on the distance and pool background colour
        let colR = this.waveColor(noiseVal, red(this.bgColour), 14.5, 2.5);
        let colG = this.waveColor(noiseVal, green(this.bgColour), 21, 2.5);
        let colB = this.waveColor(noiseVal, blue(this.bgColour), 40, 3.0);

        // Apply the calculated colour to each pixel within the current step
        for (let dx = 0; dx < this.step; dx++) {
          for (let dy = 0; dy < this.step; dy++) {
            let px = x + dx;
            let py = y + dy;

            // Ensure stay within canvas boundaries
            if (px < width && py < height) {

              // Calculate pixel array index
              let index = (px + py * width) * 4;

              // Set pixel colour channels (RGBA) based on calculated colour values and transparency
              this.waveLayer.pixels[index + 0] = colR;
              this.waveLayer.pixels[index + 1] = colG;
              this.waveLayer.pixels[index + 2] = colB;
              this.waveLayer.pixels[index + 3] = this.transparency;
            }
          }
        }
      }
    }

    // Apply all changes to the pixels array
    this.waveLayer.updatePixels();
  }

  // Method to calculate the colour for wave effect based on distance and base colour from Kazuki Umeda
  waveColor(distance, base, a, e) {
    return constrain(base + Math.pow(distance / a, e), 0, 255); // Constrain result to valid colour range
  }

  // Method to display the generated ripple effect layer on the canvas
  display() {
    image(this.waveLayer, 0, 0);
  }
}
