
//2D Canvas Renderer
var Canvas2D = function(config,container) {
	this.initialize(config,container);
};

Canvas2D.prototype = {
	initialize : function(config,container) {
		
		this.__config = config;
		this.__size = {
			WIDTH 	: this.__config.WIDTH || 300,
			HEIGHT 	: this.__config.HEIGHT || 150	
		};

		this.__container = $('#'+container);
		this.__el = $(document.createElement('canvas'));
		this.__el.attr(this.__size);
		this.__ctx = this.__el[0].getContext('2d');

		//Just need to set the width to be able to center canvas within the page
		this.__container.css({width:this.__size.WIDTH+"px"});
		this.__container.html(this.__el);
	},

	el : function() {
		return this.__el;
	},

	beginDraw : function() {
		this.__clear();
	},

	rect : function(x,y,width,height,options) {
		this.__ctx.save();
			this.__setContextOptions(options);
			this.__ctx.fillRect(x,y,width,height);
		this.__ctx.restore();
	},

	//Render text at the location with the given options
	text : function(x,y,text,options) {
		this.__ctx.save();
			this.__setContextOptions(options);
			this.__ctx.fillText(text,x,y);
		this.__ctx.restore();
	},

	resize : function(config) {
		this.__config = config;
		this.__size = {
			WIDTH 	: this.__config.WIDTH || 300,
			HEIGHT 	: this.__config.HEIGHT || 150	
		};
		this.__el.attr(this.__size);
		this.__container.css({width:this.__size.WIDTH+"px"});
	},

	__clear : function(){
		this.__ctx.clearRect(0,0,this.__size.WIDTH,this.__size.HEIGHT);
	},

	__setOption : function(option, val) {
		this.__ctx[option] = val;
	},

	__setContextOptions : function(options) {
		options = options || [];
		$.each(options,this.__setOption.bind(this));
	},

	
};