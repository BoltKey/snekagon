const TILES = [
	[[1]],  // u 0
	[[1, 1]],  // d 1
	[[1, 1, 1]],  // w 2
	[[1, 1], [0, 1]],  // c 3
	[[1, 1], [0, 1, 1]],  // s 4
	[[1, 1, 1], [0, 0, 1]],  // l 5
	[[1, 1, 1, 1]],  // i 6
	[[0, 1, 1], [1, 0, 1]]  // u 7
]
const EVIL = [
	[[1, 1], [1]],
	[[0, 1], [1, 1]],
	[[0, 0, 1], [1, 1], [0, 1]],
	[[0, 1], [0, 1, 1], [1]]
];

const ALL_TILES = [];

function prepareTiles() {
	for (var t = 1; t < 8; ++t) {
		var maxFlip = ([4,5].indexOf(t) > -1 ? 2 : 1);
		var maxRot = ([3,5,7].indexOf(t) > -1 ? 6 : 3);
		for (var flip = 0; flip < maxFlip; ++flip) {
			for (var rot = 0; rot < maxRot; ++rot) {
				var tile = new Tile(t, 0);
				if (flip) {
					tile.flip();
				}
				for (var i = 0; i < rot; ++i) {
					tile.rotate();
				}
				ALL_TILES.push(tile);
			}
		}
	}
}
var positionsEvaled = 0;
var totalPositionsApprox = 1;

function Tile(no, player, rot=0, flip=0) {
	if (no === -1) {
		this.grid = [];
		this.no = no;
		this.player = player;
		return;
	}
	if (typeof no !== "number") {
		this.grid = [];
		for (var r in no.grid) {
			this.grid[r] = no.grid[r].slice();
		}
		this.no = no.no;
		this.player = no.player;
	}
	else {
		this.grid = TILES[no].concat();
		this.player = player;
		this.no = no;
	}
	for (var f = 0; f < flip; ++f) {
		this.flip();
	}
	for (var r = 0; r < rot; ++r) {
		this.rotate();
	}
	
}


Tile.prototype.rotate = function() {
	//https://www.redblobgames.com/grids/hexagons/#rotation
	var newShape = [];
	for (var y = 0; y < this.grid.length; ++y) {
		var row = this.grid[y];
		for (var x = 0; x < row.length; ++x) {
			if (row[x]) {
				var origin = [0, this.grid.length - 1, -this.grid.length + 1];
				var newVector = [x, y, -x-y];
				newVector[0] -= origin[0];
				newVector[1] -= origin[1];
				newVector[2] -= origin[2];
				newVector.splice(2, 0, newVector.splice(0, 1)[0]);  // rotation
				newVector = newVector.map(a => -a);
				newVector[0] += origin[0];
				newVector[1] += origin[1];
				newVector[2] += origin[2];
				var ny = newVector[1];
				var nx = newVector[0];
				if (!newShape[ny]) {
					newShape[ny] = [];
				}
				newShape[ny][nx] = 1;
			}
		}
	}
	newShape = newShape.filter(a => a.filter(b => b > 0).length > 0);
	while (newShape.map(a => a[0]).filter(b => b).length === 0) {
		newShape = newShape.map(a => a.slice(1));
	}
	this.grid = newShape;
}
Tile.prototype.flip = function() {
	var newShape = [];
	for (var y = 0; y < this.grid.length; ++y) {
		var row = this.grid[y];
		for (var x = 0; x < row.length; ++x) {
			if (!newShape[x]) {
				newShape[x] = [];
			}
			newShape[x][y] = this.grid[y][x];
		}
	}
	this.grid = newShape;
}

function Board(orig) {
	this.grid = [];
	this.tilesAvailable = [];
	this.x = 50;
	this.y = 50;
	this.redPlays = false;
	if (orig) {
		// copy
		for (var r in orig.grid) {
			this.grid[r] = orig.grid[r].slice();
		}
		this.longestSnakes = orig.longestSnakes.slice();
		for (var r in orig.tilesAvailable) {
			this.tilesAvailable[r] = orig.tilesAvailable[r].slice();
		}
	}
	else {
		// create blank
		for (var i = 0; i < 11; ++i) {
			var start = Math.max(0, 5 - i);
			this.grid.push([]);
			for (var j = 0; j < 11 - Math.abs(i - 5); ++j) {
				this.grid[i][j + start] = 1;
			}
		}
		
		//this.grid[5][5] = 2;
		this.longestSnakes = [0, 0];
		this.tilesAvailable = [[7,6,5,4,3,2,1], [7,6,5,4,3,2,1, 0]];
	}
	
	this.shadeTile = undefined;
	this.shadeX = 5;
	this.shadeY = 5;
	
	this.hexSize = 30;
}

