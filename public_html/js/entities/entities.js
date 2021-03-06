/*-----------------------------------------------------------------------------
 * Code for the Player Character
 * ----------------------------------------------------------------------------
 */ 
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                width: 128,
                height: 128,
                getShape: function(){
                    return (new me.Rect(0, 0, 30, 128)).toPolygon();
                }
        }]);  
        
        //sets animations for name, frames and speed
        this.renderable.addAnimation("idle", [3]);
        this.renderable.addAnimation("bigIdle", [7]);
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12, 13], 80);
        this.renderable.addAnimation("bigWalk", [14, 15, 16, 17, 18, 19], 80);
        this.renderable.addAnimation("jump", [8]);
        this.renderable.addAnimation("bigJump", [14]);
        this.renderable.addAnimation("shrink", [0, 1, 2, 3], 20);
        this.renderable.addAnimation("grow", [4, 5, 6, 7], 20)
        
        this.renderable.setCurrentAnimation("idle");
        
        this.big = false;
        this.body.setVelocity(5, 20);
        //makes screen follow mario
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },
    
    update: function (delta) {
        //control for moving right
        if (me.input.isKeyPressed("right")) {
            this.flipX(false);
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            ;
        }
        //control for moving left
        else if (me.input.isKeyPressed("left")) {
            this.flipX(true);
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
        }
        //for when mario stands still
        else {
            this.body.vel.x = 0;
        }
        //control for jumping
        if (me.input.isKeyPressed('jump')) {
            // make sure we are not already jumping or falling
            if (!this.body.jumping && !this.body.falling) {
                // set current vel to the maximum defined value
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                this.body.jumping = true;
            }

        }
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        
        //sets conditions for when mario is not big
        if (!this.big) {
            if (this.body.vel.x !== 0) {
                if (!this.renderable.isCurrentAnimation("smallWalk")) {
                    this.renderable.setCurrentAnimation("smallWalk");
                    this.renderable.setAnimationFrame();
                }
            }
            else {
                this.renderable.setCurrentAnimation("idle");
            }
            //sets conditions for when mario is big
        }else{
            if (this.body.vel.x !== 0) {
                if (!this.renderable.isCurrentAnimation("bigWalk") || this.renderable.isCurrentAnimation("grow") || this.renderable.isCurrentAnimation("shrinl")) {
                    this.renderable.setCurrentAnimation("bigWalk");
                    this.renderable.setAnimationFrame();
                }
            }
            else {
                this.renderable.setCurrentAnimation("bigIdle");
            }
        }
        if (!this.big) {
            if (this.body.vel.y !== 0) {
                if (!this.renderable.isCurrentAnimation("jump")) {
                    this.renderable.setCurrentAnimation("jump");
                    this.renderable.setAnimationFrame();
                }
            }
        }else{
            if (this.body.vel.y !== 0) {
                if (!this.renderable.isCurrentAnimation("bigJump")) {
                    this.renderable.setCurrentAnimation("bigJump");
                    this.renderable.setAnimationFrame();
                }
            }
        }
            
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    //how mario reacts to colliding with things
    collideHandler: function (response) {
        var ydif = this.pos.y - response.b.pos.y;
        console.log(ydif);
        //when mario touches enemy
        if (response.b.type === 'badguy') {
            if (ydif <= -115) {
                response.b.alive = false;
            }
            else {
                if (this.big) {
                    this.big = false;
                    this.body.vel.y -= this.body.accel.y * me.timer.tick;
                    this.jumping = true;
                    this.renderable.setCurrentAnimation("shrink", "idle");
                    this.renderable.setAnimationFrame();
                } else {
                    me.state.change(me.state.GAMEOVER);
                }
            }
        }
        //when mario gets a mushroom
        else if (response.b.type === 'mushroom') {
            this.big = true;
            this.renderable.setCurrentAnimation("grow", "bigIdle");
            me.game.world.removeChild(response.b);
        }
        //when mario falls
        else if(response.b.type === 'fall'){
            if(y <= 590);
            response.b.alive = false;
        }
    }


});

/*-----------------------------------------------------------------------------
 * Code for the Level Doors
 * ----------------------------------------------------------------------------
 */
game.LevelTrigger = me.Entity.extend({
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;
    },
    onCollision: function () {
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        me.levelDirector.loadLevel(this.level);
        me.state.current().resetPlayer(this.xSpawn, this.ySpawn);
    }
});

/*-----------------------------------------------------------------------------
 * Code for the Enemies
 * ----------------------------------------------------------------------------
 */
game.BadGuy = me.Entity.extend({
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "slime",
                spritewidth: "60",
                spriteheight: "28",
                width: 60,
                height: 28,
                getShape: function () {
                    return (new me.Rect(0, 0, 60, 28)).toPolygon();
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

        this.walkLeft = false;
        this.alive = true;
        this.type = "badguy";

        this.body.setVelocity(4, 6);

    },
    update: function (delta) {
        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (this.alive) {
            if (this.walkleft && this.pos.x <= this.startX) {
                this.walkleft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkleft = true;
            }
            this.flipX(!this.walkLeft);
            this.body.vel.x += (this.walkleft) ? -this.body.accel.x * me.timer.tick : this.body.vel.x * me.timer.tick;

        } else {
            me.game.world.removeChild(this);
        }


        this._super(me.Entity, "update", [delta]);
        return true;
    },
    collideHandler: function () {

    }
});

/*-----------------------------------------------------------------------------
 * Code for the Mushroom Powerup
 * ----------------------------------------------------------------------------
 */
game.Mushroom = me.Entity.extend({
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mushroom",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function () {
                    return (new me.Rect(0, 0, 64, 64)).toPolygon();
                }
            }]);

        me.collision.check(this);
        this.type = "mushroom";
    }


});
/*-----------------------------------------------------------------------------
 * Code For The Star
 * ----------------------------------------------------------------------------
 */
game.Star = me.Entity.extend({
    init: function (x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "star",
                spritewidth: "64",
                spriteheight: "64",
                width: 64,
                height: 64,
                getShape: function () {
                    return (new me.Rect(0, 0, 64, 64)).toPolygon();
                }
            }]);

        me.collision.check(this);
        this.type = "star";
    }


});