# Individual Animation Using Perlin Noise 

## Interaction Instructions

The animation starts automatically once the page loads. The grid pattern at the pool bottom moves in sync with the water surface ripples, and the swimming rings float naturally on top without any user interaction required.

## Individual Approach to Animation

### 1. Selected Technique

In this project, I chose to use **Perlin noise** to drive the dynamic water ripple effect. Perlin noise provides smooth random values, which help create a natural wave motion that simulates realistic water surface movement.

### 2. Animation Properties

My implementation includes the following animated elements:
- Subtle distortion movement of the grid pattern at the pool bottom.
- Natural fluctuations of the water surface ripple.
- Floating motion of the swimming rings.

These elements together form a coherent, dynamic water pool effect with floating rings, creating a visually harmonious representation of a rippling water surface.

### 3. Inspiration

This animation was inspired by Japanese artist Kazuki Umeda’s Worley noise-based water effect code on Youtube ([Make Water Surface Effect in p5.js](https://www.youtube.com/watch?app=desktop&v=kUexPZMIwuA)). The original code used Worley noise for animation, but to meet assignment requirements, I modified it to use Perlin noise, aligning with the specified technique for this project.

Additionally, I applied similar noise-based animation techniques to two other key components in the group code—the pool grid and the floating rings—drawing inspiration solely from the natural rippling effect observed in real swimming pools.

### 4. Technical Explanation

#### 4.1 Major Modifications
The main modification to the group code was integrating the three classes used to create swimming rings (`GradientRing`, `ConcentricCircles`, and `DecorativeCircleRing`) into a single `SwimRing` class. Initially, these classes were separated, but combining them allows for better management of each ring’s animation. This change addresses a foundational issue in the group code. By simply adding an `update` method to the `SwimRing` class, I can update the position of all elements within each swimming ring in one go.

#### 4.2 Tools and Techniques

In the grid distortion ripple effect, I chose to calculate the offsets for the four corners of each grid cell rather than calculating offsets for the horizontal and vertical lines. 

The reason for adjusting the four corners is to create a natural, wave-like appearance. When each corner moves independently, the entire cell stretches and compresses in response to the Perlin noise, simulating water surface distortion. This method avoids rigid, segmented movements that would occur if each line was individually distorted, resulting in smoother visual transitions between cells.

Additionally, I used concise JavaScript syntax, including `forEach` and arrow functions (`=>`), to efficiently iterate through and update each element. The `forEach()` method iterates over each element in the array, and the arrow function calls the appropriate method on each object. This approach improves code readability and maintainability.