Board.prototype.draw = function() {
	function drawHex(hexSize) {
		ctx.beginPath();
		ctx.save();
		ctx.rotate(Math.PI * 2 / 12);
		ctx.moveTo(-hexSize * .5, -hexSize * Math.sqrt(3) / 2);
		ctx.lineTo(hexSize * .5, -hexSize * Math.sqrt(3) / 2);
		ctx.lineTo(hexSize, 0);
		ctx.lineTo(hexSize * .5, hexSize * Math.sqrt(3) / 2);
		ctx.lineTo(-hexSize * .5, hexSize * Math.sqrt(3) / 2);
		ctx.lineTo(-hexSize, 0);
		ctx.lineTo(-hexSize * .5, -hexSize * Math.sqrt(3) / 2);
		ctx.fill();
		ctx.strokeStyle = "gray";
		ctx.stroke();
		ctx.restore();
	}
	
	ctx.save();
	ctx.translate(this.x, this.y);
	for (var y = 0; y < this.grid.length; ++y) {
		var row = this.grid[y];
		
		ctx.save();
		
		for (var x = 0; x < row.length; ++x) {
			if (this.grid[y][x]) {
				var sx = x - this.shadeX;
				var sy = y - this.shadeY;
				if (this.shadeTile && sx >= 0 && sy >= 0 && sy < this.shadeTile.grid.length && sx < this.shadeTile.grid[sy].length && this.shadeTile.grid[sy][sx]) {
					ctx.fillStyle = "gray";
				}
				else {
					ctx.fillStyle = [0, "#704811", "#b30707", "#00960f"][this.grid[y][x]];
				}
				drawHex(this.hexSize);
				ctx.fillStyle = "black";
				ctx.textAlign = "center";
				ctx.fillText(x + ":" + y, 0, 0);
				ctx.fillText(-x-y, 0, 10);
			}
			ctx.translate(this.hexSize * Math.sqrt(3), 0);
		}
		ctx.restore();
		ctx.translate(this.hexSize * Math.sqrt(3) * .5, this.hexSize * 1.5);
	}
	ctx.restore();
}

Board.prototype.getNeighbors = function(x, y) {
	return [
		[x + 1, y], 
		[x, y + 1], 
		[x - 1, y], 
		[x, y - 1], 
		[x + 1, y - 1], 
		[x - 1, y + 1]
	];
}

Board.prototype.possibleMoves = function(player, forceConnect = true) {
	var moves = [];
	
	for (var t of this.tilesAvailable[player - 2]) {
		var maxFlip = ([4,5].indexOf(t) > -1 ? 2 : 1);
		var maxRot = ([3,5,7].indexOf(t) > -1 ? 6 : 3);
		if (this.tilesAvailable[0].concat(this.tilesAvailable[1]).length === 14) {
			maxFlip = 1;
			maxRot = 1;
		}
		for (var flip = 0; flip < maxFlip; ++flip) {
			for (var rot = 0; rot < maxRot; ++rot) {
				var tile = new Tile(t, player);
				if (flip) {
					tile.flip();
				}
				for (var i = 0; i < rot; ++i) {
					tile.rotate();
				}
				for (var x = 0; x < 11; ++x) {
					for (var y = 0; y < 11; ++y) {
						if (this.legalMove(tile, x, y)) {
							moves.push([tile, x, y]);
						}
					}
				}
			}
		}
	}
	/*for (var tile of ALL_TILES) {
		if (this.tilesAvailable[player-2].indexOf(tile.no) > -1) {
			for (var x = 0; x < 11; ++x) {
				for (var y = 0; y < 11; ++y) {
					tile.player = player;
					if (this.legalMove(tile, x, y, forceConnect)) {
						
						moves.push([new Tile(tile), x, y]);
					}
				}
			}
		}
	}*/
	return moves;
}

