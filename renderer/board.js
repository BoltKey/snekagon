function Tile(x, y, dirs, player) {
	this.dirs = dirs;
	this.player = player;
	this.x = x;
	this.y = y;
}

Tile.prototype.draw = function(bleed, depth=0) {
	ctx.save();
	if (depth === 0) {
		ctx.translate((this.x +  this.y * 0.5) * Math.sqrt(3) * board.hexSize, 
	              board.hexSize * 1.5 * this.y);
	}
	

	ctx.fillStyle = ["red", "blue", "gray"][this.player];
	drawHex(board.hexSize);
	if (bleed) {
		ctx.strokeStyle = ctx.fillStyle;
		ctx.lineWidth = board.hexSize * 0.5;
		ctx.lineCap = "round";
		ctx.stroke();
	}
	
	for (var d = 0; d < 6; ++d) {
		
		if (this.dirs === undefined || (d !== (this.dirs[depth]) % 6 && 
		    (d !== 3 || depth === 0) &&
			!(depth === 0 && [5, 0, 1].indexOf((6 - d + this.dirs[0]) % 6) === -1) && 
			!(depth === this.dirs.length && 
				[0, 1, 5].indexOf(d) > -1
			)
			)) {
			ctx.beginPath();
			var s = board.hexSize;
			ctx.moveTo(s * 0.5, -s * .2);
			ctx.lineTo(s * 0.7, -s * .3);
			ctx.lineTo(s * 0.7, s * .3);
			ctx.lineTo(s * 0.5, s * .2);
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fill();
			ctx.globalCompositeOperation = 'source-over';
		}
		ctx.rotate(Math.PI / 3);
	}
	if (this.dirs) {
		ctx.rotate(this.dirs[depth] * Math.PI / 3);
		ctx.translate(board.hexSize * Math.sqrt(3), 0);
		
		if (depth !== this.dirs.length) {
			this.draw(bleed, depth+1);
		}
	}
	
	ctx.restore();
	
}

Tile.prototype.rotate = function() {
	this.dirs[0] = (this.dirs[0] + 1) % 6;
}

function Board() {
	this.grid = [];
	this.tiles = [];
	this.x = -100;
	this.y = 30;
	for (var i = 0; i < 11; ++i) {
		var start = Math.max(0, 5 - i);
		this.grid.push([]);
		for (var j = 0; j < 11 - Math.abs(i - 5); ++j) {
			this.grid[i][j + start] = 1;
		}
	}
	this.hexSize = 30;
}
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
	//ctx.stroke();
	ctx.restore();
}
Board.prototype.draw = function(coords, drawBack = true) {
	
	
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.save();
	if (drawBack) {
		for (var y = 0; y < this.grid.length; ++y) {
			var row = this.grid[y];
			
			ctx.save();
			
			for (var x = 0; x < row.length; ++x) {
				if (this.grid[y][x]) {
					ctx.fillStyle = [0, "white", "red", "blue"][this.grid[y][x]];
					drawHex(this.hexSize);
					ctx.strokeStyle = "gray";
					ctx.stroke();
					ctx.fillStyle = "black";
					ctx.textAlign = "center";
					if (coords)
					  ctx.fillText(x + ":" + y, 0, 0);
					//ctx.fillText(-x-y, 0, 10);
				}
				ctx.translate(this.hexSize * Math.sqrt(3), 0);
			}
			ctx.restore();
			ctx.translate(this.hexSize * Math.sqrt(3) * .5, this.hexSize * 1.5);
		}
		
		ctx.restore();
	}
	for (var t of this.tiles) {
		t.draw();
	}
	ctx.restore();
}