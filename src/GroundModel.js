"use strict";

/*
 GroundModel: handles events occurring underground.
 Tracks graboids and missiles, can be queried for seismic activity.
 
 group:Phaser.SpriteGroup - trails will be added to this group
 cities:[City] - list of graboid targets
 launchers:[Launcher] - list of fracker launchers
 */
BasicGame.GroundModel = function (group, aCities, aLaunchers) {
    // sprite group to add trails to
    this.spGroup = group;
    this.game = group.game;
    
    // perhaps we don't need this... defer to WaveController
    this.cities = aCities;
    this.launchers = aLaunchers;
    
    // lists of objects modeling the corresponding entities
    this.graboids = [];
    this.frackers = [];
    this.explosions = [];
    
    // drawing constants
    this.TRAIL_TTL = 3000;
    this.FRACKER_SPEED = 6;
};

BasicGame.GroundModel.prototype = {
    
    update: function () {
        // graboid and fracker position updates should be handled by the tweens
        var g, p;
        // iterate over graboids:
        for (g = 0; g < this.graboids.length; g += 1) {
            // check if they have hit their target
            if (this.graboids[g].targetHit) {
                this.graboids.splice(g, 1);
                g -= 1;
                continue;
            }
            // TODO: check against fracker explosions
            
            // draw new trail 'particle'
            p = this.spGroup.create(this.graboids[g].x,
                                    this.graboids[g].y, 'ping');
            p.blendMode = PIXI.blendModes.NORMAL;
            // center the dot
            p.anchor.setTo(0.5, 0.5);
            
            // tween
            this.game.tweens.create(p).to({alpha: 0}, this.TRAIL_TTL,
                                          Phaser.Easing.Quadratic.In, true);
//            this.game.tweens.create(p).to({tint: 0}, this.TRAIL_TTL,
//                BasicGame.Easing.tintEase(Phaser.Easing.Exponential.Out),
//                                          true);
            
            // set the time to live
            p.lifespan = this.TRAIL_TTL;
        }
    },
    
    // Spawns a graboid at a random part of the bottom of the screen
    addGraboid: function (target) {
        var originx = this.game.rnd.integerInRange(BasicGame.Game.radarBounds.left,
                                            BasicGame.Game.radarBounds.right),
            grab = new BasicGame.Graboid(originx,
                                         BasicGame.Game.radarBounds.bottom,
                                         target.x,
                                         BasicGame.Game.radarBounds.top,
                                         this.game.tweens);
        
        this.graboids.push(grab);
        return grab;
    }
};

BasicGame.Easing = {
    // tintEase :: (Num -> Num) -> Num -> Num
    tintEase: function (baseF) {
        return function (k) {
            var k2 = baseF(k),
                b = 255 * k2;
            return (b << 16) | (b << 8) | b;
        };
    }
};

/*
 Seeker: travels from its origin to its target, the motion of which is 
 facilitated by the TweenManager.
 
 tweenman:Phaser.TweenManager
 speed is in pixels per second
 */
BasicGame.Seeker = function (originx, originy, targetx, targety,
                             tweenman, speed) {
    // declare properties
    this.x = originx;
    this.y = originy;
    
    // calculate distance
    var rise = targety - originy,
        run = targetx - originx,
        hypotenuse = Math.sqrt(rise * rise + run * run),
    
    // calculate t = d/v
        duration = hypotenuse / speed * 1000; // in ms
    
    // tween both x and y linearly
    this.tweenx = tweenman.create(this);
    this.tweenx.to({x: targetx}, duration, Phaser.Easing.Linear.None, true);
    
    this.tweeny = tweenman.create(this);
    this.tweeny.to({y: targety}, duration, Phaser.Easing.Linear.None, true);
    
    // the completion callback will live in the subclass
};

/*
 Graboid: Digs from the bottom of the screen, until it hits a
 fracker explosion or its target.
 
 Inherits from Seeker
 */
BasicGame.Graboid = function (originx, originy, targetx, targety, tweenman) {
    // behavior constants
    this.GRABOID_SPEED = 50;
    this.TUNNELING_SEISMIC_INTENSITY = 50;
    
    BasicGame.Seeker.call(this, originx, originy, targetx, targety,
                          tweenman, this.GRABOID_SPEED);
    
    this.targetHit = false;
    
    this.onTargetReached = new Phaser.Signal();
    
    // create callback for when tween completes
    var f_onTargetReached = function () {
        this.targetHit = true;
        console.log('kill target');
        this.onTargetReached.dispatch();
    };
    this.tweeny.onComplete.addOnce(f_onTargetReached, this);
};

BasicGame.Graboid.prototype = Object.create(BasicGame.Seeker.prototype);
BasicGame.Graboid.prototype.constructor = BasicGame.Graboid;

// called by the GroundModel if this Graboid hits a fracker explosion
BasicGame.Graboid.prototype.explode = function () {
    // stop listening to tween completion event
    this.tweeny.onComplete.remove(this.onTargetReached, this);
    // terminate tweens
    this.tweenx.stop();
    this.tweeny.stop();
    // other dispose
    this.dispose();
};

BasicGame.Graboid.prototype.dispose = function () {
    this.onTargetReached.dispose();
};