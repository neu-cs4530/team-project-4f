import Phaser from 'phaser';
import React, { useEffect, useState } from 'react';
import BoundingBox from '../../classes/BoundingBox';
import ConversationArea from '../../classes/ConversationArea';
import Player, { UserLocation } from '../../classes/Player';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import { Callback } from '../VideoCall/VideoFrontend/types';

// Original inspiration and code from:
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6

const TRIC = {
  name: 'Triceratops',
  x: 275, 
  y: 225
}
const ARMLESS_FTL = {
  name:' Armless \n Skeleton', 
  x: 1500, 
  y: 450
};
const VASES_FTL = {
  name: 'Vase Room', 
  x: 700,
  y: 500
};
const LEFT_FOYER_FTL = {
  name: 'Left End\n of Foyer', 
  x: 330,
  y: 995
};

const RIGHT_FOYER_FTL = {
  name:'Right End\n of Foyer', 
  x: 2020, 
  y: 995
};

const CONFERENCE_HALL_FTL = {
  name: 'Conference\n   Hall', 
  x: 2030,
  y: 450
};

const ATRIUM_ENTRANCE_FTL = {
  name: ' Atrium\nEntrance',
  x: 2560, 
  y: 700
};
const ATRIUM_BACK_FTL = {
  name: 'Back of \n Atrium', 
  x: 3000, 
  y: 380
};
const BASEMENT_FTL = {
  name: 'Basement',
  x: 3030, 
  y: 1200
};

const locationTitles = [TRIC, ARMLESS_FTL, VASES_FTL, LEFT_FOYER_FTL, RIGHT_FOYER_FTL, CONFERENCE_HALL_FTL, ATRIUM_ENTRANCE_FTL, ATRIUM_BACK_FTL, BASEMENT_FTL];
type ConversationGameObjects = {
  labelText: Phaser.GameObjects.Text;
  topicText: Phaser.GameObjects.Text;
  sprite: Phaser.GameObjects.Sprite;
  label: string;
  conversationArea?: ConversationArea;
};

class CoveyGameScene extends Phaser.Scene {
  private player?: {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    label: Phaser.GameObjects.Text;
  };

  private myPlayerID: string;

  private players: Player[] = [];

  private conversationAreas: ConversationGameObjects[] = [];

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  /*
   * A "captured" key doesn't send events to the browser - they are trapped by Phaser
   * When pausing the game, we uncapture all keys, and when resuming, we re-capture them.
   * This is the list of keys that are currently captured by Phaser.
   */
  private previouslyCapturedKeys: number[] = [];

  private lastLocation?: UserLocation;

  private ready = false;

  private paused = false;

  private video: Video;

  private emitMovement: (loc: UserLocation) => void;

  private currentConversationArea?: ConversationGameObjects;

  private infoTextBox?: Phaser.GameObjects.Text;

  private setNewConversation: (conv: ConversationArea) => void;

  private _onGameReadyListeners: Callback[] = [];

  constructor(
    video: Video,
    emitMovement: (loc: UserLocation) => void,
    setNewConversation: (conv: ConversationArea) => void,
    myPlayerID: string,
  ) {
    super('PlayGame');
    this.video = video;
    this.emitMovement = emitMovement;
    this.myPlayerID = myPlayerID;
    this.setNewConversation = setNewConversation;
  }

  preload() {
    // this.load.image("logo", logoImg);
    this.load.image('Room_Builder_32x32', '/assets/tilesets/Room_Builder_32x32.png');
    this.load.image('22_Museum_32x32', '/assets/tilesets/22_Museum_32x32.png');
    this.load.image(
      '5_Classroom_and_library_32x32',
      '/assets/tilesets/5_Classroom_and_library_32x32.png',
    );
    this.load.image('12_Kitchen_32x32', '/assets/tilesets/12_Kitchen_32x32.png');
    this.load.image('1_Generic_32x32', '/assets/tilesets/1_Generic_32x32.png');
    this.load.image('13_Conference_Hall_32x32', '/assets/tilesets/13_Conference_Hall_32x32.png');
    this.load.image('14_Basement_32x32', '/assets/tilesets/14_Basement_32x32.png');
    this.load.image('16_Grocery_store_32x32', '/assets/tilesets/16_Grocery_store_32x32.png');
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/indoors.json');
    this.load.atlas('atlas', '/assets/atlas/atlas.png', '/assets/atlas/atlas.json');
  }

