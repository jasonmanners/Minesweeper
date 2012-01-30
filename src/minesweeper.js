
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
		this.__selected_size_el = $('#small');
		console.log(this.__selected_size_el);
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
		var that = this;
		//May want to set the click on the parent and based on src element do what is needed
		//Buttons

		$('#small').click(function(){
			Minesweeper.size(CONST.SIZES.SMALL);
			that.__selected_size_el.removeClass('selected');
			that.__selected_size_el = $('#small');
			that.__selected_size_el.addClass('selected');
			//Minesweeper.resize();
		});
		$('#medium').click(function(){
			Minesweeper.size(CONST.SIZES.MEDIUM);
			that.__selected_size_el.removeClass('selected');
			that.__selected_size_el = $('#medium');
			that.__selected_size_el.addClass('selected');
			//Minesweeper.resize();
		});
		$('#large').click(function(){
			Minesweeper.size(CONST.SIZES.LARGE);
			that.__selected_size_el.removeClass('selected');
			that.__selected_size_el = $('#large');
			that.__selected_size_el.addClass('selected');
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
