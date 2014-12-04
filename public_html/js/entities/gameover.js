game.GameOverScreen = me.ScreenObject.extend({
    
    	 
    onResetEvent: function () {
        var titleImage = new me.Sprite(0, 0, me.loader.getImage("title-screen"));
        me.game.world.addChild(titleImage, -10);
        me.input.bindKey(me.input.KEY.ENTER, "menu");
        
        me.game.world.addChild(new (me.Renderable.extend({
            init: function(){
                this._super(me.Renderable, 'init', [510, 30, me.game.viewport.width, me.game.viewport.height]);
                this.font = new me.Font("Aerial", 60, "red");
            },
            draw: function(renderer){
                this.font.draw(renderer.getContext(), "Game Over!", 450, 130);
                this.font.draw(renderer.getContext(), "Press Enter To Go To Main Menu", 250, 530);
            }
            
        })));
        
        this.handler = me.event.subscribe(me.event.KEYDOWN, function(action, keyCode, edge){
            if(action === "menu"){
                me.state.change(me.state.MENU);
            }
        });
            
        
    },
	
	
    /**	
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function () {
        me.input.unbindKey(me.input.KEY.ENTER) ;
        me.event.unsubscribe(this.handler);
    }
});



