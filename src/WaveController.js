"use strict";

/*
 WaveController: Handles spawning graboids in increasing quantities over levels
 gModel: GroundModel to spawn graboids in
 sModel: SurfaceModel tracking living cities
 time: Phaser.Time to create timer
 */
BasicGame.WaveController = function (gModel, sModel, time) {
    this.SPAWN_INTERVAL = 700;
    // function from wave number to number of graboids
    this.WAVE_SCALE_FUNC = function (k) {
        return 3 + Math.ceil(k * Math.log(k));
    };
    
    this.underground = gModel;
    this.surface = sModel;
    this.time = time;
    this.curTimer = null;
    
    this.waveCount = 0;
};

BasicGame.WaveController.prototype = {
    
    startWave: function () {
        this.waveCount += 1;
        
        this.curTimer = this.time.create(true); // do autoDestroy
        this.curTimer.repeat(this.SPAWN_INTERVAL,
                             this.WAVE_SCALE_FUNC(this.waveCount),
                             this.hatchGraboid,
                             this);
        this.curTimer.start();
    },
    
    hatchGraboid: function () {
        // collect a valid target from the surface model
        var target = this.surface.chooseRandomTarget(),
        // dispatch a graboid
            g = this.underground.addGraboid(target),
            f = function () {
                target.setAlive(false);
            };
        // link up a kill event
        g.onTargetReached.addOnce(f, this); 
    }
};