import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Input from "../../../../Wolfie2D/Input/Input";
import GameNode, {
  TweenableProperties,
} from "../../../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../../../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../../../Wolfie2D/Scene/Scene";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import Color from "../../../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../../../Wolfie2D/Utils/EaseFunctions";
import EnemyController from "../../../Enemies/EnemyController";
import { Events } from "../../../Enums/EventEnums";
import PlayerController from "../../../Player/PlayerController";
import { PlayerTypes } from "../../Enums/PlayerEnums";
import { ScreenTexts } from "../../Enums/ScreenTextEnums";
import PauseTracker from "../../SceneHelpers/PauseTracker";
import SceneOptions from "../../SceneHelpers/SceneOptions";

// After you update a level files, replace the "tilesets" section with this:

/*
  
"tilesets":[
       {
        "columns":16,
        "firstgid":1,
        "image":"Twin-Tilemap.png",
        "imageheight":256,
        "imagewidth":256,
        "margin":0,
        "name":"Twin-Tilemap_tileset",
        "spacing":0,
        "tilecount":256,
        "tileheight":16,
        "tilewidth":16
       }],

*/

export default class GameLevel extends Scene {
  // Every level will have a player, which will be an animated sprite
  protected playerSpawn: Vec2;
  protected player: AnimatedSprite;

  // Every level will have a ghost player, which will be an animated sprite
  protected ghostPlayerSpawn: Vec2;
  protected ghostPlayer: AnimatedSprite;

  // Labels for the UI
  protected static coinCount: number = 0;
  protected coinCountLabel: Label;

  // Stuff to end the level and go to the next level
  protected levelEndArea: Rect;
  protected nextLevel: new (...args: any) => GameLevel;
  protected levelEndTimer: Timer;
  protected levelEndLabel: Label;

  // Screen fade in/out for level start and end
  protected levelTransitionTimer: Timer;
  protected levelTransitionScreen: Rect;

  // Variable to track levels. Used to track if game is paused
  protected currentLevel: new (...args: any) => GameLevel;
  protected pauseTracker: PauseTracker;

  // Game nodes that the viewport can follow
  protected followNodes: AnimatedSprite[];

  // Follow node index for viewport swapping between game characters
  private followNodeIndex: number;

  // Change controls index for controlling a single game character
  protected controlNodes: AnimatedSprite[][];
  private controlNodesIndex: number;

  // Exit variables
  protected levelEndAreas: { [character: string]: Rect };

  // Interactable variables
  protected interactables: Map<AnimatedSprite, string>;

  loadScene(): void {
    // load pause items
    this.load.object("Controls", "assets/texts/controls.json");
    this.load.object("Help", "assets/texts/help.json");
    this.load.object("Credits", "assets/texts/credits.json");
  }

  startScene(): void {
    // Do the game level standard initializations
    this.initLayers();
    this.initViewport();
    this.initPlayer();
    this.initGhostPlayer();
    this.subscribeToEvents();
    this.addUI();

    // Initialize the timers
    this.levelTransitionTimer = new Timer(500);
    this.levelEndTimer = new Timer(3000, () => {
      // After the level end timer ends, fade to black and then go to the next scene
      this.levelTransitionScreen.tweens.play("fadeIn");
    });

    // Start the black screen fade out
    this.levelTransitionScreen.tweens.play("fadeOut");

    // Initially disable player movement
    Input.disableInput();

    // Twin game specific supported initializations
    this.initPauseTracker();
    this.initViewportFollow();
    this.initControlNodes(); // debugging
    this.initLevelEndAreas();

    // Initialize interactables list
    this.interactables = new Map();
  }

  protected initLayers(): void {
    // Add a layer behind the tilemap for coinblock animation
    this.addLayer("coinLayer", -50);

    // Add a layer for UI
    this.addUILayer("UI");

    // Add a layer for players and enemies
    this.addLayer("primary", 1);

    // Add a layer for pause
    this.addUILayer("pause");
  }

  protected initViewport(): void {
    // this.viewport.enableZoom();
    this.viewport.setZoomLevel(2);
  }

  protected subscribeToEvents() {
    this.receiver.subscribe([
      Events.PLAYER_HIT_COIN,
      Events.PLAYER_HIT_COIN_BLOCK,
      Events.PLAYER_HIT_ENEMY,
      Events.ENEMY_DIED,
      Events.PLAYER_ENTERED_LEVEL_END,
      Events.LEVEL_START,
      Events.LEVEL_END,
      Events.PLAYER_FLIPPED_LEVER_ON,
      Events.PLAYER_FLIPPED_LEVER_OFF,
      Events.PLAYER_HIT_SPIKE,
    ]);
  }

