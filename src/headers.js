
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
				//'fillStyle' : '#FF9911',
				'fillStyle' : '#FFFF22',
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