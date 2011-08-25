/**
 * Partisan Pie
 * Operation Geek Farm Code Challenge
 */
(function() {

	var PLAYGROUND_WIDTH = 520;
	var PLAYGROUND_HEIGHT = 400;
	var PLAYER_WIDTH = 40;
	var PLAYER_HEIGHT = 50;
	var PLAYER_INITIAL_OFFSET = 50;
	var PLAYER_SPEED_X = 4;
	var PLAYER_SPEED_Y = 4;
	var REFRESH_RATE = 15;

	var player1, player2;
	var p1anim, p2anim;
	var pies;
	var background;

	function animationsForPlayer(playerName) {
		// ANIM_RATE is the delay between frames
		var ANIM_RATE = 30;

		var a = new Array();

		// Idle
		a["idle"] = new $.gameQuery.Animation({
			imageURL: "img/head_" + playerName + "_idle.png",
			numberOfFrame: 6,
			delta: 50,
			rate: ANIM_RATE,
			type: $.gameQuery.ANIMATION_VERTICAL
		});

		return a;
	}

	function init() {
		background = new $.gameQuery.Animation({imageURL: "background.png"});

		var p1_x = PLAYER_INITIAL_OFFSET - (PLAYER_WIDTH / 2);
		var p1_y = (PLAYGROUND_HEIGHT / 2) - (PLAYER_HEIGHT / 2);
		var p2_x = (PLAYGROUND_WIDTH - PLAYER_INITIAL_OFFSET) - (PLAYER_WIDTH / 2);
		var p2_y = (PLAYGROUND_HEIGHT / 2) - (PLAYER_HEIGHT / 2);

		p1anim = animationsForPlayer("romney");
		p2anim = animationsForPlayer("obama");

		// Initialize game
		$("#playground").playground({width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, keyTracker: true});
		$.playground().addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
					.addSprite("background1", {animation: background, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
				.end()
				.addGroup("actors", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
					.addGroup("player1", {posx: p1_x, posy: p1_y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT})
						.addSprite("player1Body", {animation: p1anim["idle"], posx: 0, posy: 0, width: PLAYER_WIDTH, height: PLAYER_HEIGHT})
					.end()
					.addGroup("player2", {posx: p2_x, posy: p2_y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT})
						.addSprite("player2Body", {animation: p2anim["idle"], posx: 0, posy: 0, width: PLAYER_WIDTH, height: PLAYER_HEIGHT})
					.end()
				.addGroup("team1pies", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
				.addGroup("team2pies", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
				.addGroup("overlay", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT});

		// Add players
		player1 = new Player($('#player1'));
		$('#player1')[0].player = player1;
		player2 = new Player($('#player2'));
		$('#player2')[0].player = player2;

		// Game loop
		$.playground().registerCallback(gameTick, REFRESH_RATE);
		console.log("defined game loop");
	}

	function Player(node) {
		this.node = $(node);
		return true;
	}

	function gameTick() {

		// Inputs
		p1_dir = translateKeysToDirection(["A", "S", "D", "W"]);
		p2_dir = translateKeysToDirection(["J", "K", "L", "I"]);

		// Update player positions
		updatePlayerPosition($('#player1'), p1_dir);
		updatePlayerPosition($('#player2'), p2_dir);

		// Update projectile positions

		// Collision detection
	}

	function translateKeysToDirection(keysLDRU) {
		var dir = [0, 0];
		if (keyIsDown(keysLDRU[0])) {
			// Left
			dir[0] -= 1;
		}
		if (keyIsDown(keysLDRU[1])) {
			dir[1] += 1;
		}
		if (keyIsDown(keysLDRU[2])) {
			dir[0] += 1;
		}
		if (keyIsDown(keysLDRU[3])) {
			dir[1] -= 1;
		}
		return dir;
	}

	function keyIsDown(char) {
		return $.gameQuery.keyTracker[char.charCodeAt(0)];
	}

	function updatePlayerPosition(node, dir, bounds) {
		var x = parseInt(node.css("left"));
		var y = parseInt(node.css("top"));
		if (dir[0] != 0) {
			x += dir[0] * PLAYER_SPEED_X;
		}
		if (dir[1] != 0) {
			y += dir[1] * PLAYER_SPEED_Y;
		}
		node.css("left", "" + x + "px");
		node.css("top", "" + y + "px");
	}

	$(document).ready(function() {
		init();

		$('#pickplayers').click(function() {
			console.log("pick players");
			$('#welcomeScreen').fadeTo(1000, 0, function() {
				$(this).remove();
			});
			$('#playersScreen').fadeTo(1000, 1, function() {
				var players = ['obama'];
				
				for (i = 0; i < players.length; ++i)
				{
					// add player to menu
				}
			});
		});

		$('#startbutton').click(function() {
			console.log("startGame");
			$.playground().startGame(function() {
				$('#playersScreen').fadeTo(1000, 0, function() {
					$(this).remove();
				});
			});
		});

	});

}())

