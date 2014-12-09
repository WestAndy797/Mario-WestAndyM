game.GameoverScreen = me.ScreenObject.extend({
	/**	
	 *  action to perform on state change
	 */
	onResetEvent: function() {	
		me.game.world.addChild( new me.Sprite (0,0, me.loader.getImage('OVER-SCREEN')), -10);
               
                me.input.bindKey(me.input.KEY.ENTER, "menu");
                me.input.bindKey(me.input.KEY.R, "restart");
                
                me.game.world.addChild(new (me.Renderable.extend ({
                    init: function(){
                        this._super(me.Renderable, 'init', [510, 30, me.game.viewport.width, me.game.viewport.height]);
                        this.font = new me.Font("Arial", 46, "gold");
                    }, 
                    
                    draw: function(renderer){
                        
                        
                        
                        this.font.draw(renderer.getContext(), "press Enter for the Menu", 250, 530);
                        this.font.draw(renderer.getContext(), "press R to restart", 375, 130);
                    }
                })));
                
                
                this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge){
                    if(action === "menu"){
                        me.state.change(me.state.MENU);
                    }
                    
                    if(action === "restart"){
                        me.state.change(me.state.PLAY);
                    }
                });
	},
	
	
	/**	
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
	me.input.unbindKey(me.input.KEY.ENTER);
        me.event.unsubscribe(this.handler);
	}    
});