  /**
   * Update the WorldMap's view of the current conversation areas, updating their topics and
   * participants, as necessary
   *
   * @param conversationAreas
   * @returns
   */
  updateConversationAreas(conversationAreas: ConversationArea[]) {
    if (!this.ready) {
      /*
       * Due to the asynchronous nature of setting up a Phaser game scene (it requires gathering
       * some resources using asynchronous operations), it is possible that this could be called
       * in the period between when the player logs in and when the game is ready. Hence, we
       * register a callback to complete the initialization once the game is ready
       */
      this._onGameReadyListeners.push(() => {
        this.updateConversationAreas(conversationAreas);
      });
      return;
    }
    conversationAreas.forEach(eachNewArea => {
      const existingArea = this.conversationAreas.find(area => area.label === eachNewArea.label);
      // TODO - if it becomes necessary to support new conversation areas (dynamically created), need to create sprites here to enable rendering on phaser
      // assert(existingArea);
      if (existingArea) {
        // assert(!existingArea.conversationArea);
        existingArea.conversationArea = eachNewArea;
        const updateListener = {
          onTopicChange: (newTopic: string | undefined) => {
            if (newTopic) {
              existingArea.topicText.text = newTopic;
            } else {
              existingArea.topicText.text = '(No topic)';
            }
          },
        };
        eachNewArea.addListener(updateListener);
        updateListener.onTopicChange(eachNewArea.topic);
      }
    });
    this.conversationAreas.forEach(eachArea => {
      const serverArea = conversationAreas?.find(a => a.label === eachArea.label);
      if (!serverArea) {
        eachArea.conversationArea = undefined;
      }
    });
  }

  create() {
    const map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
     tileset image in Phaser's cache (i.e. the name you used in preload)
     */
    const tileset = [
      'Room_Builder_32x32',
      '22_Museum_32x32',
      '5_Classroom_and_library_32x32',
      '12_Kitchen_32x32',
      '1_Generic_32x32',
      '13_Conference_Hall_32x32',
      '14_Basement_32x32',
      '16_Grocery_store_32x32',
    ].map(v => map.addTilesetImage(v));

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const belowLayer = map.createLayer('Below Player', tileset, 0, 0);
    const wallsLayer = map.createLayer('Walls', tileset, 0, 0);
    const onTheWallsLayer = map.createLayer('On The Walls', tileset, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });
    onTheWallsLayer.setCollisionByProperty({ collides: true });

    const worldLayer = map.createLayer('World', tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = map.createLayer('Above Player', tileset, 0, 0);
    aboveLayer.setCollisionByProperty({ collides: true });

    const veryAboveLayer = map.createLayer('Very Above Player', tileset, 0, 0);
    /* By default, everything gets depth sorted on the screen in the order we created things.
     Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
     it a depth. Higher depths will sit on top of lower depth objects.
     */
    worldLayer.setDepth(5);
    aboveLayer.setDepth(10);
    veryAboveLayer.setDepth(15);
    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = (map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point',
    ) as unknown) as Phaser.GameObjects.Components.Transform;

    // Find all of the transporters, add them to the physics engine
    const transporters = map.createFromObjects('Objects', { name: 'transporter' });
    this.physics.world.enable(transporters);

    // For each of the transporters (rectangle objects), we need to tweak their location on the scene
    // for reasons that are not obvious to me, but this seems to work. We also set them to be invisible
    // but for debugging, you can comment out that line.
    transporters.forEach(transporter => {
      const sprite = transporter as Phaser.GameObjects.Sprite;
      sprite.y += sprite.displayHeight; // Phaser and Tiled seem to disagree on which corner is y
      sprite.setVisible(false); // Comment this out to see the transporter rectangles drawn on
      // the map
    });

    const conversationAreaObjects = map.filterObjects(
      'Objects',
      obj => obj.type === 'conversation',
    );
    const conversationSprites = map.createFromObjects(
      'Objects',
      conversationAreaObjects.map(obj => ({ id: obj.id })),
    );
    this.physics.world.enable(conversationSprites);
    conversationSprites.forEach(conversation => {
      const sprite = conversation as Phaser.GameObjects.Sprite;
      sprite.y += sprite.displayHeight;
      const labelText = this.add.text(
        sprite.x - sprite.displayWidth / 2,
        sprite.y - sprite.displayHeight / 2,
        conversation.name,
        { color: '#FFFFFF', backgroundColor: '#000000' },
      );
      const topicText = this.add.text(
        sprite.x - sprite.displayWidth / 2,
        sprite.y + sprite.displayHeight / 2,
        '(No Topic)',
        { color: '#000000' },
      );
      sprite.setTintFill();
      sprite.setAlpha(0.3);

      this.conversationAreas.push({
        labelText,
        topicText,
        sprite,
        label: conversation.name,
      });
    });

    
    locationTitles.forEach(loc => {
      this.add.text(loc.x, loc.y, loc.name, {fontSize: '55px', backgroundColor: 'green', color: 'white'})
      .setDepth(30);
    });
    this.infoTextBox = this.add
      .text(
        this.game.scale.width / 2,
        this.game.scale.height / 2,
        "You've found an empty conversation area!\nTell others what you'd like to talk about here\nby providing a topic label for the conversation.\nSpecify a topic by pressing the spacebar.",
        { color: '#000000', backgroundColor: '#FFFFFF' },
      )
      .setScrollFactor(0)
      .setDepth(30);
    this.infoTextBox.setVisible(false);
    this.infoTextBox.x = this.game.scale.width / 2 - this.infoTextBox.width / 2;

