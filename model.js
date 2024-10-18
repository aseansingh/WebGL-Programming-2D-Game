// FileName:       model.js
// Programmer:     Anmol Singh
// Date:           07/28/2024
// Purpose:        This file defines the code for the WebGL 2 model.
//                 The model is all of the WebGL2 code that draws the graphics scene.

/* The Model class handles the game logic and manages the game state */

class Model {
    // Constructor for the Model class
    constructor() {
        // Colors are defined for stars (triangles) and obstacles (stars)
        this.colors = [
            [1, 0, 0, 1],  // Red
            [0, 1, 0, 1],  // Green
            [0, 0, 1, 1],  // Blue
            [1, 1, 0, 1],  // Yellow
            [1, 0, 1, 1]   // Magenta
        ];
        this.playerColor = [1, 0.5, 0, 1];  // Unique orange color for the player's triangle
        this.player = { x: 0, y: 0, size: 0.1, color: this.playerColor };     // Player object with initial position and size
        this.stars = [];         // Array to store stars (triangles) in the game
        this.obstacles = [];     // Array to store obstacles (stars) in the game
        this.createStars();      // Initialize the stars (triangles)
        this.createObstacles();  // Initialize the obstacles (stars)
        this.placePlayerSafely();  // Place the player at a safe starting position
        this.gameOver = false;    // Game over state
        this.win = false;         // Game win state
        this.timeLeft = 60; // Time left to collect all stars (triangles) within 60 seconds
        this.lostDueToObstacle = false;   // Flag to check if game is lost due to hitting an obstacle (star)
    }
    // To create stars (triangles) in the game
    createStars() {
        for (let i = 0; i < 10; i++) {
            let x, y, size = 0.05;    // Size of each star (triangle)
            let safe = false;
            while (!safe) {
                x = (Math.random() * (2 - size * 2)) - (1 - size);
                y = (Math.random() * (2 - size * 2)) - (1 - size);
                safe = true;
                // Ensure stars (triangles) do not overlap with obstacles (stars)
                for (let obstacle of this.obstacles) {
                    if (Math.hypot(x - obstacle.x, y - obstacle.y) < size + obstacle.size) {
                        safe = false;
                        break;
                    }
                }
            }
             // Added the star (triangle) to the stars (triangles) array
            this.stars.push({
                x: x,
                y: y,
                size: size,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }
    // To create obstacles (stars) in the game
    createObstacles() {
        for (let i = 0; i < 5; i++) {
            let x, y, size = 0.1;      // Size of each obstacle (star)
            let safe = false;
            while (!safe) {
                x = (Math.random() * (2 - size * 2)) - (1 - size);
                y = (Math.random() * (2 - size * 2)) - (1 - size);
                safe = true;
                // To ensure obstacles (stars) do not overlap with stars (triangles)
                for (let star of this.stars) {
                    if (Math.hypot(x - star.x, y - star.y) < size + star.size) {
                        safe = false;
                        break;
                    }
                }
            }
            // Added the obstacle (star) to the obstacles (stars) array
            this.obstacles.push({
                x: x,
                y: y,
                size: size,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }
    // To place the player at a safe starting position
    placePlayerSafely() {
        let safe = false;
        while (!safe) {
            this.player.x = Math.random() * 2 - 1;
            this.player.y = Math.random() * 2 - 1;
            safe = true;
            // To ensure the player does not start inside an obstacle (star)
            for (let obstacle of this.obstacles) {
                if (Math.hypot(this.player.x - obstacle.x, this.player.y - obstacle.y) < this.player.size + obstacle.size) {
                    safe = false;
                    break;
                }
            }
        }
    }
    // To update the player's position
    updatePlayerPosition(dx, dy) {
        if (this.gameOver) return;

        // Calculate new position with boundaries of the game
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        const halfSize = this.player.size / 2;

        // Check horizontal boundaries
        if (newX - halfSize < -1) this.player.x = -1 + halfSize;
        else if (newX + halfSize > 1) this.player.x = 1 - halfSize;
        else this.player.x = newX;

        // Check vertical boundaries
        if (newY - halfSize < -1) this.player.y = -1 + halfSize;
        else if (newY + halfSize > 1) this.player.y = 1 - halfSize;
        else this.player.y = newY;

        this.checkCollisions();     // Check for collisions with stars (triangles) and obstacles (stars)
    }
    // Check for collisions
    checkCollisions() {
        // Check collision with stars (triangles)
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            if (Math.hypot(this.player.x - star.x, this.player.y - star.y) < this.player.size + star.size) {
                this.stars.splice(i, 1);  // Remove star (triangle) if collided
                break;
            }
        }

        // Check collision with obstacles (stars)
        for (let obstacle of this.obstacles) {
            if (Math.hypot(this.player.x - obstacle.x, this.player.y - obstacle.y) < this.player.size + obstacle.size) {
                this.gameOver = true;   // End the game
                this.win = false;
                this.lostDueToObstacle = true;
                return;
            }
        }
        // Check if all stars (triangles) have been collected
        if (this.stars.length === 0) {
            this.win = true;
            this.gameOver = true;
        }
    }
     // To update the game timer
    updateTime(deltaTime) {
        if (this.gameOver) return;

        this.timeLeft -= deltaTime;    // To decrease the remaining time
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.gameOver = true;
            this.win = false;
        }
    }
}