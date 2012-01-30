
//2D Renderer
var MinefieldRenderer2D = function(ctx) {
	this.__ctx = ctx;
	this.__running = false;
	this.__mine_field = undefined;
};

MinefieldRenderer2D.prototype = {
	minefield : function() {
		if(arguments[0]) { this.__mine_field = arguments[0]; }
		else { return this.__mine_field; }
	},

	draw : function() {
		var that = this;
		this.__ctx.beginDraw();
		//Draw Hidden Elements
		$.each(this.__mine_field.hidden(),function(ind,val){
			var options = CONST.STYLES[val.type()][val.state()]
			var size = that.__mine_field.__grid_size;
			var x = val.x() * size + 2;
			var y = val.y() * size + 2;
			that.__ctx.rect(x,y,size-4,size-4,options);
		});

		//Draw discovered elements
		$.each(this.__mine_field.discovered(),function(ind,val){
			if(val.type() == CONST.TYPES.MINE) {
				var options = CONST.STYLES.MINE.UNCOVERED;
				var size = that.__mine_field.__grid_size;
				var x = val.x() * size + 2;
				var y = val.y() * size + 2;
				that.__ctx.rect(x,y,size-4,size-4,options);
			}
			else {
				var options = CONST.STYLES.LAND.UNCOVERED;
				var size = that.__mine_field.__grid_size;
				var x = val.x() * size + (size / 2);
				var y = val.y() * size + (size / 2)+4;
				that.__ctx.text(x,y,val.count(),options);
			}
		});
	},

	startLoop : function() {
		this.__running = true;
		this.__loop();
	},

	stopLoop : function() {
		this.__running = false;
	},

	__loop : function() {
		this.draw();
		if(this.__running) {
			requestAnimationFrame(this.__loop.bind(this));
		}
	}
};