    const labels = map.filterObjects('Objects', obj => obj.name === 'label');
    labels.forEach(label => {
      if (label.x && label.y) {
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        });
      }
    });

    const cursorKeys = this.input.keyboard.createCursorKeys();
    this.cursors.push(cursorKeys);
    this.cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.
    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24);

    const label = this.add.text(spawnPoint.x, spawnPoint.y - 20, '', {
      font: '18px monospace',
      color: '#000000',
      // padding: {x: 20, y: 10},
      backgroundColor: '#ffffff',
    });
    this.player = {
      sprite,
      label,
    };
    // turn player off.
    sprite.visible = false;

    /* Configure physics overlap behavior for when the player steps into
    a transporter area. If you enter a transporter and press 'space', you'll
    transport to the location on the map that is referenced by the 'target' property
    of the transporter.
     */
    this.physics.add.overlap(sprite, transporters, (overlappingObject, transporter) => {
      if (this.player) {
        // In the tiled editor, set the 'target' to be an *object* pointer
        // Here, we'll see just the ID, then find the object by ID
        const transportTargetID = transporter.getData('target') as number;
        const target = map.findObject(
          'Objects',
          obj => ((obj as unknown) as Phaser.Types.Tilemaps.TiledObject).id === transportTargetID,
        );
        if (target && target.x && target.y && this.lastLocation) {
          // Move the player to the target, update lastLocation and send it to other players
          this.player.sprite.x = target.x;
          this.player.sprite.y = target.y;
          this.lastLocation.x = target.x;
          this.lastLocation.y = target.y;
          this.emitMovement(this.lastLocation);
        } else {
          throw new Error(`Unable to find target object ${target}`);
        }
      }
    });
    this.physics.add.overlap(
      sprite,
      conversationSprites,
      (overlappingPlayer, conversationSprite) => {
        const conversationLabel = conversationSprite.name;
        const conv = this.conversationAreas.find(area => area.label === conversationLabel);
        this.currentConversationArea = conv;
        if (conv?.conversationArea) {
          this.infoTextBox?.setVisible(false);
          const localLastLocation = this.lastLocation;
          if(localLastLocation && localLastLocation.conversationLabel !== conv.conversationArea.label){
            localLastLocation.conversationLabel = conv.conversationArea.label;
            this.emitMovement(localLastLocation);
          }
        } else {
          if (cursorKeys.space.isDown) {
            const newConversation = new ConversationArea(
              conversationLabel,
              BoundingBox.fromSprite(conversationSprite as Phaser.GameObjects.Sprite),
            );
            this.setNewConversation(newConversation);
          }
          this.infoTextBox?.setVisible(true);
        }
      },
    );

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(sprite, worldLayer);
    this.physics.add.collider(sprite, wallsLayer);
    this.physics.add.collider(sprite, aboveLayer);
    this.physics.add.collider(sprite, onTheWallsLayer);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.

    const mapcamera = this.cameras.add(0, 0,3000, 400).setZoom(.3).setName('mini');
    mapcamera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, false, .2, .2)


    this.ready = true;
    if (this.players.length) {
      // Some players got added to the queue before we were ready, make sure that they have
      // sprites....
    }
    // Call any listeners that are waiting for the game to be initialized
    this._onGameReadyListeners.forEach(listener => listener());
    this._onGameReadyListeners = [];
  }

  pause() {
    if (!this.paused) {
      this.paused = true;
    }
  }

  resume() {
    if (this.paused) {
      this.paused = false;
    }
  }
}

export default function WorldMap(): JSX.Element {
  const video = Video.instance();
  const { emitMovement, myPlayerID } = useCoveyAppState();
  const [gameScene, setGameScene] = useState<CoveyGameScene>();
  const [newConversation, setNewConversation] = useState<ConversationArea>();


  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      backgroundColor: '#000000',
      parent: 'mini-map-container',
      pixelArt: true,
      autoRound: 10,
      minWidth: 500,
      fps: { target: 30 },
      powerPreference: 'high-performance',
      minHeight: 500,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    };


    const game = new Phaser.Game(config);
    if (video) {
      const newGameScene = new CoveyGameScene(video, emitMovement, setNewConversation, myPlayerID);
      setGameScene(newGameScene);
      game.scene.add('coveyBoard', newGameScene, true);
      video.pauseGame = () => {
        newGameScene.pause();
      };
      video.unPauseGame = () => {
        newGameScene.resume();
      };
    }
    return () => {
      game.destroy(true);
    };
  }, [video, emitMovement, setNewConversation, myPlayerID]);

  return (
      <div id='mini-map-container'/>
  );
}
