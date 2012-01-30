

//A single cell within the board
var Cell = function(x,y) {
	this.__pos = {
		x : x || 0,
		y : y || 0
	},

	this.__count 	= 0;
	this.__state 	= CONST.STATES.COVERED;
	this.__type 	= CONST.TYPES.LAND;
	
};

Cell.prototype = {

	//Getters and setters, if no param getter, if param setter
	x : function() {
		if(arguments[0]) { this.__pos.x = arguments[0]; }
		else { return this.__pos.x; }
	},

	y : function() {
		if(arguments[0]) { this.__pos.y = arguments[0]; }
		else { return this.__pos.y; }
	},

	type : function() {
		if(arguments[0]) { this.__type = arguments[0]; }
		else { return this.__type; }
	},

	state : function() {
		if(arguments[0]) { this.__state = arguments[0]; }
		else { return this.__state; }
	},

	count : function() {
		if(arguments[0]) { this.__count += arguments[0]; }
		else { return this.__count; }
	},

	size : function() {
		if(arguments[0]) { this.__size = arguments[0]; }
		else { return this.__size; }
	},

	flag : function() {
		this.state(CONST.STATES.FLAGGED);
	},
	
	toggleFlag : function() {
		if(this.state() == CONST.STATES.COVERED) {
			this.state(CONST.STATES.FLAGGED);	
		}
		else {
			this.state(CONST.STATES.COVERED);		
		}
	},

	isMine : function() {
		var result = false;
		if(this.type() == CONST.TYPES.MINE) {
			result = true;
		}
		return result;
	},

	toJSON : function() {
		var result = {};
		result.x = this.x();
		result.y = this.y();
		result.count = this.count();
		result.state = this.state();
		result.type = this.type();
		return result;
	},

	fromJSON : function(data) {
		this.x(data.x);
		this.y(data.y);
		this.count(data.count);
		this.state(data.state);
		this.type(data.type);
	}
};
