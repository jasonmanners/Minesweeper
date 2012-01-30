
//Better than setInterval: see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
var requestAnimationFrame = window.requestAnimationFrame        || 
					                  window.webkitRequestAnimationFrame  || 
					                  window.mozRequestAnimationFrame     || 
					                  window.oRequestAnimationFrame       || 
					                  window.msRequestAnimationFrame      || 
					                  function(/* function */ callback) {
					                    window.setTimeout(callback, 1000 / 60);
					                  };

//Constants
var CONST = {
	STYLES : {
		MINE : {
			COVERED : {
				'fillStyle' : '#FFFFFF',
			},
			FLAGGED : {
				'fillStyle' : '#FF9911',
			},
			UNCOVERED : {
				'fillStyle' : '#FF2233',
			}
		},
		LAND : {
			COVERED : {
				'fillStyle' : '#FFFFFF',
			},
			FLAGGED : {
				'fillStyle' : '#FFFF22',
			},
			UNCOVERED : {
				'fillStyle' : '#FFFFFF',
				'font' : '18px Arial bold',
				'textAlign' : 'center'
			},	
		}
	},

	SIZES : {
		SMALL 	: {ROWS:  8, 	GRID_SIZE : 30, TEXT_SIZE : 18, NAME : 'SMALL'  },
		MEDIUM 	: {ROWS: 16, 	GRID_SIZE : 25, TEXT_SIZE : 16, NAME : 'MEDIUM' },
		LARGE 	: {ROWS: 32, 	GRID_SIZE : 20, TEXT_SIZE : 14, NAME : 'LARGE'  }
	},

	TYPES : {
		MINE : 'MINE',
		LAND : 'LAND',
		FLAGGED : 'FLAGGED',
	},

	STATES : {
		COVERED 	: 'COVERED',
		UNCOVERED : 'UNCOVERED',
		FLAGGED 	: 'FLAGGED',
		INPUT : {
			FLAG : 'FLAG',
			UNCOVERING : 'UNCOVERING'
		},
		RUNNING : 'RUNNING',
		STOPPED : 'STOPPED'
	},

	DEFAULTS : {
		NUM_MINES : 10,
	},

	SAVE_NAME : "minesweeper_game",
}
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


//A minefield to be sweeped, will maintain field information throughout the game
// Expected param : size - expects an obj from CONSTS.SIZES
var Minefield = function(size,diff) {
	this.__field_size = size.ROWS;
	this.__grid_size = size.GRID_SIZE;
	this.__num_mines = diff || CONST.DEFAULTS.NUM_MINES;
	this.clearArrays();
	this.__state = CONST.STATES.STOPPED;
	this.initialize();
};

