

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

		//Only want to reveal direct paths, diagnols don't count
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
				that.__discovered.push(n_cell);	
			}
			
			//build mines
			if(val.type == CONST.TYPES.MINE) {
				that.__mines.push(n_cell);
			}
		});
	}
};
