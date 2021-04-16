import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
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
import { ScreenTexts } from "../../Enums/ScreenTextEnums";
import PauseTracker from "../../SceneHelpers/PauseTracker";
import SceneOptions from "../../SceneHelpers/SceneOptions";

export default class GameLevel extends Scene {
  // Every level will have a player, which will be an animated sprite
  protected playerSpawn: Vec2;
  protected player: AnimatedSprite;
  protected playerResumeSpawn: Vec2;

  // Every level will have a ghost player, which will be an animated sprite
  protected ghostPlayerSpawn: Vec2;
  protected ghostPlayer: AnimatedSprite;
  protected ghostPlayerResumeSpawn: Vec2;

  // Labels for the UI
  protected static coinCount: number = 0;
  protected coinCountLabel: Label;
  protected static livesCount: number = 3;
  protected livesCountLabel: Label;

  // Stuff to end the level and go to the next level
  protected levelEndArea: Rect;
  protected nextLevel: new (...args: any) => GameLevel;
  protected levelEndTimer: Timer;
  protected levelEndLabel: Label;

  // Screen fade in/out for level start and end
  protected levelTransitionTimer: Timer;
  protected levelTransitionScreen: Rect;

  // Game nodes that the viewport can follow
  protected followNodes: AnimatedSprite[];

  // Follow node index for viewport swapping between game characters
  private followNodeIndex: number;
  private previousFollowNodeIndex: number;

  // Variable to track levels. Used to track if game is paused
  protected currentLevel: new (...args: any) => GameLevel;
  protected pauseTracker: PauseTracker;

  // Exit variables
  protected playerExitLocation: Vec2;
  protected ghostPlayerExitLocation: Vec2;
  protected exitSize: Vec2;
  protected levelEndAreas: { [character: string]: Rect };

  initScene(init: Record<string, any>): void {
    if (init) {
      this.playerResumeSpawn = init.playerResumeSpawn;
      this.ghostPlayerResumeSpawn = init.ghostPlayerResumeSpawn;
      this.previousFollowNodeIndex = init.followNodeIndex;
    }
  }

  startScene(): void {
    // Do the game level standard initializations
    this.initLayers();
    this.initViewport();
    this.initPlayer();
    this.initGhostPlayer();
    this.subscribeToEvents();
    this.addUI();

    // Define nodes that the viewport can follow
    this.followNodes = [];
    this.followNodes.push(this.player);
    this.followNodes.push(this.ghostPlayer);

    // Initialize follow node index for viewport following
    this.followNodeIndex = 0;
    if (this.previousFollowNodeIndex) {
      this.followNodeIndex = this.previousFollowNodeIndex;
    }
    this.viewport.follow(this.followNodes[this.followNodeIndex]);

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

    // Start unpaused
    this.pauseTracker = new PauseTracker(
      this,
      this.viewport,
      this.layers,
      this.sceneManager
    );

    // Track exit locations
    this.levelEndAreas = {};
  }

