// TODO// TODO

var moonWalk = "false";
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {

        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                width: 128,
                height: 128,
                getShape: function() {
                    return(new me.Rect(0, 0, 20, 128)).toPolygon();
                }
            }]);
//makes animations
        this.renderable.addAnimation("bigIdle", [19]);
        this.renderable.addAnimation("idle", [3]);
       
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
        this.renderable.addAnimation("bigWalk", [14, 15, 16, 17, 18, 19], 80);
        this.renderable.addAnimation("invinWalk", [39, 40, 41, 42, 43, 44], 80);
        
        
        this.renderable.setCurrentAnimation("idle");

        this.big = false;
        this.invin = false;
        this.body.setVelocity(5, 20);
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
        
        
    },
    update: function(delta) {


        if (me.input.isKeyPressed("right")) {

            this.flipX(false);
            //sets x position of mario bt adding th velocity set above in setVelocity()
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        }
        else if (me.input.isKeyPressed("left")) {
            if (moonWalk == "true") {


                this.flipX(false);
            }
            else if (moonWalk == "false") {
                this.flipX(true);
            }

            this.body.vel.x -= this.body.accel.x * me.timer.tick;
        }



        else if (me.input.isKeyPressed("cheat")) {
            me.input.unbindKey(me.input.KEY.CTRL);
            var code = prompt("whats yor cheat code?");

            if (code == "michael jackson") {

                moonWalk = "true";
            }
            else if (code == "no moonwalk") {
                console.log("did it");
                moonWalk = "false";
            }
            ;
            this.body.vel.y += this.body.accel.y * me.timer.tick;
            me.input.bindKey(me.input.KEY.CTRL, "cheat");
        }

        else {
            this.body.vel.x = 0;
        }


        if (me.input.isKeyPressed("jump")) {

            if (!this.body.jumping && !this.body.falling) {
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                this.body.jumping = true;
            }
        }

        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (!this.big && !this.invin) {


            if (this.body.vel.x !== 0) {
                if (!this.renderable.isCurrentAnimation("smallWalk")) {
                    this.renderable.setCurrentAnimation("smallWalk");
                    this.renderable.setAnimationFrame();
                }
            }else {
                this.renderable.setCurrentAnimation("idle");
            }
        }else if(!this.invin){
           if (this.body.vel.x !== 0) {
                if (!this.renderable.isCurrentAnimation("bigWalk")) {
                    this.renderable.setCurrentAnimation("bigWalk");
                    this.renderable.setAnimationFrame();
                }
            }else {
                this.renderable.setCurrentAnimation("bigIdle");
            } 
        }else if(this.invin){
           if (this.body.vel.x !== 0) {
                if (!this.renderable.isCurrentAnimation("invinWalk")) {
                    this.renderable.setCurrentAnimation("invinWalk");
                    this.renderable.setAnimationFrame();
                }
            }else {
                this.renderable.setCurrentAnimation("idle");
            } 
        }


        this._super(me.Entity, "update", [delta]);
        return true;
    },
    collideHandler: function(response) {
        var ygif = this.pos.y;
        var ydif = this.pos.y - response.b.pos.y;
        console.log(ydif);
        
        if (response.b.type === 'badguy') {
            if (ydif <= -115) {
                response.b.renderable.setCurrentAnimation("dead");
                response.b.alive = false;
            } else {
                me.state.change(me.state.OVER);
            }
        } else if (response.b.type === 'mushroom') {
            this.big = true;
            me.game.world.removeChild(response.b);
        } else if (response.b.type === 'star') {
            this.invin = true;
            me.game.world.removeChild(response.b);
        }
        
        

    }
});

game.LevelTrigger = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;
    },
    onCollision: function() {
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        me.levelDirector.loadLevel(this.level);
        me.state.current().resetPlayer(this.xSpawn, this.ySpawn);
    }


});

game.BadGuy = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "slime",
                spritewidth: 128,
                spriteheight: 128,
                width: 128,
                height: 128,
                getShape: function() {
                    return(new me.Rect(0, 0, 20, 100)).toPolygon();
                }
            }]);

        this.spritewidth = 60;
        var width = settings.width;
        x = this.pos.x;
        this.startX = x;
        this.endX = x + width - this.spritewidth;
        this.pos.x = x + width - this.spritewidth;
        this.updateBounds();

        this.alwaysUpdate = true;

        this.walkLeft = true;
        this.alive = true;
        this.type = "badguy";

        this.renderable.addAnimation("run", [4, 5, 6, 7, 8, 9, 10, 11], 80);
        this.renderable.addAnimation("dead", [28, 29, 30], 80);
        this.renderable.setCurrentAnimation("run");

        this.body.setVelocity(4, 6);
    },
    update: function(delta) {
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            this.flipX(!this.walkLeft);
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;

        } else {
            me.game.world.removeChild(this);
        }

        this._super(me.Entity, "update", [delta]);
        return true;
    },
    collideHandler: function() {

    }
});

game.Mushroom = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mushroom",
                spritewidth: 67,
                spriteheight: 71,
                width: 67,
                height: 71,
                getShape: function() {
                    return(new me.Rect(0, 0, 67, 71)).toPolygon();
                }
            }]);
        
        me.collision.check(this);
        this.type = "mushroom";

    }
});

game.star = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "star",
                spritewidth: 64,
                spriteheight: 64,
                width: 64,
                height: 64,
                getShape: function() {
                    return(new me.Rect(0, 0, 64, 64)).toPolygon();
                }
            }]);
        
        me.collision.check(this);
        this.type = "star";

    }
});
