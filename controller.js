// FileName:       controller.js
// Programmer:     Anmol Singh
// Date:           07/28/2024
// Purpose:        This file defines the code for controller.
//                 The controller handles and responds to user triggered events.

/* The Controller class handles the game logic and user interactions and it also 
   manages the Model and View components and sets up the game loop */

class Controller {
    // Constructor for the Controller class.
    constructor(model, view) {
        this.model = model;    // Game model  
        this.view = view;      // Game view  

        this.keyPresses = {};   // Object to track the state of key presses
        this.lastTime = 0;      // Timestamp is used for the last frame

        // Event listeners for key presses
        window.addEventListener('keydown', (event) => this.keyPresses[event.key] = true);
        window.addEventListener('keyup', (event) => this.keyPresses[event.key] = false);
    }
    // To start the game with rules and instructions 
    startGame() {
        const rules = `Welcome to the Triangle Collection Game!

Rules:
1. You control the unique orange triangle with a small tail.
2. Use the arrow keys to move your triangle.
3. Collect all the colored triangles within 60 seconds to win.
4. Avoid the colorful star-shaped obstacles.
5. If you hit an obstacle, you lose the game.

Good luck!`;

        alert(rules);               // The rules to show in alert box
        this.lastTime = performance.now();     // Record the start time
        this.updateGame();                   // Start the game loop
    }
     // To update the game state and render the scene
    updateGame() {
        const currentTime = performance.now();        // Get the current time
        const deltaTime = (currentTime - this.lastTime) / 1000; // Calculate the time difference and convert to seconds
        this.lastTime = currentTime;                  // Update the last frame time

        // Check if the game is over with messages to display game result
        if (this.model.gameOver) {
            if (this.model.win) {
                alert("Congratulations! You collected all the triangles and won the game!");
            } else if (this.model.lostDueToObstacle) {
                alert("Game Over! You hit an obstacle and lost the game.");
            } else {
                alert("Time's up! You didn't collect all the triangles in time.");
            }
            return;          // Exit the game loop
        }           

        // Update the game state with time elapsed
        this.model.updateTime(deltaTime);
        this.handleInput();                // To handle the player input

        // Debugging logs used for player position, stars, and obstacles
        console.log('Player position:', this.model.player.x, this.model.player.y);
        console.log('Stars count:', this.model.stars.length);
        console.log('Obstacles count:', this.model.obstacles.length);

        // Render the updated scene
        this.view.drawScene();

        // Request for the next animation frame to continue the game loop
        requestAnimationFrame(() => this.updateGame());
    }
        // To handle the player input
    handleInput() {
        const speed = 0.01;        // Speed of the player's movement
        // For the movement of the player based on arrow key presses
        if (this.keyPresses['ArrowUp']) this.model.updatePlayerPosition(0, speed);
        if (this.keyPresses['ArrowDown']) this.model.updatePlayerPosition(0, -speed);
        if (this.keyPresses['ArrowLeft']) this.model.updatePlayerPosition(-speed, 0);
        if (this.keyPresses['ArrowRight']) this.model.updatePlayerPosition(speed, 0);
    }
}