  updateScene(deltaT: number) {
    // Handle the player making inputs

    // swap view key input
    if (Input.isJustPressed("swap view")) {
      this.followNodeIndex++;
      this.followNodeIndex = this.followNodeIndex % this.followNodes.length;
      this.viewport.follow(this.followNodes[this.followNodeIndex]);
    }

    // restart key input
    if (Input.isJustPressed("restart")) {
      this.respawnPlayer();
    }

    // pause key input
    if (Input.isJustPressed("pause")) {
      this.pauseTracker.toggle();
    }

    // Handle events and update the UI if needed
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();

      switch (event.type) {
        case Events.PLAYER_HIT_COIN:
          {
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
          break;

        case Events.PLAYER_HIT_COIN_BLOCK:
          {
            // Hit a coin block, so increment our number of coins
            this.incPlayerCoins(1);
          }
          break;

        case Events.PLAYER_HIT_ENEMY:
          {
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
          break;

        case Events.ENEMY_DIED:
          {
            // An enemy finished its dying animation, hide it
            let node = this.sceneGraph.getNode(event.data.get("owner"));
            node.visible = false;
          }
          break;

        case Events.PLAYER_ENTERED_LEVEL_END:
          {
            // Determines if both characters are colliding with exit
            if (!this.handlePlayerExitCollision()) {
              break;
            }

            if (
              !this.levelEndTimer.hasRun() &&
              this.levelEndTimer.isStopped()
            ) {
              // The player has reached the end of the level
              this.levelEndTimer.start();
              this.levelEndLabel.tweens.play("slideIn");
            }
          }
          break;

        case Events.LEVEL_START:
          {
            // Re-enable controls
            console.log("Enabling input");
            Input.enableInput();
          }
          break;

        case Events.LEVEL_END:
          {
            // Go to the next level
            if (this.nextLevel) {
              console.log("Going to next level!");
              let sceneOptions = SceneOptions.getSceneOptions();
              this.sceneManager.changeToScene(this.nextLevel, {}, sceneOptions);
            }
          }
          break;
      }
    }

    // If player falls into a pit, kill them off and reset their position
    if (
      this.player.position.y > 100 * 64 ||
      this.ghostPlayer.position.y > 100 * 64
    ) {
      this.incPlayerLife(-1);
      this.respawnPlayer();
    }
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
    ]);
  }

  protected addUI() {
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
    this.coinCountLabel.backgroundColor = new Color(0, 0, 0, 0.7);

    // Lives label
    this.livesCountLabel = <Label>this.add.uiElement(
      UIElementType.LABEL,
      "UI",
      {
        position: new Vec2(500, 30),
        text: ScreenTexts.LIVES + " " + GameLevel.livesCount,
      }
    );
    this.livesCountLabel.textColor = Color.WHITE;
    this.livesCountLabel.font = "Squarely";
    this.livesCountLabel.fontSize = 40;
    this.livesCountLabel.padding = new Vec2(10, 5);
    this.livesCountLabel.backgroundColor = new Color(0, 0, 0, 0.7);

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
    this.player = this.add.animatedSprite("player", "primary");
    this.player.scale.set(2, 2);
    if (!this.playerSpawn) {
      console.warn("Player spawn was never set - setting spawn to (0, 0)");
      this.playerSpawn = Vec2.ZERO;
    }

    // Player resume spawn
    if (this.playerResumeSpawn) {
      this.player.position.copy(this.playerResumeSpawn);
    } else {
      this.player.position.copy(this.playerSpawn);
    }

    this.player.addPhysics();
    this.player.addAI(PlayerController, {
      playerType: "platformer",
      tilemap: "Main",
      characterType: "body",
      jumpHeight: -350,
      fallFactor: 1.0,
    });

    // Add triggers on colliding with coins or coinBlocks
    this.player.setGroup("player");

    // Add a tween animation for the player jump
    this.player.tweens.add("flip", {
      startDelay: 0,
      duration: 500,
      effects: [
        {
          property: "rotation",
          start: 0,
          end: 2 * Math.PI,
          ease: EaseFunctionType.IN_OUT_QUAD,
        },
      ],
    });
  }

  protected initGhostPlayer(): void {
    // Add the ghost player
    this.ghostPlayer = this.add.animatedSprite("ghostPlayer", "primary");
    this.ghostPlayer.scale.set(2, 2);
    if (!this.ghostPlayerSpawn) {
      console.warn(
        "Ghost player spawn was never set - setting spawn to (0, 0)"
      );
      this.ghostPlayerSpawn = Vec2.ZERO;
    }

    // Ghost Player resume spawn
    if (this.ghostPlayerResumeSpawn) {
      this.ghostPlayer.position.copy(this.ghostPlayerResumeSpawn);
    } else {
      this.ghostPlayer.position.copy(this.ghostPlayerSpawn);
    }

    this.ghostPlayer.addPhysics();
    this.ghostPlayer.addAI(PlayerController, {
      playerType: "platformer",
      tilemap: "Main",
      characterType: "soul",
      jumpHeight: -550,
      fallFactor: 0.9,
    });

    // Add triggers on colliding with coins or coinBlocks
    this.ghostPlayer.setGroup("ghostPlayer");

    // Add a tween animation for the player jump
    this.ghostPlayer.tweens.add("flip", {
      startDelay: 0,
      duration: 500,
      effects: [
        {
          property: "rotation",
          start: 0,
          end: 2 * Math.PI,
          ease: EaseFunctionType.IN_OUT_QUAD,
        },
      ],
    });
  }

  protected addLevelEnd(startingTile: Vec2, size: Vec2, group: string): void {
    this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, "primary", {
      position: startingTile.add(size.scaled(0.5)).scale(32),
      size: size.scale(32),
    });
    this.levelEndArea.addPhysics(undefined, undefined, false, true);
    this.levelEndArea.setTrigger(group, Events.PLAYER_ENTERED_LEVEL_END, null);
    this.levelEndArea.color = new Color(0, 0, 0, 1);
    this.levelEndAreas[group] = this.levelEndArea;
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
    enemy.setTrigger("player", Events.PLAYER_HIT_ENEMY, null);
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
        this.incPlayerLife(-1);
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
        this.incPlayerLife(-1);
        this.respawnPlayer();
      }
    }
  }

  /**
   * Handles player collision with exit
   * @returns boolean true if exit condition is met
   */
  protected handlePlayerExitCollision(): boolean {
    let playerOverlap = this.player.boundary.overlaps(
      this.levelEndAreas["player"].boundary
    );
    let ghostPlayerOverlap = this.ghostPlayer.boundary.overlaps(
      this.levelEndAreas["ghostPlayer"].boundary
    );

    return playerOverlap && ghostPlayerOverlap;
  }

  protected incPlayerLife(amt: number): void {
    GameLevel.livesCount += amt;
    this.livesCountLabel.text = ScreenTexts.LIVES + " " + GameLevel.livesCount;
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
}
