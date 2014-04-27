"use strict";

BasicGame.Game = function (game) {
/*
	//	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;    //  the tween manager
    this.state;	    //	the state manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator
*/
    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
    this.gameBackground = null;
    this.cursor = null;
    
};

BasicGame.Game.radarBounds = new Phaser.Rectangle(50, 187, 499, 563);

BasicGame.Game.prototype = {

	create: function () {

        console.log(this.stage.bounds.width + ', ' + this.stage.bounds.height);
        
        this.gameBackground = this.add.image(0, 0, 'planet');
        
        // graboid layer
        this.screenLayer = this.game.add.group();
        this.screenLayer.name = 'screenLayer';
        
        this.groundModel = new BasicGame.GroundModel(this.screenLayer, [], []);
        
        // DEBUG surface layer
        this.surfaceModel = {
            chooseRandomTarget: function () {
                return { x: 300 };
            }
        };

        // cursor needs to go last, probably
        this.cursor = this.add.sprite(BasicGame.Game.radarBounds.centerX,
                                      BasicGame.Game.radarBounds.centerY,
                                      'cursor');
        this.cursor.anchor.setTo(0.5, 0.5);
        
        // Controllers
        this.waveController = new BasicGame.WaveController(this.groundModel,
            this.surfaceModel, this.game.time);
        
        // DEBUG
        this.waveController.startWave();
	},

	update: function () {

        this.groundModel.update();
        
		// move cursor to mouse, within the radar Bounds
        this.cursor.x = this.math.clamp(this.input.activePointer.x,
                                        BasicGame.Game.radarBounds.left,
                                        BasicGame.Game.radarBounds.right);
                        //- (this.cursor.width / 2);
        this.cursor.y = this.math.clamp(this.input.activePointer.y,
                                        BasicGame.Game.radarBounds.top,
                                        BasicGame.Game.radarBounds.bottom);
                        //- (this.cursor.height / 2);

	},

	quitGame: function (pointer) {

		//	Here you should destroy anything you no longer need.
		//	Stop music, delete sprites, purge caches, free resources, all that good stuff.

		//	Then let's go back to the main menu.
		this.state.start('MainMenu');

	}

};
