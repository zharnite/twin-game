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
import { Events } from "../../../Enums/EventEnums";
import Satan from "../../../Interactables/Satan";
import PlayerController from "../../../Player/PlayerController";
import { PlayerTypes } from "../../Enums/PlayerEnums";
import { InteractableTypes } from "../../Enums/InteractableEnums";
import { ScreenTexts } from "../../Enums/ScreenTextEnums";
import PauseTracker from "../../SceneHelpers/PauseTracker";
import SceneOptions from "../../SceneHelpers/SceneOptions";
import TerrainManager from "./LevelHelpers/TerrainManager";
import { GameEventType } from "../../../../Wolfie2D/Events/GameEventType";
import Level1 from "./Level1";
// import Level2 from "./Level2";
// import Level3 from "./Level3";
// import Level4 from "./Level4";
// import Level5 from "./Level5";
// import Level6 from "./Level6";
// import FinalLevel from "./FinalLevel";

export default class GameLevel extends Scene {
  // Every level will have a player, which will be an animated sprite
  protected playerSpawn: Vec2;
  protected player: AnimatedSprite;

  // Every level will have a ghost player, which will be an animated sprite
  protected ghostPlayerSpawn: Vec2;
  protected ghostPlayer: AnimatedSprite;
  protected playerIsDying = false;

  // Labels for the UI
  protected static coinCount: number = 0;
  protected coinCountLabel: Label;

  // Debug labels
  protected debugLabel: Label;
  protected playerIsInvincible: boolean;

  // Stuff to end the level and go to the next level
  protected nextLevel: new (...args: any) => GameLevel;
  protected levelEndTimer: Timer;
  protected levelEndLabel: Label;

  // Sprites for the end level portals
  protected bodyEndPortalSprite: AnimatedSprite;
  protected soulEndPortalSprite: AnimatedSprite;

  // Screen fade in/out for level start and end
  protected levelTransitionTimer: Timer;
  protected levelTransitionScreen: Rect;

  // Terrain manager
  protected terrainManager: TerrainManager;

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

  // Mr. Satan stuff
  protected satan: Satan;

  loadScene(): void {
    // load pause items
    this.load.object("Controls", "assets/texts/controls.json");
    this.load.object("Help", "assets/texts/help.json");
    this.load.object("Credits", "assets/texts/credits.json");
    // Load music
    this.load.audio("twinMusic", "assets/sounds/music/twinMusic.mp3");
    // Load SFX
    this.load.audio("boar", "assets/sounds/sfx/boar.mp3");
    this.load.audio("hellhawk", "assets/sounds/sfx/hellhawk.mp3");
    this.load.audio("coin", "assets/sounds/sfx/coinNoise.mp3");
    this.load.audio("jump", "assets/sounds/sfx/jump.mp3");
    this.load.audio("switchToHuman", "assets/sounds/sfx/switchToHuman.mp3");
    this.load.audio("switchToSoul", "assets/sounds/sfx/switchToSoul.mp3");
    this.load.audio("freeze", "assets/sounds/sfx/freeze.mp3");
    this.load.audio("levelEnd", "assets/sounds/sfx/levelEnd.mp3");
    this.load.audio("lever", "assets/sounds/sfx/lever.mp3");
    this.load.audio("pause", "assets/sounds/sfx/pause.mp3");
    this.load.audio("restart", "assets/sounds/sfx/restart.mp3")
    this.load.audio("playerDeath", "assets/sounds/sfx/death.mp3")
    this.load.audio("menuButton", "assets/sounds/sfx/menuButton.mp3");
  }

