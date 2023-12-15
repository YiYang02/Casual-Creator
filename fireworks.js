int numFireworks = 0;
int currentFirework = 0;
boolean isPaused = false;
boolean isDrawingMode = false;

ArrayList<Firework> fireworks;
ArrayList<PVector> designPoints; // To store user's drawing

// Firework settings
color currentColor = color(255, 0, 0); // Default color
float fireworkSize = 8; // Default size

final int MAX_FIREWORKS = 35; // Adjust this number based on performance

void setup() {
    size(1280, 720, P3D);
    background(0);
    fireworks = new ArrayList<Firework>();
		designPoints = new ArrayList<PVector>();
}

void keyPressed() {
    if (key == ' ') {
        isPaused = !isPaused; // Toggle pause
    }
	
		if (key == 'R' || key == 'r') {
        isDrawingMode = false; // Toggle drawing mode
    }
	
		if (key == 'D' || key == 'd') {
        if (isDrawingMode) {
            // Clear the current design
            designPoints.clear();
        } else {
            // Switch back to drawing mode
            isDrawingMode = true;
        }
    }
    // Size adjustment
    if (key == '+') fireworkSize = min(fireworkSize + 1, 20); // Increase size, with a max limit
    if (key == '-') fireworkSize = max(fireworkSize - 1, 1);  // Decrease size, with a min limit
}


void displayInstructions() {
    fill(255);
    if (isDrawingMode) {
        text("Draw your design. Press 'R' to switch to firework mode, 'D' to clear", 10, 20);
    } else {
        text("Press 'D' to go back to drawing mode, +/- for size, Space to pause", 10, 20);
    }
}


void draw() {
		if (isDrawingMode) {
        // Drawing mode: capture user's drawing
        if (mousePressed) {
            designPoints.add(new PVector(mouseX, mouseY));
        }
        // Display the points as the user is drawing
        background(0);
        stroke(255); // Set stroke color for the ellipses
        noFill(); // No fill for the ellipses
        for (PVector point : designPoints) {
            ellipse(point.x, point.y, 2, 2); // Draw a small ellipse at each point
        }
		}
    else {
				if (!isPaused) {
						background(0);
						displayInstructions();

						// Add a new firework where the mouse is clicked, but only if we haven't reached the max
						if (mousePressed && fireworks.size() < MAX_FIREWORKS) {
								Firework newFirework = new Firework(mouseX, mouseY, currentColor, fireworkSize, designPoints);
                fireworks.add(newFirework);
						}

						for (int i = 0; i < fireworks.size(); i++) {
								Firework f = fireworks.get(i);
								f.updateAndDisplay();

								if (f.isFinished()) {
										fireworks.remove(i);
										i--; // Adjust the index after removal
								}
						}
				}
		}
}


class Particle {
		float myRed, myGreen, myBlue;
    PVector position;
    PVector velocity;
    float lifespan = 255;

    Particle(float x, float y, float red, float green, float blue, PVector direction) {
        this.position = new PVector(x, y);
        if (direction != null) {
            // Use the provided direction
            this.velocity = direction;
        } else {
            // Default to random direction if none provided
            this.velocity = PVector.random2D();
            this.velocity.mult(random(1, 6)); // Randomize speed
        }
        this.myRed = red;
        this.myGreen = green;
        this.myBlue = blue;
    }

    void update() {
        position.add(velocity);
        lifespan -= 4; // Particles slowly fade out
    }

    void display() {
        noStroke();
        fill(myRed, myGreen, myBlue, lifespan); // Use assigned colors
        ellipse(position.x, position.y, 4, 4); // Small particle size
    }

    boolean isDead() {
        return lifespan < 0;
    }
}

class Firework {
		float myRed, myGreen, myBlue;
    float x, y;
    boolean exploded = false;
    ArrayList<Particle> particles;
    ArrayList<PVector> designPoints;

    Firework(float x, float y, color c, float size, ArrayList<PVector> design) {
        this.x = x;
        this.y = y;
        myRed = random(100, 255);
        myGreen = random(100, 255);
        myBlue = random(100, 255);
        this.fireworkSize = size;
        particles = new ArrayList<Particle>();
        this.designPoints = new ArrayList<PVector>(design); // Make a copy of the design points
    }


		void explode() {
				if (!designPoints.isEmpty()) {
						// Determine scale or translation needed to fit the design into the explosion
						float scaleFactor = 1; // Determine a suitable scale factor
						PVector explosionCenter = new PVector(this.x, this.y); // Center of the explosion

						for (PVector point : designPoints) {
								// Scale and translate the design point
								PVector transformedPoint = new PVector(point.x * scaleFactor, point.y * scaleFactor);
								transformedPoint.add(explosionCenter);
								PVector direction = PVector.sub(point, new PVector(this.x, this.y));
								direction.normalize(); // Normalize to get the direction
								direction.mult(random(1, 6)); // Apply a random speed
								// Create a particle at the transformed point
            		particles.add(new Particle(this.x, this.y, myRed, myGreen, myBlue, direction));
						}
				} else {
						// Default explosion pattern
						for (int i = 0; i < 50; i++) {
            		particles.add(new Particle(this.x, this.y, myRed, myGreen, myBlue, null)); // No direction provided
						}
				}
				exploded = true;
		}



    void updateAndDisplay() {
        if (!exploded) {
            y -= 2; // Move upwards
            ellipse(x, y, 8, 8); // Display firework shell
            if (y < height / 2) {
                explode();
            }
        } else {
            for (int i = particles.size() - 1; i >= 0; i--) {
                Particle p = particles.get(i);
                p.update();
                p.display();
                if (p.isDead()) {
                    particles.remove(i);
                }
            }
        }
    }

		boolean isFinished() {
				return exploded && particles.isEmpty();
		}
}