Board.prototype.legalMove = function(tile, ox, oy, forceConnect = false) {
	// first, check if all tiles below are 1, along with neighbors check
	
	myContacts = 0;
	oppContacts = 0;
	for (var ty = 0; ty < tile.grid.length; ++ty) {
		var row = tile.grid[ty];
		for (var tx = 0; tx < row.length; ++tx) {
			if (tile.grid[ty][tx]) {
				var x = ox + tx;
				var y = oy + ty;
				if (x > 10 || x < 0 || y > 10 || y < 0) {
					return false;
				}
				if (this.grid[y][x] !== 1) {
					return false;
				}
				var n = this.getNeighbors(x, y);
				for (var coord of n) {
					if (coord[1] < 0 || coord[1] > 10 || coord[0] < 0 || coord[0] > 10) {
						continue;
					}
					var t = this.grid[coord[1]][coord[0]];
					if (t === tile.player) {
						myContacts += 1;
					}
					else if (t > 1) {
						oppContacts += 1;
					}
				}
			}
		}
	}
	
	if ((oppContacts > 0 && myContacts === 0) || myContacts > 2) {
		return false;
	}
	
	// now check for triangle and Y patterns. Make new board and try to match patterns
	var testBoard = new Board(this);
	/*for (var r in testBoard.grid) {
		testBoard.grid[r] = this.grid[r].slice();
	}*/
	testBoard.placeTile(tile, ox, oy);
	
	for (var x = ox - 2; x < ox + tile.grid.length + 3; ++x) {
		for (var y = oy - 2; y < oy + tile.grid[0].length + 3; ++y) {
			for (var e of EVIL) {
				if (testBoard.evilFit(x, y, e, tile.player)) {
					return false;
				}
			}
		}
	}
	if (forceConnect) {
		return myContacts > 0;
	}
	return true;
}

Board.prototype.evilFit = function(ox, oy, shape, player) {
	for (var dy = 0; dy < shape.length; ++dy) {
		for (var dx = 0; dx < shape[dy].length; ++dx) {
			if (oy + dy > 10 || ox + dx > 10 || ox + dx < 0 || oy+dy < 0) {
				return false;
			}
			if (shape[dy][dx] && this.grid[oy + dy] && (this.grid[oy + dy][ox + dx] !== player)) {
				return false;
			}
		}
	}
	return true;
}

Board.prototype.placeTile = function(tile, ox, oy) {
	// place tile without checking or removing from available tiles
	for (var y = 0; y < tile.grid.length; ++y) {
		var row = tile.grid[y];
		for (var x = 0; x < row.length; ++x) {
			if (tile.grid[y][x] && this.grid[oy+y]) {
				this.grid[oy + y][ox + x] = tile.player;
			}
		}
	}
}

Board.prototype.makeMove = function(tile, ox, oy, force=false) {
	// place tile with legal move checking and removing from available tiles
	var tiles = this.tilesAvailable[tile.player - 2];
	if (tiles.indexOf(tile.no) === -1) {
		return false;
	}
	if (force || this.legalMove(tile, ox, oy)) {
		this.placeTile(tile, ox, oy);
		
		if (tile.grid.length === 0) {
			tiles.splice(0, 1);  // remove the first tile without placing
			this.redPlays = !this.redPlays;
			return true;
		}
		tiles.splice(tiles.indexOf(tile.no), 1);
		
		this.longestSnakes[tile.player - 2] = 
			Math.max(
				this.longestSnakes[tile.player - 2], 
				this.snakeLen(
					ox + tile.grid[0].indexOf(1), oy, tile.player
				)
			);
		this.redPlays = !this.redPlays;
		return true;
	}
	return false;
}

Board.prototype.snakeLen = function(x, y, player, prohib = undefined, start = ""+x+y) {
	// find length of a snake of a player from a specific location
	if (this.grid[y][x] !== player) {
		return 0;
	}
	var n = this.getNeighbors(x, y);
	var len = 1;
	for (var coord of n) {
		if (this.grid[coord[1]] && this.grid[coord[1]][coord[0]] === player && coord.join("") !== prohib) {
			if (coord.join("") === start) {
				// cycle detected
				len += 0.25;
			}
			else {
				len += this.snakeLen(...coord, player, "" + x + y, start);
			}
		}
	}
	if (len % 1 === 0.5) {
		// cycle correction
		return (len + 0.5)/2;
	}
	/*if (this.canSnake(x, y, player, 2)) {
		len += 3;
	}*/

	return len;
}

