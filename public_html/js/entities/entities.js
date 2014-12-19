// TODO
var turn;
var turn2;
var turn3;
var restrict;
var moonWalk = "false";
var player = "mario";
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {

        this._super(me.Entity, 'init', [x, y, {
                image: "myguy",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function() {
                    return(new me.Rect(0, 0, 20, 64)).toPolygon();
                }
            }]);
//makes animations
        this.renderable.addAnimation("bigIdle", [19]);
        this.renderable.addAnimation("idle", [264]);

        this.renderable.addAnimation("smallWalk", [265, 266, 268, 269, 270, 271], 80);
        this.renderable.addAnimation("bigWalk", [14, 15, 16, 17, 18, 19], 80);
        this.renderable.addAnimation("invinWalk", [39, 40, 41, 42, 43], 80);


        this.renderable.setCurrentAnimation("idle");

        fly = "false";
        limit = 500;
        timer = 0;
        this.big = false;
        this.invin = false;
        this.body.setVelocity(5, 20);
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);


    },
    update: function(delta) {

        if (timer <= 1) {
            this.invin = false;
        } else if (this.invin) {
            timer -= .25;

        }
        console.log(this.pos.y);
        if (this.pos.y > limit) {
            me.state.change(me.state.OVER);
        }
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
                confirm("You have activated moonwalking.");
                moonWalk = "true";
            }
            else if (code == "no moonwalk") {
                confirm("You have unactivated moonwalking.");
                console.log("did it");
                moonWalk = "false";
            }
            else if (code == "flymode") {
                confirm("You have activated flying.");
                fly = "true";
            }
            ;
            this.body.vel.y += this.body.accel.y * me.timer.tick;
            me.input.bindKey(me.input.KEY.CTRL, "cheat");
        }

        else {
            this.body.vel.x = 0;
        }


        if (me.input.isKeyPressed("jump")) {

            if (!this.body.jumping) {
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                if (fly != "true") {
                    this.body.jumping = true;
                }
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
            } else {
                this.renderable.setCurrentAnimation("idle");
            }
        } else if (!this.invin) {
            if (this.body.vel.x !== 0) {
                if (!this.renderable.isCurrentAnimation("bigWalk")) {
                    this.renderable.setCurrentAnimation("bigWalk");
                    this.renderable.setAnimationFrame();
                }
            } else {
                this.renderable.setCurrentAnimation("bigIdle");
            }
        } else if (this.invin && timer >= 1) {
            if (this.body.vel.x !== 0) {
                if (!this.renderable.isCurrentAnimation("invinWalk")) {
                    this.renderable.setCurrentAnimation("invinWalk");
                    this.renderable.setAnimationFrame();
                }
            } else {
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
            if (ydif <= -115 || this.invin) {
                response.b.renderable.setCurrentAnimation("dead");
                response.b.alive = false;
            } else {
                me.state.change(me.state.OVER);
            }
        } else if (response.b.type === 'mushroom') {
            this.big = true;
            me.game.world.removeChild(response.b);
        } else if (response.b.type === 'star') {
            timer = 100;
            this.invin = true;
            me.game.world.removeChild(response.b);
        } else if (response.b.type === 'lever') {
            if (turn == "off") {
                turn = "flick";
            }


        } else if (response.b.type === 'lever2') {
            if (turn2 == "off") {
                turn2 = "flick";
            }
        } else if (response.b.type === 'lever3') {
            if (turn3 == "off") {
                turn3 = "flick";
            }
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
        limit = 6700;
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

game.BadFly = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "fly",
                spritewidth: 76,
                spriteheight: 36,
                width: 76,
                height: 36,
                getShape: function() {
                    return(new me.Rect(0, 0, 76, 36)).toPolygon();
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

        this.renderable.addAnimation("run", [2], 80);
        this.renderable.addAnimation("dead", [1], 80);
        this.renderable.setCurrentAnimation("run");

        this.body.setVelocity(4, 0);
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

game.lever = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "item",
                spritewidth: 70,
                spriteheight: 70,
                width: 70,
                height: 70,
                getShape: function() {
                    return(new me.Rect(0, 0, 30, 70)).toPolygon();
                }
            }]);

        me.collision.check(this);
        this.type = "lever";
        turn = "off";
        secret = 0;
        restrict = 3;

        this.renderable.addAnimation("on", [49], 80);
        this.renderable.addAnimation("off", [47], 80);
        this.renderable.addAnimation("flick", [47, 48, 49], 80);

    },
    update: function(delta) {
        console.log(turn);
        this.body.update(delta);
        if (turn == "flick" && restrict == 3) {

            confirm("you need 2 more levers.");
            secret += 1;
            restrict -= 1;
            this.renderable.setCurrentAnimation("flick");
            this.renderable.setAnimationFrame();
            turn = "on";

        } else if (turn == "on") {


            this.renderable.setCurrentAnimation("on");
        }
        else {
            this.renderable.setCurrentAnimation("off");
        }



    }
});

game.lever2 = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "item",
                spritewidth: 70,
                spriteheight: 70,
                width: 70,
                height: 70,
                getShape: function() {
                    return(new me.Rect(0, 0, 30, 70)).toPolygon();
                }
            }]);

        me.collision.check(this);
        this.type = "lever2";
        turn2 = "off";


        this.renderable.addAnimation("on", [49], 80);
        this.renderable.addAnimation("off", [47], 80);
        this.renderable.addAnimation("flick", [47, 48, 49], 80);

    },
    update: function(delta) {

        this.body.update(delta);
        console.log(turn2);
        if (turn2 == "flick" && restrict == 2) {

            confirm("you need 1 more lever.");
            secret += 1;
            restrict -= 1;
            this.renderable.setCurrentAnimation("flick");
            this.renderable.setAnimationFrame();
            turn2 = "on";

        } else if (turn2 == "on") {


            this.renderable.setCurrentAnimation("on");
        }
        else {
            this.renderable.setCurrentAnimation("off");
        }


    }
});

game.lever3 = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "item",
                spritewidth: 70,
                spriteheight: 70,
                width: 70,
                height: 70,
                getShape: function() {
                    return(new me.Rect(0, 0, 30, 70)).toPolygon();
                }
            }]);

        me.collision.check(this);
        this.type = "lever3";
        turn3 = "off";


        this.renderable.addAnimation("on", [49], 80);
        this.renderable.addAnimation("off", [47], 80);
        this.renderable.addAnimation("flick", [47, 48, 49], 80);

    },
    update: function(delta) {
        console.log(turn);
        this.body.update(delta);

        if (turn3 == "flick" && restrict == 1) {

            confirm("you need 1 more lever.");
            secret += 1;
            restrict -= 1;
            this.renderable.setCurrentAnimation("flick");
            this.renderable.setAnimationFrame();
            turn2 = "on";

        } else if (turn3 == "on") {


            this.renderable.setCurrentAnimation("on");
        }
        else {
            this.renderable.setCurrentAnimation("off");
        }

    }
});
