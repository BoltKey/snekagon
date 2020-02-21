var canvas;
var ctx;
var board;

function main() {
	canvas = document.getElementsByTagName("canvas")[0];
	ctx = canvas.getContext("2d");
	board = new Board();
	var tile = new Tile([2, 0, 1, 0]);
	prepareTiles();
	board.randomTest();
	board.draw();
}


onload = main;