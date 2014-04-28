"use strict";

/*
 SurfaceModel: tracks cities and launchers, i.e. objects on the surface.
 cCount: number of cities to create
 group: Sprite group
 rnd: source of randomness
 */
BasicGame.SurfaceModel = function (cCount, group, rnd) {
    
    // margin between edge of radar screen and cities
    this.CITY_MARGIN = 70;
    // y of ground surface for city placement
    this.GROUND_LEVEL = 135;
    // number of distinct city graphics
    this.CITY_TYPE_COUNT = 1;
    
    this.rnd = rnd;
    
    // place cities
    this.cityCount = cCount;
    this.cities = [];
    
    var i,
        xInterval = 0,
        x,
        f,
        c;
    
    if (cCount > 1) {
        xInterval = (BasicGame.Game.radarBounds.width - 2 * this.CITY_MARGIN)
            / (cCount - 1);
    }
    
    for (i = 0; i < cCount; i += 1) {
        x = BasicGame.Game.radarBounds.left + this.CITY_MARGIN + xInterval * i;
        f = i % this.CITY_TYPE_COUNT;
        c = new BasicGame.City(f, f + this.CITY_TYPE_COUNT, x,
                               this.GROUND_LEVEL, group);
        this.cities.push(c);
    }
};

BasicGame.SurfaceModel.prototype = {
    
    // return a random city from those still alive
    chooseRandomTarget: function () {
        var aliveCities = [],
            i,
            target;
        
        // filter for alive cities
        for (i = 0; i < this.cityCount; i += 1) {
            if (this.cities[i].isAlive) {
                aliveCities.push(this.cities[i]);
            }
        }
        
        // pick one
        target = this.rnd.pick(aliveCities);
        
        // fallback to first city if they're all dead
        if (aliveCities.length === 0) {
            target = this.cities[0];
        }
        
        return target;
    }
};

/*
 City: objects to be targeted and destroyed by graboid impacts
 sf: starting frame #
 df: destroyed frame #
 x, y: position of bottom center of sprite
 group: Group to create sprite in
 */
BasicGame.City = function (sf, df, x, y, group) {
    
    this.startFrame = sf;
    this.destroyedFrame = df;
    
    // create alive city
    this.image = group.create(x, y, 'city', sf);
    this.image.anchor.setTo(0.5, 1);
    
    this.isAlive = true;
    this.x = x;
};

BasicGame.City.prototype = {
    
    setAlive: function (isAlive) {
        this.isAlive = isAlive;
        
        if (isAlive) {
            this.image.frame = this.startFrame;
        } else {
            // play explosion?
            this.image.frame = this.destroyedFrame;
        }
    }
};