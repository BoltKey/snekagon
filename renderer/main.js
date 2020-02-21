var canvas;
var ctx;
var board;

function main() {
	canvas = document.getElementsByTagName("canvas")[0];
	ctx = canvas.getContext("2d");
	board = new Board();
	board.tiles.push(new Tile(4, 1, [0, 0, 0, 0], 1));
	board.tiles.push(new Tile(3, 3, [0, 0, 0, 1], 1));
	board.tiles.push(new Tile(10, 1, [0, 0, 1, 0], 1));
	board.tiles.push(new Tile(8, 3, [0, 1, 1, 0], 1));
	board.tiles.push(new Tile(1, 5, [0, 1, 0, 1], 1));
	board.tiles.push(new Tile(-1, 10, [0, 1, 5, 0], 1));
	board.tiles.push(new Tile(4, 7, [0, 1, 5, 1], 1));
	board.tiles.push(new Tile(14, 1, [0, 1, 1, 5], 1));
	board.tiles.push(new Tile(10, 5, [0, 1, 1, 1], 1));
	board.tiles.push(new Tile(10, 9, [0, 1, 0, 5], 1));
	
	
	
	board.draw(false, false);
	board.tiles[0].x = 6;
	board.tiles[0].y = 1;
	ctx.translate(0, 1520);
	board.draw(true);
	ctx.translate(canvas.width / 2, 900);
	//renderPnpPieces();
}

function renderPnpPieces() {
	var data = [];
	for (var c = 0; c < 2; ++c) {
		ctx.translate(0, c * 750);
		for (var s = 1; s > -2; s -= 2) {
			ctx.save();
			
			ctx.scale(s, 1);
			
			var t = new Tile(0, 0, [3, 5, 0], c);
			ctx.translate(-50, 0);
			t.draw(s===1);
			t = new Tile(0, 0, [2, 0], c);
			ctx.translate(-20, 100);
			t.draw(s===1);
			t = new Tile(0, 0, [2, 1, 5], c);
			ctx.translate(-160, -80);
			t.draw(s===1);
			t = new Tile(0, 0, [3, 5], c);
			ctx.translate(-80, -70);
			t.draw(s===1);
			t = new Tile(0, 0, [1, 0, 0], c);
			ctx.translate(30, 230);
			t.draw(s===1);
			t = new Tile(0, 0, [1, 1, 1], c);
			ctx.translate(-80, 70);
			t.draw(s===1);
			t = new Tile(0, 0, [2], c);
			ctx.translate(300, 120);
			t.draw(s===1);
			if (s === -1) {
				ctx.font = "60px Arial";
				ctx.fillText("✂", -200, 100);
			}
			if (c === 0) {
				t = new Tile(0, 0, [], c);
				ctx.translate(10, -100);
				t.draw(s===1);
				ctx.translate(0, 280);
				for (var i = 0; i < 4; ++i) {
					t = new Tile(0, 0, undefined, 2);
					t.draw(s===1);
					ctx.translate(-80, 0);
				}
			}
			
			ctx.restore();
			
		}
		ctx.beginPath();
		ctx.moveTo(0, -80);
		ctx.lineTo(0, 600);
		ctx.setLineDash([15]);
		ctx.stroke();
		ctx.setLineDash([]);
	}
	
}


onload = main;