Minefield.prototype = {

	initialize : function() {
		//Init Board with new cells and add all cells to hidden 
		for(var row = 0; row < this.__field_size; row++){
			this.__field[row] = [];
			for(var col = 0; col < this.__field_size; col++){
				var n_cell = new Cell(col,row);
				this.__field[row][col] = n_cell;
				this.__hidden.push(n_cell);
			}
		}

		//Create our mines and add them to our mine list
		for(var mine_count = 0; mine_count < this.__num_mines; mine_count++) {
			this.setMine(this.getRandIndex(),this.getRandIndex());
		}

		var that = this;

		$.each(this.__mines,function(ind,mine){
			var x = mine.x();
			var y = mine.y();
			var neighbors = [
				[x-1,y-1], [x,y-1], [x+1,y-1],
				[x-1,y],						[x+1,y],
				[x-1,y+1], [x,y+1], [x+1,y+1],
			];

			$.each(neighbors,function(ind,val){
				var i_x = val[0];
				var i_y = val[1];
				if(	i_x >= 0 && i_x < that.__field_size &&
						i_y >= 0 && i_y < that.__field_size) {
							that.__field[i_y][i_x].count(1);
						}
			})
		});

	},

	setMine : function(i_x, i_y) {
		if(this.__field[i_x][i_y].type() != CONST.TYPES.MINE) {
			this.__field[i_x][i_y].type(CONST.TYPES.MINE);
			this.__mines.push(this.__field[i_x][i_y]);
		}
		else {
			this.setMine(this.getRandIndex(),this.getRandIndex());
		}
	},

	getRandIndex : function() {
		return Math.floor(Math.random()*this.__field_size);
	},



	/*


	new discover

	if mine
		reveal and return true
	if count = 0
		reveal all neighbors that have 0
	else
		reveal self

	return false;
	*/

	//When cell is uncovered remove from the hidden array
	// and add it to the discovered array
	discover : function(c_x,c_y) {
		var e_cell = this.__field[c_y][c_x];
		var e_type = e_cell.type();
		var is_mine = false;
		if(e_cell.isMine()) {
			this.__reveal(e_cell);
			is_mine = true;
		}
		else if(e_cell.count() == 0) {
			this.__reveal(e_cell);
			this.__revealNeighbors(e_cell);
		}
		else {
			this.__reveal(e_cell);
		}

		return is_mine;
	},

	__reveal : function(e_cell) {
		var e_ind = this.__hidden.indexOf(e_cell);
		if(e_ind > -1) {
			e_cell.state(CONST.STATES.UNCOVERED);
			this.__hidden.splice(e_ind,1);
			this.__discovered.push(e_cell);
		}
	},

	__revealNeighbors : function(cell,inds) {
		var that = this;
		var x = cell.x();
		var y = cell.y();

		var neighbors = [
								[x,y-1], 
				[x-1,y],				[x+1,y],
								[x,y+1], 
			];

		$.each(neighbors,function(ind,val){
			var i_x = val[0];
			var i_y = val[1];
			if(	i_x >= 0 && i_x < that.__field_size &&
					i_y >= 0 && i_y < that.__field_size) {
				var e_cell = that.__field[i_y][i_x];
				if(e_cell.count() == 0 && e_cell.state() != CONST.STATES.UNCOVERED) {
					that.__reveal(e_cell);	
					that.__revealNeighbors(e_cell);
				}
			}
		});
	
	},

	clearArrays : function() {
		this.__mines = [];
		this.__field = [];
		this.__hidden = [];
		this.__discovered = [];
	},

	//Run on validation, will go through each hidden cell
	// if all hidden cells are only mines you win
	isWin : function() {
		result = true;
		$.each(this.__hidden,function(ind,val){
			if(val.type() === CONST.TYPES.LAND) {
				result = false;
			}
		});

		return result;
	},

	//Will dispay mines as flags
	flagMines : function() {
		$.each(this.__mines,function(ind,val){
			val.flag();
		});
	},

	flagCell : function(c_x,c_y) {
		this.__field[c_y][c_x].toggleFlag();
	},

	hidden : function() {
		return this.__hidden;
	},

	discovered : function() {
		return this.__discovered;
	},

	toJSON : function() {
		var result = {};
		
		result.cells = [];

		for(var row = 0; row < this.__field_size; row++){
			for(var col = 0; col < this.__field_size; col++){
				result.cells.push(this.__field[row][col].toJSON());
			}
		}
		
		return result;
	},

	fromJSON : function(data) {
		var that = this;
		this.clearArrays();
		for(var row = 0; row < this.__field_size; row++){
			this.__field[row] = [];
		}
		$.each(data.cells,function(ind, val){
			var n_cell = new Cell(0,0);
			var x = val.x;
			var y = val.y;
			
			n_cell.fromJSON(val);
			//build field
			that.__field[y][x] = n_cell;
			//build hidden
			if(val.state == CONST.STATES.COVERED ||
					val.state == CONST.STATES.FLAGGED) {
				that.__hidden.push(n_cell);
			}
			//build discovered
			else {
				console.log("U - "+x+":"+y);
				that.__discovered.push(n_cell);	
			}
			
			//build mines
			if(val.type == CONST.TYPES.MINE) {
				that.__mines.push(n_cell);
			}
		});
	}
};

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
var Minesweeper = {

	CONFIG : {
		WIDTH : 240,
		HEIGHT: 240,
	},

	initialize : function() {
		this.__mine_field = undefined;
		this.__size = CONST.SIZES.SMALL;
		this.__num_mines = CONST.DEFAULTS.NUM_MINES;
		this.__mouse_state = CONST.STATES.INPUT.UNCOVERING;

		this.initRenderer();
		this.initEvents();
	},

	initRenderer : function() {
		Minesweeper.CONFIG.WIDTH 	= this.__size.GRID_SIZE * this.__size.ROWS;
		Minesweeper.CONFIG.HEIGHT = this.__size.GRID_SIZE * this.__size.ROWS;

		this.__canvas = new Canvas2D(Minesweeper.CONFIG,'game_container');
		this.__renderer = new MinefieldRenderer2D(this.__canvas);
	},

	resize : function() {
		Minesweeper.CONFIG.WIDTH 	= this.__size.GRID_SIZE * this.__size.ROWS;
		Minesweeper.CONFIG.HEIGHT = this.__size.GRID_SIZE * this.__size.ROWS;
		this.__canvas.resize(Minesweeper.CONFIG);
	},

	initEvents : function() {
		//May want to set the click on the parent and based on src element do what is needed
		//Buttons
		$('#small').click(function(){
			Minesweeper.size(CONST.SIZES.SMALL);
			//Minesweeper.resize();
		});
		$('#medium').click(function(){
			Minesweeper.size(CONST.SIZES.MEDIUM);
			//Minesweeper.resize();
		});
		$('#large').click(function(){
			Minesweeper.size(CONST.SIZES.LARGE);
			//Minesweeper.resize();
		});

		$('#new').click(function(){
			Minesweeper.newGame();
		});
		$('#validate').click(function(){
			Minesweeper.validate();
		});
		$('#cheat').click(function(){
			Minesweeper.cheat();
		});

		$('#save').click(function(){
			Minesweeper.save();
		});

		$('#load').click(function(){
			Minesweeper.load();
		});

		//Overlay Close
		$('#close_win').click(function(){
			Minesweeper.toggleWinOverlay();
		});
			
		$('#close_lose').click(function(){
			Minesweeper.toggleLoseOverlay();
		});	

		//Mouse Events
		$(this.__canvas.el()).bind('mousedown', Minesweeper.mouseDown.bind(this));

		//Keyboard Events
		$(document).keydown(this.keyDown.bind(this));
		$(document).keyup(this.keyUp.bind(this));
	},
	
	initBoard : function() {
		//Be sure to add in Num of mines later
		this.__mine_field = new Minefield(this.__size),this.__num_mines;
		this.__renderer.minefield(this.__mine_field);
	},

	//Getters & Setters
	size : function() {
		if(arguments[0]) { this.__size = arguments[0]; }
		else { return this.__size; }
	},

	//Event Functions
	mouseDown : function(e) {
		var c_x = Math.floor(e.offsetX / this.__size.GRID_SIZE);
		var c_y = Math.floor(e.offsetY / this.__size.GRID_SIZE);
		if(this.__mouse_state == CONST.STATES.INPUT.UNCOVERING) {
			this.uncoverCell(c_x,c_y);
		}
		else {
			this.flagCell(c_x,c_y);
		}
	},

	keyDown : function(e) {
		if(e.keyCode == 16) {
			this.__mouse_state = CONST.STATES.INPUT.FLAGGED;
		}
	},

	keyUp : function(e) {
		if(e.keyCode == 16) {
			this.__mouse_state = CONST.STATES.INPUT.UNCOVERING;
		}
	},

	uncoverCell : function(c_x,c_y) {
		var was_mine = this.__mine_field.discover(c_x,c_y);

		if(was_mine) {
			this.__mine_field.flagMines();
			this.validate();
		}
	},

	flagCell : function(c_x,c_y) {
		this.__mine_field.flagCell(c_x,c_y);
	},

	start : function() {
		this.__renderer.startLoop();
		this.__state = CONST.STATES.RUNNING;
	},

	stop : function() {
		this.__renderer.stopLoop();
		this.__state = CONST.STATES.STOPPED;
	},

	//==========
	//  Functions to tie to buttons
	//==========
	validate : function() {
		if(this.__state === CONST.STATES.RUNNING) {
			this.stop();
			this.__state = CONST.STATES.STOPPED;
			var n_is_win = this.__mine_field.isWin();

			if(n_is_win) {
				Minesweeper.toggleWinOverlay();
			}
			else {
				Minesweeper.toggleLoseOverlay();	
			}
		}
	},

	cheat : function() {
		if(this.__state === CONST.STATES.RUNNING) {
			Minesweeper.__mine_field.flagMines();
		}
	},

	newGame : function() {
		Minesweeper.initBoard();
		Minesweeper.resize();
		Minesweeper.start();
	},

	save : function() {
		var jsonData = this.__mine_field.toJSON();
		jsonData.size = this.size().NAME;
		localStorage.setItem(CONST.SAVE_NAME,JSON.stringify(jsonData));
	},

	load : function() {
		var jsonData = JSON.parse(localStorage.getItem(CONST.SAVE_NAME));
		if(jsonData) {
			this.stop();
			this.size(CONST.SIZES[jsonData.size]);
			this.resize();
			this.__mine_field = new Minefield(this.__size);
			this.__mine_field.fromJSON(jsonData);
			this.__renderer.minefield(this.__mine_field);
			this.start();
			localStorage.removeItem(CONST.SAVE_NAME);	
		}
	},

	//==========
	// Functions for displaying win and lose overlays
	//==========
	toggleWinOverlay : function() {
		$('#win_overlay').toggle();
	},

	toggleLoseOverlay : function() {
		$('#lose_overlay').toggle();
	}
};


// Run once the page has loaded
$(function(){
	Minesweeper.initialize();
});