Board.prototype.canSnake = function(x, y, player, len, dir, initial = true) {
	// returns whether a player can continue building snake for len tiles in specific direction from initial coordinates
	var neighs = this.getNeighbors(x, y);
	if (x < 0 || x > 10 || y < 0 || y > 10) {
		return false;
	}
	if (initial && this.grid[y][x] !== player) {
		return false;
	}
	if (!initial && this.grid[y][x] !== 1) {
		return false;
	}
	var oneNeigh = false;
	if (!dir) {
		for (var n of neighs) {
			if (this.grid[n[1]] && this.grid[n[1]][n[0]] === player) {
				if (oneNeigh) {
					return false;
				}
				oneNeigh = true;
				dir = [x - n[0], y - n[1]];
			}
		}
	}
	if (!dir) {
		return true;
	}
	var friendlyNeighs = 0;
	for (var n of neighs) {
		if (this.grid[n[1]] && this.grid[n[1]][n[2]] === player) {
			++friendlyNeighs;
		}
	}
	if (!initial) {
		if (friendlyNeighs > 1) {
			return false;
		}
		if (friendlyNeighs === 1) {
			return len === 1;
		}
	}
	
	if (len === 1) {
		return true;
	}
	dx = dir[0];
	dy = dir[1];
	dz = - (x+y);
	
	newDirs = [dir, [-dz, -dx], [-dy, -dz]];
	for (var ndir of newDirs) {
		if (this.canSnake(x + ndir[0], y + ndir[1], player, len - 1, ndir, false)) {
			return true;
		}
	}
	return false;
}

Board.prototype.score = function() {
	// score is difference of longest snakes in each color
	/*for (var x = 0; x < 11; ++x) {
		for (var y = 0; y < 11; ++y) {
			var p = this.grid[y][x]
			if (p > 1) {
				this.longestSnakes[p-2] = Math.max(this.longestSnakes[p-2], this.snakeLen(x, y, p));
			}
		}
	}
	++positionsEvaled;
	return this.longestSnakes[0] - this.longestSnakes[1];*/
	return this.potentialLength(2) - this.potentialLength(3);
}

Board.prototype.potentialLength = function(player) {
	// finds the length longest snake a player can make from his remaining tiles and the tiles on the board
	var moves = this.possibleMoves(player, true);
	var longest = 0;
	if (moves.length === 0) {
		for (var x = 0; x < 11; ++x) {
			for (var y = 0; y < 11; ++y) {
				var p = this.grid[y][x]
				if (p === player) {
					longest = Math.max(longest, this.snakeLen(x, y, p));
				}
			}
		}
		return longest;
	}
	for (var m of moves) {
		var newBoard = new Board(this);
		newBoard.makeMove(...m, true);
		longest = Math.max(longest, newBoard.potentialLength(player));
		if (longest >= 24) {
			break;
		}
	}
	return longest;
}

Board.prototype.minimaxSearch = function(min, depth, alpha = -10000, beta = 10000, initial = true, otherNoTurns = false) {
	var moves = this.possibleMoves(2 + min, !initial);
	var bestScore = min ? 10000 : -10000;
	var bestMove;
	if (depth === 0 || (this.tilesAvailable[1].length === 0 && this.tilesAvailable[0].length === 0)) {
		if (initial) {
			return undefined;
		}
		return this.score();
	}
	if (moves.length === 0) {
		if (otherNoTurns) {
			return this.score();
		}
		if (initial) {
			return [new Tile(-1, 2+min), 0, 0];
		}
		return this.minimaxSearch(!min, depth-1, alpha, beta, false, true);
	}
	for (var move of moves) {
		if (initial) {
			console.log(moves.indexOf(move) + "/" + moves.length);
		}
		var newBoard = new Board(this);
		for (var r in newBoard.grid) {
			newBoard.grid[r] = this.grid[r].slice();
		}
		for (var r in newBoard.tilesAvailable) {
			newBoard.tilesAvailable[r] = this.tilesAvailable[r].slice();
		}
		newBoard.longestSnakes = this.longestSnakes.slice();
		newBoard.makeMove(...move, true);
		var newScore = newBoard.minimaxSearch(!min, depth - 1, alpha, beta, false);
		/*if (initial) {
			console.log("curr score " + newScore + " comparing to " + bestScore);
		}*/
		if ((min && newScore < bestScore) || (!min && newScore > bestScore)) {
			bestScore = newScore;
			bestMove = move;
			if (initial) {
				console.log("new best move with score " + newScore + ", depth " + depth);
				console.log(move);
			}
		}
		if (min) {
			beta = Math.min(beta, bestScore);
		}
		else {
			alpha = Math.max(alpha, bestScore);
		}
		if (alpha >= beta) {
			break;
		}
	}
	if (initial)
		return bestMove;
	return bestScore;
}



