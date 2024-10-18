The HTML code necessary to run the WebGL 2D Game.
I have made an attempt to separate the parts of the program using the 
Model-View-Controller design pattern. The model.js, view.js, and controller.js 
files define the code for those components respectively. I have also tried
to introduce the gl-matrix library and also defined the vertex and fragment shader 
code in this file. In the controller handles and responds to user triggered events and the Controller class handles the game logic and user interactions and it also 
manages the Model and View components and sets up the game loop. In the model is all of the WebGL2 code that draws the graphics scene. The Model class handles the game logic 
and manages the game state. The "view" is our graphics area (i.e. the "canvas").
The View class handles the rendering of the game objects and the display of the timer.
