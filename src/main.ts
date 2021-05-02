import Game from "./Wolfie2D/Loop/Game";
import Splash from "./Twin/Scenes/Screens/Splash";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main() {
  // Run any tests
  runTests();

  // Set up options for our game
  let options = {
    canvasSize: { x: 1200, y: 800 }, // The size of the game
    clearColor: { r: 0, g: 0, b: 0 }, // The color the game clears to
    inputs: [
      { name: "left", keys: ["a"] },
      { name: "right", keys: ["d"] },
      { name: "jump", keys: ["w", "space"] },
      { name: "run", keys: ["shift"] },
      { name: "restart", keys: ["r"] },
      { name: "swap view", keys: ["v"] }, 
      { name: "pause", keys: ["escape", "p"] },
      { name: "interact", keys: ["e"] },
      // Cheat codes
      { name: "change control", keys: ["c"] }, // temporarily freezes one of the characters
      { name: "unlock", keys: ["u"] }, // unlocks all levels
      { name: "invincible", keys: ["i"] }, // make both players invincible
    ],
    useWebGL: false, // Tell the game we want to use webgl
    showDebug: false, // Whether to show debug messages. You can change this to true if you want
  };

  // Create a game with the options specified
  const game = new Game(options);

  // Start our game
  game.start(Splash, {});
})();

function runTests() {}