// ------ tests ------- //

Board.prototype.basicTest = function() {
	var currTile = 0;
	var x = 0;
	var y = 0;
	for (var currTile = 0; currTile < 9; ++currTile) {
		for (var red = 0; red < 2; ++red) {
			var tile = new Tile(currTile, red ? 2 : 3);
			while (!this.makeMove(tile, x, y)) {
				++x;
				if (x > 10) {
					x = 0;
					++y;
					if (y > 10) {
						return false;
					}
				}
			}
			console.log("made move to " + x + ":" + y + " with " + currTile);
			this.draw();
		}
	}
}

Board.prototype.rotateTest = function(tileNo) {
	var currRot = 0;
	var x = 0;
	var y = 0;
	while(true) {
		for (var red = 0; red < 2; ++red) {
			var tile = new Tile(tileNo, red ? 2 : 3);
			for (var i = 0; i < currRot; ++i) {
				tile.rotate();
			}
			while (!this.makeMove(tile, x, y)) {
				++x;
				if (x > 10) {
					x = 0;
					++y;
					if (y > 10) {
						return false;
					}
				}
			}
			console.log("made move to " + x + ":" + y + " with " + tileNo);
			++currRot;
			this.draw();
		}
	}
}

Board.prototype.randomTest = function() {
	var fails = 0;
	var possibleGamesEstimate = 1;
	console.time("randTest");
	while(true) {
		for (var blue = 0; blue < 2; ++blue) {
			var x = 0;
			var y = 0;
			var tiles = this.tilesAvailable[-blue + 1];
			if (tiles.length === 0) {
				return true;
			}
			var tileNo = tiles[Math.floor(Math.random() * tiles.length)];
			var tile = new Tile(tileNo, blue ? 2 : 3);
			var currRot = Math.floor(Math.random() * 6);
			if (tileNo > 0) {
				for (var i = 0; i < currRot; ++i) {
					tile.rotate();
				}
			}
			var poss = this.possibleMoves(blue + 2);
			while (!this.makeMove(tile, x, y)) {
				++x;
				if (x > 10) {
					x = 0;
					++y;
					if (y > 10) {
						if (++fails > 0) {
							console.timeEnd("randTest");
							return false;
						}
						break;
					}
				}
			}
			
			console.log("========");
			
			console.log(JSON.stringify(this.tilesAvailable));
			console.log("board score: " + this.score());
			//console.log("potential lengths: " + this.potentialLength(2), this.potentialLength(3));
			
			this.draw();
		}
	}
}

Board.prototype.nextMove = function() {
	var depth = 20;
	$("#status").html("Calculating next turn...");
	console.time("turn");
	var start = Date.now();
	positionsEvaled = 0;
	var move = this.minimaxSearch(!this.redPlays, depth);
	console.log(move);
	$("#status").html("Found next turn with tile no" + move[0].no + " to " + move[1] + ":" + move[2] + ". It took " + (Date.now() - start) / 1000 + "s. I evaluated " + positionsEvaled + " positions.");
	console.timeEnd("turn");
	if (move) {
		console.log("Best move for " + (this.redPlays ? "red" : "blue"));
		console.log(move);
		this.makeMove(...move, true);
		this.draw();
		//setTimeout(() => {this.nextMove();}, 0);
	}
}

Board.prototype.minimaxTest = function(depth) {
	this.nextMove();
}