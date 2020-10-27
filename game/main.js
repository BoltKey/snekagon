var canvas;
var ctx;
var board;
var tileSelected = 0;
var selectRotation = 0;
var selectFlip = 0;

/*
	[[1]],  // u 0
	[[1, 1]],  // d 1
	[[1, 1, 1]],  // w 2
	[[1, 1], [0, 1]],  // c 3
	[[1, 1], [0, 1, 1]],  // s 4
	[[1, 1, 1], [0, 0, 1]],  // l 5
	[[1, 1, 1, 1]],  // i 6
	[[0, 1, 1], [1, 0, 1]]  // u 7
*/

function main() {
	canvas = document.getElementsByTagName("canvas")[0];
	ctx = canvas.getContext("2d");
	
	
	board = new Board();
	
	$(canvas).click(function(e) {
		var y = Math.round((e.offsetY - board.y) / (board.hexSize * 1.5));
		var x = Math.round((e.offsetX - board.x - 0.5 * Math.sqrt(3) * board.hexSize * y) / (board.hexSize * Math.sqrt(3)));
		if (board.shadeTile) {
			board.shadeTile.player = board.redPlays ? 2 : 3;
			if (board.makeMove(board.shadeTile, x, y)) {
				board.shadeTile = undefined;
				board.draw();
				tileSelected = -1;
			}
		}
	});
	$(canvas).mousemove(function(e) {
		var y = Math.round((e.offsetY - board.y) / (board.hexSize * 1.5));
		var x = Math.round((e.offsetX - board.x - 0.5 * Math.sqrt(3) * board.hexSize * y) / (board.hexSize * Math.sqrt(3)));
		board.shadeX = x;
		board.shadeY = y;
		board.draw();
	});
	
	$(document).keydown(function(e) {
		if (+e.key >= 0 && +e.key <= 9) {
			tileSelected = e.key;
		}
		if (e.key === "r") {
			selectRotation += 1;
			selectRotation %= 6;
		}
		if (e.key === "f") {
			selectFlip += 1;
			selectFlip %= 2;
		}
		if (e.key === "n") {
			board.nextMove();
		}
		
		board.shadeTile = new Tile(+tileSelected, 4, selectRotation, selectFlip);
		board.draw();
	});
	
	//var tile = new Tile([2, 0, 1, 0]);
	prepareTiles();
	board.customInit();
	//board.minimaxTest();
	//board.randomTest();
	//board.makeMove(new Tile(0, 1, 0, 0), 0, 0);
	//board.makeMove(new Tile(0, 3, 0, 0), 6, 6);
	/*board.makeMove(new Tile(3, 3, 3, 0), 2, 4, true);
	board.makeMove(new Tile(4, 3, 2, 0), 3, 1, true);
	board.makeMove(new Tile(5, 3, 2, 1), 4, 4, true);
	board.makeMove(new Tile(7, 3, 3, 0), 8, 4, true);
	//board.makeMove(new Tile(2, 3, 0, 0), 7, 2, true);
	
	
	board.makeMove(new Tile(7, 2, 1, 0), 6, 5, true);
	board.makeMove(new Tile(6, 2, 0, 0), 1, 6, true);
	board.makeMove(new Tile(5, 2, 2, 0), 6, 6, true);*/
	//board.makeMove(new Tile(4, 2, 0, 0), 0, 8, true);
	//board.makeMove(new Tile(1, 2, 0, 0), 8, 0, true);
	
	//board.nextMove();
	board.draw();
}


onload = main;