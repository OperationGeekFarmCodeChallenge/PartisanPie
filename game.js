/**
 * Partisan Pie
 * Operation Geek Farm Code Challenge
 */
(function() {

	var PLAYGROUND_WIDTH = 520;
	var PLAYGROUND_HEIGHT = 400;
	var PLAYER_WIDTH = 50;
	var PLAYER_HEIGHT = 50;
	var PLAYER_INITIAL_OFFSET = 50;

	var player1, player2;
	var pies;
	var background;

	function init() {
		background = new $.gameQuery.Animation({imageURL: "background.png"});

		var p1_x = PLAYER_INITIAL_OFFSET;
		var p1_y = PLAYGROUND_HEIGHT / 2;
		var p2_x = PLAYGROUND_WIDTH - PLAYER_INITIAL_OFFSET;
		var p2_y = PLAYGROUND_HEIGHT / 2;

		// Initialize game
		$("#playground").playground({width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
				.addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
				.addGroup("actors", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
					.addGroup("player1", {posx: p1_x, posy: p1_y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT}).end()
					.addGroup("player2", {posx: p2_x, posy: p2_y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT}).end()
				.addGroup("team1pies", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
				.addGroup("team2pies", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
				.addGroup("overlay", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT});

		// Add players
		$('#player1')[0].player = new Player($('#player1'));
		$('#player2')[0].player = new Player($('#player2'));
	}

	function Player(node) {
		this.node = $(node);
	}

	// Game loop
	$.playground().registerCallback(function() {
	});

}())