  startScene(): void {
    // Do the game level standard initializations
    this.initLayers();
    this.initViewport();
    this.initPlayer();
    this.initGhostPlayer();
    this.initInteractables();
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

    // Debugging
    this.initControlNodes();
    this.playerIsInvincible = false;

    GameLevel.coinCount = 0;

    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "menuButton", loop: false});

    // Scene has started, so start playing music
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "twinMusic", loop: true, holdReference: true});

    this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "startup"});
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
      Events.PLAYER_HIT_ENEMY,
      Events.PLAYER_HIT_COIN,
      Events.PLAYER_HIT_COIN_BLOCK,
      Events.ENEMY_DIED,
      Events.PLAYER_ENTERED_LEVEL_END,
      Events.LEVEL_START,
      Events.LEVEL_END,
      // Newly added
      Events.PLAYER_OVERLAPS_LEVER,
      Events.PLAYER_OVERLAPS_UNFREEZE,
      Events.PLAYER_OVERLAPS_PORTAL,
      Events.PLAYER_HIT_SPIKE,
      Events.PLAYER_HIT_TRAMPOLINE,
      Events.PLAYER_HIT_FREEZE,
      Events.PLAYER_ON_GROUND,
      Events.PLAYER_HIT_CEILING,
      Events.PLAYER_FINISHED_DYING,
    ]);
  }

  // Add in-game labels
  protected addUI() {
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

    // Debug label to display debug info.
    this.debugLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {
      position: new Vec2(80, 10),
      text: "",
    });
    this.debugLabel.textColor = Color.RED;
    this.debugLabel.font = "Squarely";
    this.debugLabel.fontSize = 30;
    this.debugLabel.backgroundColor = new Color(0, 0, 0, 0.9);

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

    this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(15, 15)));
    this.player.addAI(PlayerController, {
      playerType: "platformer",
      tilemap: "Main",
      characterType: "body",
      JUMP_HEIGHT: -350,
      fallFactor: 1.0,
    });

    // Add triggers on colliding with coins or coinBlocks
    this.player.setGroup(PlayerTypes.PLAYER);

    // Create player's dying tween.
    this.player.tweens.add("dying", {
      startDelay: 0,
      duration: 2000,
      effects: [
        {
          property: TweenableProperties.scaleX,
          start: 1,
          end: 0,
          ease: EaseFunctionType.PLAYER_DYING,
        },
      ],
      onEnd: Events.PLAYER_FINISHED_DYING,
    });
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

    this.ghostPlayer.addPhysics(new AABB(Vec2.ZERO, new Vec2(15, 15)));
    this.ghostPlayer.addAI(PlayerController, {
      playerType: "platformer",
      tilemap: "Main",
      characterType: "soul",
      JUMP_HEIGHT: -450,
      fallFactor: 0.9,
    });

    // Add triggers on colliding with coins or coinBlocks
    this.ghostPlayer.setGroup(PlayerTypes.GHOST_PLAYER);

    // Create player's dying tween.
    this.ghostPlayer.tweens.add("dying", {
      startDelay: 0,
      duration: 2000,
      effects: [
        {
          property: TweenableProperties.scaleX,
          start: 1,
          end: 0,
          ease: EaseFunctionType.PLAYER_DYING,
        },
      ],
      onEnd: Events.PLAYER_FINISHED_DYING,
    });
  }

  protected initInteractables(): void {
    // Initialize Mr. Satan variables that do not change from level to level (scale, sprite, physics, etc.).
    let satanSprite = this.add.animatedSprite(
      InteractableTypes.MR_SATAN,
      "primary"
    );
    satanSprite.scale.set(2, 2);
    satanSprite.addPhysics();
    satanSprite.disablePhysics();
    this.satan = new Satan("waiting", satanSprite, 0);
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
    this.handleInputInteract();

    // Inputs for debugging/testing
    this.handleInputChangeControls();
    this.handleInputToggleInvincibility();
    this.handleInputLevelSwapCheatCode();
  }

  private handleInputSwapView(): void {
    if (Input.isJustPressed("swap view")) {
      this.followNodeIndex++;
      this.followNodeIndex = this.followNodeIndex % this.followNodes.length;
      this.viewport.follow(this.followNodes[this.followNodeIndex]);
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
        key: (this.followNodes[this.followNodeIndex].imageId === "PlatformPlayer") ? "switchToHuman" : "switchToSoul", 
        loop: false
      });
    }
  }

  private handleInputRestart(): void {
    if (Input.isJustPressed("restart")) {
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "restart", loop: false});
      this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "twinMusic"});
      this.restartLevel();
    }
  }

  private handleInputPause(): void {
    if (Input.isJustPressed("pause")) {
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "pause", loop: false});
      let isPaused = this.pauseTracker.toggle();
      if (isPaused) {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "twinMusic"});
      }
      else {
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "twinMusic", loop: true, holdReference: true});
      }
    }
  }

  private handleInputInteract(): void {
    if (Input.isJustPressed("interact")) {
      if (
        this.player.boundary.overlaps(this.satan.sprite.boundary) ||
        this.ghostPlayer.boundary.overlaps(this.satan.sprite.boundary)
      ) {
        this.satanCoinCheck();
      }
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

  private handleInputToggleInvincibility(): void {
    if (Input.isJustPressed("invincible")) {
      this.playerIsInvincible = !this.playerIsInvincible;
      this.debugLabel.setText(
        this.playerIsInvincible ? "INVINCIBILITY ON" : ""
      );
    }
  }

  private handleInputLevelSwapCheatCode(): void {
    let sceneOptions = SceneOptions.getSceneOptions();
    if (Input.isKeyJustPressed("1")) {
      this.sceneManager.changeToScene(Level1, {}, sceneOptions);
    }
    // else if (Input.isKeyJustPressed("2")) {
    //   this.sceneManager.changeToScene(Level2, {}, sceneOptions);
    // }
    // else if (Input.isKeyJustPressed("3")) {
    //   this.sceneManager.changeToScene(Level3, {}, sceneOptions);
    // } else if (Input.isKeyJustPressed("4")) {
    //   this.sceneManager.changeToScene(Level4, {}, sceneOptions);
    // } else if (Input.isKeyJustPressed("5")) {
    //   this.sceneManager.changeToScene(Level5, {}, sceneOptions);
    // } else if (Input.isKeyJustPressed("6")) {
    //   this.sceneManager.changeToScene(Level6, {}, sceneOptions);
    // } else if (Input.isKeyJustPressed("7")) {
    //   this.sceneManager.changeToScene(FinalLevel, {}, sceneOptions);
    // }
  }

  /**
   * Handle events and update the UI if needed
   * @param deltaT
   */
  private handleEvents(deltaT: number): void {
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();

      switch (event.type) {
        case Events.PLAYER_HIT_ENEMY:
          {
            this.handleEventPlayerHitEnemy(deltaT, event);
          }
          break;

        case Events.PLAYER_FINISHED_DYING:
          {
            this.playerIsDying = false;
            this.player.scaleX = 2;
            this.ghostPlayer.scaleX = 2;
            this.player.unfreeze();
            this.ghostPlayer.unfreeze();
            this.respawnPlayer();
          }
          break;

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

        // Newly added
        case Events.PLAYER_OVERLAPS_LEVER:
          {
            this.handleEventPlayerOverlapsLever(deltaT, event);
          }
          break;
        case Events.PLAYER_OVERLAPS_UNFREEZE:
          {
            this.handleEventPlayerOverlapsUnfreeze(deltaT, event);
          }
          break;

        case Events.PLAYER_OVERLAPS_PORTAL:
          {
            this.handleEventPlayerOverlapsPortal(deltaT, event);
          }
          break;

        case Events.PLAYER_HIT_SPIKE:
          {
            this.handleEventPlayerHitSpike(deltaT, event);
          }
          break;
        case Events.PLAYER_HIT_FREEZE:
          {
            this.handleEventPlayerHitFreeze(deltaT, event);
          }
          break;
        case Events.PLAYER_HIT_TRAMPOLINE:
          {
            this.handleEventPlayerHitTrampoline(deltaT, event);
          }
          break;

        case Events.PLAYER_ON_GROUND:
          {
            this.handleEventPlayerOnGround(deltaT, event);
          }
          break;
        case Events.PLAYER_HIT_CEILING:
          {
            this.handleEventPlayerHitCeiling(deltaT, event);
          }
          break;
      }
    }
  }

  private handleEventPlayerHitEnemy(deltaT: number, event: GameEvent): void {
    let node = this.sceneGraph.getNode(event.data.get("node"));
    let other = this.sceneGraph.getNode(event.data.get("other"));

    // If the player is invincible (debug) or already dying, we don't want this function to trigger.
    if (this.playerIsDying || this.playerIsInvincible) {
      return;
    }

    if (node === this.player || node === this.ghostPlayer) {
      // Node is player, other is enemy
      this.playerDies(<AnimatedSprite>node, <AnimatedSprite>other);
    } else {
      // Other is player, node is enemy
      this.playerDies(<AnimatedSprite>other, <AnimatedSprite>node);
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
    // Get coin block indexes
    let coinBlocks = event.data.get("coinBlocks");

    // Set coin blocks to hit
    this.terrainManager.setCoinBlockAtIndexToHit(coinBlocks);

    // Play coin animation
    this.playCoinTween(coinBlocks);

    // Increment number of coins by number of coin blocks
    this.incPlayerCoins(coinBlocks.length);
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
    // Only progress when interact [e] is pressed, do nothing otherwise
    if (!Input.isJustPressed("interact")) {
      return;
    }

    // Determines if both characters are colliding with exit
    if (!this.isLevelComplete()) {
      return;
    }

    if (!this.levelEndTimer.hasRun() && this.levelEndTimer.isStopped()) {
      // The player has reached the end of the level
      this.levelEndTimer.start();
      this.levelEndLabel.tweens.play("slideIn");
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "levelEnd", loop: false});
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

  private handleEventPlayerOverlapsLever(
    deltaT: number,
    event: GameEvent
  ): void {
    // Only do things when interact [e] is pressed, do nothing otherwise
    if (!Input.isJustPressed("interact")) {
      return;
    }

    // Play lever interaction sound effect
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "lever", loop: false});

    // Get the node id (body or soul) which toggled the switch
    let id = event.data.get("node");

    // Get the lever that the player overlaps with
    let leverid = this.getOverlappingLever(id);

    // Toggle lever and doors
    this.terrainManager.toggleLever(id, leverid);
  }

  private handleEventPlayerOverlapsUnfreeze(
    deltaT: number,
    event: GameEvent
  ): void {
    // Only do things when interact [e] is pressed, do nothing otherwise
    if (!Input.isJustPressed("interact")) {
      return;
    }

    // get event info
    let node = event.data.get("node");
    let other = event.data.get("other");
    let unfreezeBlockID = node;
    if (node === this.player.id || node === this.ghostPlayer.id) {
      unfreezeBlockID = other;
    }

    // Don't handle event if this unfreeze block is already used
    if (this.terrainManager.isUnfreezeBlockUsed(unfreezeBlockID)) {
      return;
    }

    // turn of single use unfreeze block if applicable
    this.terrainManager.setUnfreezeBlockUsed(unfreezeBlockID);

    // unfreeze all players
    if (this.player.frozen) {
      this.player.unfreeze();
    }
    if (this.ghostPlayer.frozen) {
      this.ghostPlayer.unfreeze();
    }
  }

  private handleEventPlayerOverlapsPortal(
    deltaT: number,
    event: GameEvent
  ): void {
    // Only do things when interact [e] is pressed, do nothing otherwise
    if (!Input.isJustPressed("interact")) {
      return;
    }

    // get event info
    let node = event.data.get("node");
    let other = event.data.get("other");
    let blockID = node;
    let playerID = other;
    if (node === this.player.id || node === this.ghostPlayer.id) {
      blockID = other;
      playerID = node;
    }
    let player = this.sceneGraph.getNode(playerID);

    // get out portal world location
    let portalOutLocation = this.terrainManager.getOutPortalLocation(blockID);

    // teleport to correct location
    player.position.copy(portalOutLocation);
  }

  private handleEventPlayerHitSpike(deltaT: number, event: GameEvent): void {
    this.emitter.fireEvent(Events.PLAYER_HIT_ENEMY);
  }

  private handleEventPlayerHitFreeze(deltaT: number, event: GameEvent): void {
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "freeze", loop: false});
    let node = event.data.get("node");
    if (!node.frozen) {
      node.freeze();
    }
  }

  private handleEventPlayerHitTrampoline(
    deltaT: number,
    event: GameEvent
  ): void {
    let node = event.data.get("node");
    let pc = <PlayerController>node.ai;
    pc.velocity.y = pc.JUMP_HEIGHT * 2;
    if (node === this.ghostPlayer) {
      pc.velocity.y = pc.JUMP_HEIGHT * 5;
    }
  }

  private handleEventPlayerOnGround(deltaT: number, event: GameEvent): void {
    let node = this.sceneGraph.getNode(event.data.get("id"));

    // Spike block
    if (this.terrainManager.hitSpike(node.position, node.size, node.id)) {
      this.emitter.fireEvent(Events.PLAYER_HIT_SPIKE);
      return;
    }

    // Freeze block
    if (this.terrainManager.hitFreeze(node.position, node.size, node.id)) {
      this.emitter.fireEvent(Events.PLAYER_HIT_FREEZE, {
        node: node,
      });
      return;
    }

    // Trampoline block
    if (this.terrainManager.hitTrampoline(node.position, node.size, node.id)) {
      this.emitter.fireEvent(Events.PLAYER_HIT_TRAMPOLINE, {
        node: node,
      });
      return;
    }
  }

  private handleEventPlayerHitCeiling(deltaT: number, event: GameEvent): void {
    let node = this.sceneGraph.getNode(event.data.get("id"));

    // Get ceiling tiles
    let ceilingIndexes = this.terrainManager.getTileIndexesAboveAnyLocation(
      node.position,
      node.size
    );

    // Check if the ceilings are coin blocks
    let coinBlocks = this.terrainManager.indexesThatContainsCoinBlocks(
      ceilingIndexes
    );
    if (coinBlocks.length > 0) {
      this.emitter.fireEvent(Events.PLAYER_HIT_COIN_BLOCK, {
        coinBlocks: coinBlocks,
        node: node,
      });
    }
  }

  protected playerDies(player: AnimatedSprite, enemy: AnimatedSprite) {
    // Play the right enemy sound effect if the player died by an enemy.
    if (!(enemy.imageId === undefined)) {
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, 
        {key: (enemy.imageId === "Boar") ? "boar" : "hellhawk", 
        loop: false, 
        holdReference: false
      });
    }
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "playerDeath", loop: false, holdReference: false});
    this.playerIsDying = true;
    this.player.tweens.play("dying");
    this.ghostPlayer.tweens.play("dying");
    this.player.freeze();
    this.ghostPlayer.freeze();
  }

  protected incPlayerCoins(amt: number): void {
    GameLevel.coinCount += amt;
    this.coinCountLabel.text = ScreenTexts.COINS + " " + GameLevel.coinCount;
    // Play coin sound effect if you are gaining coins.
    if (amt > 0) {
      this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "coin", loop: false});
    }
  }

  // Check if the player has enough coins to open the level end portal.
  protected satanCoinCheck(): void {
    if (GameLevel.coinCount >= this.satan.getRequiredCoinValue()) {
      this.satan.sprite.animation.stop();
      this.satan.sprite.animation.play("SHOW_PORTAL");
      this.satan.sprite.animation.queue("IDLE");
      // For right now, he just opens up the soul portal. We can decide which portal we want him to open when we make the levels.
      this.soulEndPortalSprite.animation.stop();
      this.soulEndPortalSprite.animation.play("OPENING");
      this.soulEndPortalSprite.animation.queue("OPEN", true);
      this.incPlayerCoins(this.satan.getRequiredCoinValue() * -1);

      // allow player to exit
      this.terrainManager.setExitLocations(
        this.terrainManager.bodyExitLocation,
        this.terrainManager.soulExitLocation
      );
    } else {
      this.satan.sprite.animation.stop();
      this.satan.sprite.animation.play("RUBHANDS");
      this.satan.sprite.animation.queue("IDLE");
    }
  }

  protected respawnPlayer(): void {
    this.player.position.copy(this.playerSpawn);
    this.ghostPlayer.position.copy(this.ghostPlayerSpawn);
  }

  protected restartLevel(): void {
    GameLevel.coinCount = 0;
    this.sceneManager.changeToScene(
      this.currentLevel,
      {},
      SceneOptions.getSceneOptions()
    );
  }

  unloadScene(): void {
    // Reset zoom level. Only game levels have a zoom level of 2.
    this.viewport.setZoomLevel(1);
  }

  /****** ANIMATION/TWEEN METHODS ******/
  private playCoinTween(indexes: number[]): void {
    let coin = (<PlayerController>this.player.ai).coin;

    // animate each coin
    indexes.forEach((index) => {
      let position = this.terrainManager.getWorldLocationFromIndex(index);
      coin.tweens.add("found", {
        startDelay: 0,
        duration: 300,
        effects: [
          {
            property: TweenableProperties.alpha,
            start: 1,
            end: 0,
            ease: EaseFunctionType.IN_OUT_QUAD,
          },
          {
            property: TweenableProperties.posY,
            start: position.y,
            end: position.y - 70,
            ease: EaseFunctionType.OUT_SINE,
          },
        ],
      });
      coin.position.set(position.x, position.y);
      coin.tweens.play("found");
    });
  }

  /****** HELPER METHODS ******/

  protected getOverlappingLever(id: number): number {
    let keys = Object.keys(this.terrainManager.levelLeverAreas);
    let entity = this.getSceneGraph().getNode(id);
    let leverAreas = this.terrainManager.levelLeverAreas;

    // Find the lever id
    let leverid = null;
    for (let i = 0; i < keys.length; i++) {
      let key = parseInt(keys[i]);
      if (
        leverAreas[key] &&
        entity.boundary.overlaps(leverAreas[key].boundary)
      ) {
        leverid = key;
        break;
      }
    }

    return leverid;
  }

  /**
   * Determines if the player can progress to the next level
   * @returns boolean true if exit condition is met
   */
  protected isLevelComplete(): boolean {
    let playerOverlap = this.player.boundary.overlaps(
      this.terrainManager.levelEndAreas[PlayerTypes.PLAYER].boundary
    );
    let ghostPlayerOverlap = this.ghostPlayer.boundary.overlaps(
      this.terrainManager.levelEndAreas[PlayerTypes.GHOST_PLAYER].boundary
    );
    return playerOverlap && ghostPlayerOverlap;
  }

  /****** HELPERS FOR LEVEL#'s ******/
  // Build an animated portal sprite.
  protected setUpPortalSprite(type: string): AnimatedSprite {
    let portalSprite = this.add.animatedSprite(
      type === "body"
        ? InteractableTypes.LEVEL_END_DOOR
        : InteractableTypes.LEVEL_END_PORTAL,
      "primary"
    );
    portalSprite.scale.set(2, 2);
    portalSprite.addPhysics();
    portalSprite.disablePhysics();
    portalSprite.position.set(
      this.terrainManager.getExitLocation(type).x,
      this.terrainManager.getExitLocation(type).y - 8
    );

    return portalSprite;
  }

  /****** PUBLIC METHODS ******/
  /*** Getters ***/
  public getPlayerID(): number {
    return this.player.id;
  }

  public getGhostPlayerID(): number {
    return this.ghostPlayer.id;
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