  protected addUI() {
    // Twin TODO (optional) - make this more modular: repeated code
    // In-game labels
    // Coin label
    this.coinCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {
      position: new Vec2(80, 30),
      text: ScreenTexts.COINS + " " + GameLevel.coinCount,
    });
    this.coinCountLabel.textColor = Color.WHITE;
    this.coinCountLabel.font = "Squarely";
    this.coinCountLabel.fontSize = 40;
    this.coinCountLabel.padding = new Vec2(10, 5);
    this.coinCountLabel.backgroundColor = new Color(0, 0, 0, 0.9);

    // End of level label (start off screen)
    this.levelEndLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {
      position: new Vec2(-300, 200),
      text: ScreenTexts.LEVEL_COMPLETE,
    });
    this.levelEndLabel.size.set(1200, 60);
    this.levelEndLabel.borderRadius = 0;
    this.levelEndLabel.backgroundColor = new Color(34, 32, 52);
    this.levelEndLabel.textColor = Color.WHITE;
    this.levelEndLabel.fontSize = 48;
    this.levelEndLabel.font = "Squarely";

    // Add a tween to move the label on screen
    this.levelEndLabel.tweens.add("slideIn", {
      startDelay: 0,
      duration: 1000,
      effects: [
        {
          property: TweenableProperties.posX,
          start: -300,
          end: 300,
          ease: EaseFunctionType.OUT_SINE,
        },
      ],
    });

    this.levelTransitionScreen = <Rect>this.add.graphic(
      GraphicType.RECT,
      "UI",
      {
        position: new Vec2(300, 200),
        size: new Vec2(600, 400),
      }
    );
    this.levelTransitionScreen.color = new Color(34, 32, 52);
    this.levelTransitionScreen.alpha = 1;

    this.levelTransitionScreen.tweens.add("fadeIn", {
      startDelay: 0,
      duration: 1000,
      effects: [
        {
          property: TweenableProperties.alpha,
          start: 0,
          end: 1,
          ease: EaseFunctionType.IN_OUT_QUAD,
        },
      ],
      onEnd: Events.LEVEL_END,
    });

    this.levelTransitionScreen.tweens.add("fadeOut", {
      startDelay: 0,
      duration: 1000,
      effects: [
        {
          property: TweenableProperties.alpha,
          start: 1,
          end: 0,
          ease: EaseFunctionType.IN_OUT_QUAD,
        },
      ],
      onEnd: Events.LEVEL_START,
    });
  }

  protected initPlayer(): void {
    // Add the player
    this.player = this.add.animatedSprite(PlayerTypes.PLAYER, "primary");
    this.player.scale.set(2, 2);
    if (!this.playerSpawn) {
      console.warn("Player spawn was never set - setting spawn to (0, 0)");
      this.playerSpawn = Vec2.ZERO;
    }

    // Spawn location
    this.player.position.copy(this.playerSpawn);

    this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(16, 16)));
    this.player.addAI(PlayerController, {
      playerType: "platformer",
      tilemap: "Main",
      characterType: "body",
      JUMP_HEIGHT: -350,
      fallFactor: 1.0,
    });

    // Add triggers on colliding with coins or coinBlocks
    this.player.setGroup(PlayerTypes.PLAYER);
  }

  protected initGhostPlayer(): void {
    // Add the ghost player
    this.ghostPlayer = this.add.animatedSprite(
      PlayerTypes.GHOST_PLAYER,
      "primary"
    );
    this.ghostPlayer.scale.set(2, 2);
    if (!this.ghostPlayerSpawn) {
      console.warn(
        "Ghost player spawn was never set - setting spawn to (0, 0)"
      );
      this.ghostPlayerSpawn = Vec2.ZERO;
    }

    // Spawn location
    this.ghostPlayer.position.copy(this.ghostPlayerSpawn);

    this.ghostPlayer.addPhysics(new AABB(Vec2.ZERO, new Vec2(16, 16)));
    this.ghostPlayer.addAI(PlayerController, {
      playerType: "platformer",
      tilemap: "Main",
      characterType: "soul",
      JUMP_HEIGHT: -450,
      fallFactor: 0.9,
    });

    // Add triggers on colliding with coins or coinBlocks
    this.ghostPlayer.setGroup(PlayerTypes.GHOST_PLAYER);
  }

  private initPauseTracker(): void {
    this.pauseTracker = new PauseTracker(
      this,
      this.viewport,
      this.layers,
      this.sceneManager
    );
  }

  private initViewportFollow(): void {
    // Define nodes that the viewport can follow
    this.followNodes = [];
    this.followNodes.push(this.player);
    this.followNodes.push(this.ghostPlayer);

    // Initialize follow node index for viewport following
    this.followNodeIndex = 0;
    this.viewport.follow(this.followNodes[this.followNodeIndex]);
  }

  private initControlNodes(): void {
    this.controlNodes = [];
    this.controlNodes.push([this.player, this.ghostPlayer]);
    this.controlNodes.push([this.player]);
    this.controlNodes.push([this.ghostPlayer]);
    this.controlNodesIndex = 0;
  }

  private initLevelEndAreas(): void {
    this.levelEndAreas = {};
  }

  updateScene(deltaT: number) {
    this.handleInputs(deltaT);
    this.handleEvents(deltaT);

    // If player falls into a pit, kill them off and reset their position
    if (
      this.player.position.y > 100 * 64 ||
      this.ghostPlayer.position.y > 100 * 64
    ) {
      this.respawnPlayer();
    }
  }

  /**
   * Handle the player making inputs
   * Game inputs: swap views, restart, pause
   * Debug inputs: change control nodes
   * Level inputs: interact
   * @param deltaT
   */
  private handleInputs(deltaT: number): void {
    // Game inputs
    this.handleInputSwapView();
    this.handleInputRestart();
    this.handleInputPause();

    // Debug input
    this.handleInputChangeControls();

    // Send an input to interact with an object if the E key is pressed.
    if (Input.isJustPressed("interact")) {
      // Check and see if the player or ghost player are overlapping any interactable objects.
      this.interactables.forEach((value: string, key: AnimatedSprite) => {
        if (
          this.player.boundary.overlaps(key.boundary) ||
          this.ghostPlayer.boundary.overlaps(key.boundary)
        ) {
          this.handlePlayerFlippingLever(key);
        }
      });
    }
  }

  private handleInputSwapView(): void {
    if (Input.isJustPressed("swap view")) {
      this.followNodeIndex++;
      this.followNodeIndex = this.followNodeIndex % this.followNodes.length;
      this.viewport.follow(this.followNodes[this.followNodeIndex]);
    }
  }

  private handleInputRestart(): void {
    if (Input.isJustPressed("restart")) {
      this.respawnPlayer();
    }
  }

  private handleInputPause(): void {
    if (Input.isJustPressed("pause")) {
      this.pauseTracker.toggle();
    }
  }

  private handleInputChangeControls(): void {
    // change character control input
    if (Input.isJustPressed("change control")) {
      // Freeze all nodes
      this.controlNodes[0].forEach((node) => {
        if (!node.frozen) {
          node.freeze();
        }
      });

      // Unfreeze nodes in the array
      this.controlNodesIndex++;
      this.controlNodesIndex =
        this.controlNodesIndex % this.controlNodes.length;
      this.controlNodes[this.controlNodesIndex].forEach((node) => {
        if (node.frozen) {
          node.unfreeze();
        }
      });
    }
  }

  /**
   * Handle events and update the UI if needed
   * @param deltaT
   */
  private handleEvents(deltaT: number): void {
    // ZHEN TODO - split up and add more events for the game
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();

      switch (event.type) {
        case Events.PLAYER_HIT_COIN:
          {
            this.handleEventPlayerHitCoin(deltaT, event);
          }
          break;

        case Events.PLAYER_HIT_COIN_BLOCK:
          {
            this.handleEventPlayerHitCoinBlock(deltaT, event);
          }
          break;

        case Events.PLAYER_HIT_ENEMY:
          {
            this.handleEventPlayerHitEnemy(deltaT, event);
          }
          break;

        case Events.PLAYER_FLIPPED_LEVER_ON:
          {
            this.handleEventPlayerFlippedLeverOn(deltaT, event);
          }
          break;

        case Events.PLAYER_FLIPPED_LEVER_OFF:
          {
            this.handleEventPlayerFlippedLeverOff(deltaT, event);
          }
          break;

        case Events.PLAYER_HIT_SPIKE:
          {
            this.handleEventPlayerHitSpike(deltaT, event);
          }
          break;

        case Events.ENEMY_DIED:
          {
            this.handleEventEnemyDied(deltaT, event);
          }
          break;

        case Events.PLAYER_ENTERED_LEVEL_END:
          {
            this.handleEventPlayerEnteredLevelEnd(deltaT, event);
          }
          break;

        case Events.LEVEL_START:
          {
            this.handleEventLevelStart(deltaT, event);
          }
          break;

        case Events.LEVEL_END:
          {
            this.handleEventLevelEnd(deltaT, event);
          }
          break;
      }
    }
  }

  private handleEventPlayerHitCoin(deltaT: number, event: GameEvent): void {
    // Hit a coin
    let coin;
    if (
      event.data.get("node") === this.player.id ||
      event.data.get("node") === this.ghostPlayer.id
    ) {
      // Other is coin, disable
      coin = this.sceneGraph.getNode(event.data.get("other"));
    } else {
      // Node is coin, disable
      coin = this.sceneGraph.getNode(event.data.get("node"));
    }

    // Remove from physics and scene
    coin.active = false;
    coin.visible = false;

    // Increment our number of coins
    this.incPlayerCoins(1);
  }

  private handleEventPlayerHitCoinBlock(
    deltaT: number,
    event: GameEvent
  ): void {
    // Hit a coin block, so increment our number of coins
    this.incPlayerCoins(1);
  }

  private handleEventPlayerHitEnemy(deltaT: number, event: GameEvent): void {
    let node = this.sceneGraph.getNode(event.data.get("node"));
    let other = this.sceneGraph.getNode(event.data.get("other"));

    if (node === this.player || node === this.ghostPlayer) {
      // Node is player, other is enemy
      this.handlePlayerEnemyCollision(
        <AnimatedSprite>node,
        <AnimatedSprite>other
      );
    } else {
      // Other is player, node is enemy
      this.handlePlayerEnemyCollision(
        <AnimatedSprite>other,
        <AnimatedSprite>node
      );
    }
  }

  private handleEventPlayerFlippedLeverOn(
    deltaT: number,
    event: GameEvent
  ): void {
    // There are no built-in filtering functions for Maps so we have to do this bad code :(
    this.interactables.forEach((value: string, key: AnimatedSprite) => {
      if (value === "on") {
        key.imageOffset = new Vec2(16, 0);
      }
    // Switch blocks
    });
  }

  private handleEventPlayerFlippedLeverOff(
    deltaT: number,
    event: GameEvent
  ): void {
    // There are no built-in filtering functions for Maps so we have to do this bad code :(
    this.interactables.forEach((value: string, key: AnimatedSprite) => {
      if (value === "off") {
        key.imageOffset = new Vec2(0, 0);
      }
      // Switch blocks
    });
  }

  private handleEventPlayerHitSpike(deltaT: number, event: GameEvent): void {
    this.respawnPlayer();
  }

  private handleEventEnemyDied(deltaT: number, event: GameEvent): void {
    // An enemy finished its dying animation, hide it
    let node = this.sceneGraph.getNode(event.data.get("owner"));
    node.visible = false;
  }

  private handleEventPlayerEnteredLevelEnd(
    deltaT: number,
    event: GameEvent
  ): void {
    // Determines if both characters are colliding with exit
    if (!this.isLevelComplete()) {
      return;
    }

    // Only progress when interact [e] is pressed, do nothing otherwise
    if (!Input.isJustPressed("interact")) {
      return;
    }

    if (!this.levelEndTimer.hasRun() && this.levelEndTimer.isStopped()) {
      // The player has reached the end of the level
      this.levelEndTimer.start();
      this.levelEndLabel.tweens.play("slideIn");
    }
  }

  private handleEventLevelStart(deltaT: number, event: GameEvent): void {
    // Re-enable controls
    console.log("Enabling input");
    Input.enableInput();
  }

  private handleEventLevelEnd(deltaT: number, event: GameEvent): void {
    // Go to the next level
    if (this.nextLevel) {
      console.log("Going to next level!");
      let sceneOptions = SceneOptions.getSceneOptions();
      this.sceneManager.changeToScene(this.nextLevel, {}, sceneOptions);
    }
  }

  protected addEnemy(
    spriteKey: string,
    tilePos: Vec2,
    aiOptions: Record<string, any>
  ): void {
    let enemy = this.add.animatedSprite(spriteKey, "primary");
    enemy.position.set(tilePos.x * 32, tilePos.y * 32);
    enemy.scale.set(2, 2);
    enemy.addPhysics();
    enemy.addAI(EnemyController, aiOptions);
    enemy.setGroup("enemy");
    enemy.setTrigger(PlayerTypes.PLAYER, Events.PLAYER_HIT_ENEMY, null);
    enemy.setTrigger(PlayerTypes.GHOST_PLAYER, Events.PLAYER_HIT_ENEMY, null);
  }

  // Use this function to create stationary interactable objects.
  protected addInteractable(spriteKey: string, tilePos: Vec2): void {
    let interactable = this.add.animatedSprite(spriteKey, "primary");
    interactable.position.set(tilePos.x * 32 + 16, tilePos.y * 32 + 16);
    interactable.scale.set(2, 2);
    this.interactables.set(interactable, "off");
  }

  protected handlePlayerEnemyCollision(
    player: AnimatedSprite,
    enemy: AnimatedSprite
  ) {
    // Get the vector of the direction from the player to the enemy
    let dir = player.position.dirTo(enemy.position);

    if ((<EnemyController>enemy.ai).jumpy) {
      // If it's a jumpy enemy, we want to hit it from the bottom
      if (dir.dot(Vec2.UP) > 0.5) {
        enemy.disablePhysics();
        enemy.tweens.stopAll();
        enemy.animation.play("DYING", false, Events.ENEMY_DIED);

        // Stop the player's jump for some feedback
        (<PlayerController>player.ai).velocity.y = 0;
      } else {
        this.respawnPlayer();
      }
    } else {
      // If not, we want to hit it from the top
      if (dir.dot(Vec2.DOWN) > 0.5) {
        enemy.disablePhysics();
        enemy.animation.play("DYING", false, Events.ENEMY_DIED);

        // Give the player a slight jump boost
        let playerVel = (<PlayerController>player.ai).velocity;
        if (playerVel.y < 0) {
          // We're going up - unlikely, but still check
          playerVel.y += 0.2 * (<PlayerController>player.ai).velocity.y;
        } else {
          // We're going down, invert our bounce, but dampen it
          playerVel.y = -0.5 * (<PlayerController>player.ai).velocity.y;
        }
      } else {
        this.respawnPlayer();
      }
    }
  }

  protected handlePlayerFlippingLever(interactable: AnimatedSprite) {
    if (this.interactables.get(interactable) === "off") {
      // Do the lever flip animation
      this.interactables.set(interactable, "on");
      interactable.animation.play(
        "on",
        undefined,
        Events.PLAYER_FLIPPED_LEVER_ON
      );
    } else {
      // Do the lever flip animation
      this.interactables.set(interactable, "off");
      interactable.imageOffset = new Vec2(0, 0);
      interactable.animation.play(
        "off",
        undefined,
        Events.PLAYER_FLIPPED_LEVER_OFF
      );
    }
  }

  /**
   * Determines if the player can progress to the next level
   * @returns boolean true if exit condition is met
   */
  protected isLevelComplete(): boolean {
    let playerOverlap = this.player.boundary.overlaps(
      this.levelEndAreas[PlayerTypes.PLAYER].boundary
    );
    let ghostPlayerOverlap = this.ghostPlayer.boundary.overlaps(
      this.levelEndAreas[PlayerTypes.GHOST_PLAYER].boundary
    );
    return playerOverlap && ghostPlayerOverlap;
  }

  protected incPlayerCoins(amt: number): void {
    GameLevel.coinCount += amt;
    this.coinCountLabel.text = ScreenTexts.COINS + " " + GameLevel.coinCount;
  }

  protected respawnPlayer(): void {
    this.player.position.copy(this.playerSpawn);
    this.ghostPlayer.position.copy(this.ghostPlayerSpawn);
  }

  unloadScene(): void {
    // Reset zoom level. Only game levels have a zoom level of 2.
    this.viewport.setZoomLevel(1);
  }

  /****** PUBLIC METHODS ******/

  /*** Adders ***/
  public addExit(startingTile: Vec2, size: Vec2, group: string): void {
    this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, "primary", {
      position: startingTile,
      size: size,
    });
    this.levelEndArea.addPhysics(undefined, undefined, false, true);
    this.levelEndArea.setTrigger(group, Events.PLAYER_ENTERED_LEVEL_END, null);
    this.levelEndAreas[group] = this.levelEndArea;

    // Set colors to be different for testing purposes: can be alpha overlay later
    if (group === PlayerTypes.PLAYER) this.levelEndArea.color = Color.GREEN;
    if (group === PlayerTypes.GHOST_PLAYER)
      this.levelEndArea.color = Color.MAGENTA;
  }

  /*** Setters ***/
  /**
   * Set player's spawn location
   * @param location Player spawn location
   * @param move Whether to move the player to the new spawn location
   */
  public setPlayerSpawn(location: Vec2, move?: boolean): void {
    this.playerSpawn = location;
    if (move) {
      this.player.position.copy(this.playerSpawn);
    }
  }

  /**
   * Set ghost player's spawn location
   * @param location Player spawn location
   * @param move Whether to move the player to the new spawn location
   */
  public setGhostPlayerSpawn(location: Vec2, move?: boolean): void {
    this.ghostPlayerSpawn = location;
    if (move) {
      this.ghostPlayer.position.copy(this.ghostPlayerSpawn);
    }
  }
}
