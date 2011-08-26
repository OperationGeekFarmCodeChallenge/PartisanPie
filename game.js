/**
 * Partisan Pie
 * Operation Geek Farm Code Challenge
 */
(function() {

	var PLAYGROUND_WIDTH = 520;
	var PLAYGROUND_HEIGHT = 400;
	var PLAYER_WIDTH = 40;
	var PLAYER_HEIGHT = 50;
	var PIE_WIDTH = 50;
	var PIE_HEIGHT = 50;
	var PLAYER_INITIAL_OFFSET = 50;
	var PLAYER_MARGIN_BASELINE = 5;
	var PLAYER_MARGIN_CENTER = 20;
	var PLAYER_MARGIN_SIDELINES = 5;
	var PLAYER_SPEED_X = 4;
	var PLAYER_SPEED_Y = 4;
	var PIE_SPEED_X = 10;
	var REFRESH_RATE = 15;
	var FIRE_RATE = 250;
	var MAX_PIES_PER_PLAYER = 2;
	var STARTING_HEALTH = 3;

	var gameOver;
	var winningTeam;
	var p1_ai = false, p2_ai = false;
	var player1, player2;
	var player1name, player2name;
	var p1anim, p2anim;
	var pieAnim;
	var pies;
	var pieCounter;
	var background;
	var currentGameTime;
	var soundWrap;

	// Bounds that player is allowed to move within (x1, y1, x2, y2)
	var p1_bounds = [
		PLAYER_MARGIN_BASELINE,
		PLAYER_MARGIN_SIDELINES,
		(PLAYGROUND_WIDTH / 2) - PLAYER_WIDTH - PLAYER_MARGIN_CENTER,
		PLAYGROUND_HEIGHT - PLAYER_HEIGHT - PLAYER_MARGIN_SIDELINES
	];
	var p2_bounds = [
		(PLAYGROUND_WIDTH / 2) + PLAYER_MARGIN_CENTER,
		p1_bounds[1],
		PLAYGROUND_WIDTH - PLAYER_WIDTH - PLAYER_MARGIN_BASELINE,
		p1_bounds[3]
	];
	var pie_bounds = [
		-PIE_WIDTH,
		-PIE_HEIGHT,
		PLAYGROUND_WIDTH,
		PLAYGROUND_HEIGHT
	];

	function animationsForPlayer(playerName) {
		// ANIM_RATE is the delay between frames
		var ANIM_RATE = 30;
		var ANIM_RATE_DESTROY = 60;

		var a = new Array();

		// Idle
		a["idle"] = new $.gameQuery.Animation({
			imageURL: "img/head_" + playerName + "_idle.png",
			numberOfFrame: 6,
			delta: 50,
			rate: ANIM_RATE,
			type: $.gameQuery.ANIMATION_VERTICAL
		});
		a["destroy"] = new $.gameQuery.Animation({
			imageURL: "img/head_" + playerName + "_destroy.png",
			numberOfFrame: 6,
			delta: 50,
			rate: ANIM_RATE_DESTROY,
			type: $.gameQuery.ANIMATION_VERTICAL | $.gameQuery.ANIMATION_CALLBACK
		});

		return a;
	}

	function animationsForPie() {
		var ANIM_RATE = 30;
		var a = new Array();
		var animInfo = {
			imageURL: "img/flying_pie_left.png",
			numberOfFrame: 3,
			delta: 50,
			rate: ANIM_RATE,
			type: $.gameQuery.ANIMATION_VERTICAL
		};
		a[1] = new $.gameQuery.Animation(animInfo);
		animInfo.imageURL = "img/flying_pie_right.png";
		a[2] = new $.gameQuery.Animation(animInfo);
		return a;
	}

	function init() {
		gameOver = false;

		background = new $.gameQuery.Animation({imageURL: "background.png"});

		var p1_x = PLAYER_INITIAL_OFFSET - (PLAYER_WIDTH / 2);
		var p1_y = (PLAYGROUND_HEIGHT / 2) - (PLAYER_HEIGHT / 2);
		var p2_x = (PLAYGROUND_WIDTH - PLAYER_INITIAL_OFFSET) - (PLAYER_WIDTH / 2);
		var p2_y = (PLAYGROUND_HEIGHT / 2) - (PLAYER_HEIGHT / 2);

		p1anim = animationsForPlayer(player1name);
		p2anim = animationsForPlayer(player2name);
		pieAnim = animationsForPie();

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

		// Add HUD
		$('#overlay').append("<div id=\"health1\" class=\"health\">Health: XX</div><div id=\"health2\" class=\"health\">Health: YY</div>");

		// Add players
		player1 = new Player($('#player1'));
		player1.team = 1;
		player1.health = STARTING_HEALTH;
		player1.animations = p1anim;
		$('#player1')[0].player = player1;
		player2 = new Player($('#player2'));
		player2.team = 2;
		player2.health = STARTING_HEALTH;
		player2.animations = p2anim;
		$('#player2')[0].player = player2;

		// Game loop
		$.playground().registerCallback(gameTick, REFRESH_RATE);
		console.log("defined game loop");

		// Initialize other game state
		// Pies for team1 and team2
		pies = new Array();
		pies[1] = new Array();
		pies[2] = new Array();
		pieCounter = 0;
		
		//Initialize Audio
		soundWrap = new $.gameQuery.SoundWrapper("audio/chatter.mp3",true); 
		//Add sounds to which objects?
		
		// Display initial health counter
		updateHealth();
	}

	function Player(node) {
		this.node = $(node);
		this.lastFired = 0;
		this.team = 1;
		this.animations = {};
		return true;
	}

	function Pie(node) {
		this.node = $(node);
		this.team = 1;
		this.fired = currentGameTime;
		this.speed = PIE_SPEED_X;
		return true;
	}

	function gameTick() {

		currentGameTime = new Date().getTime();

		// Input player directions
		p1_dir = p1_ai ? [0, 0] : translateKeysToDirection(["A", "S", "D", "W"]);
		p2_dir = p2_ai ? [0, 0] : translateKeysToDirection(["J", "K", "L", "I"]);

		// Input firing
		p1_fire = p1_ai ? false : keyIsDown("F");
		p2_fire = p2_ai ? false : keyIsDown("H");

		// Update player positions
		updateActorPosition($('#player1'), p1_dir, p1_bounds, PLAYER_SPEED_X, PLAYER_SPEED_Y);
		updateActorPosition($('#player2'), p2_dir, p2_bounds, PLAYER_SPEED_X, PLAYER_SPEED_Y);

		// Attempt to fire
		if (p1_fire) fire($('#player1'));
		if (p2_fire) fire($('#player2'));

		// Update projectile positions and check for collisions
		var remove_pies = [];
		for (var teamId = 1; teamId <= 2; teamId++) {
			var dir = [teamId == 1 ? 1 : -1, 0];
			var enemyId = teamId == 1 ? "player2" : "player1";
			var enemy = $('#' + enemyId);
			for (var pieNum in pies[teamId]) {
				if (testCollision(enemy, pies[teamId][pieNum].node)) {
					// Collided with enemy!
					console.log("COLLIDE! Player " + teamId + " wins (enemyId=" + enemyId + ")");
					remove_pies.push([teamId, pieNum]);
					playerHit(teamId == 1 ? player2 : player1);
					continue;
				}

				// Check bounds
				var inBounds = updateActorPosition(pies[teamId][pieNum].node, dir, pie_bounds, PIE_SPEED_X, 0);
				if (!inBounds) {
					// Remove object (leaves hole in array, but that's OK)
					remove_pies.push([teamId, pieNum]);
				}

			}
		}

		// Actually remove pies
		for (var x = remove_pies.length - 1; x >= 0; x--) {
			var teamId = remove_pies[x][0];
			var pieNum = remove_pies[x][1];
			pies[teamId][pieNum].node.remove();
			pies[teamId].splice(pieNum, 1);
		}
	}

	function testCollision(node1, node2, leewayX, leewayY) {
		if (typeof leewayX == 'undefined') leewayX = 3;
		if (typeof leewayY == 'undefined') leewayY = 3;
		var node1L = parseInt(node1.css("left"));
		var node1R = node1L + parseInt(node1.css("width"));
		var node1T = parseInt(node1.css("top"));
		var node1B = node1T + parseInt(node1.css("height"));
		var node2L = parseInt(node2.css("left"));
		var node2R = node2L + parseInt(node2.css("width"));
		var node2T = parseInt(node2.css("top"));
		var node2B = node2T + parseInt(node2.css("height"));

		if (node1B - leewayY < node2T) return false;
		if (node1T + leewayY > node2B) return false;
		if (node1R - leewayX < node2L) return false;
		if (node1L + leewayX > node2R) return false;
		return true;
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

	function updateActorPosition(node, dir, bounds, speedX, speedY) {
		var x = parseInt(node.css("left"));
		var y = parseInt(node.css("top"));
		var oldX = x, oldY = y;

		if (dir[0] != 0) {
			x += dir[0] * speedX;
		}
		if (dir[1] != 0) {
			y += dir[1] * speedY;
		}

		var outOfBounds = false;
		if (x < bounds[0]) {
			outOfBounds = true;
			x = bounds[0];
		}
		if (x > bounds[2]) {
			x = bounds[2];
			outOfBounds = true;
		}
		if (y < bounds[1]) {
			y = bounds[1];
			outOfBounds = true;
		}
		if (y > bounds[3]) {
			y = bounds[3];
			outOfBounds = true;
		}

		node.css("left", "" + x + "px");
		node.css("top", "" + y + "px");

		return !outOfBounds;
	}

	function fire(node) {
		var p = node[0].player;
		var delta = currentGameTime - p.lastFired;
		if (delta < FIRE_RATE) {
			// Tried to fire too soon
			return;
		}
		if (pies[p.team].length >= MAX_PIES_PER_PLAYER) {
			// Too many pies on-screen
			console.log("too many pies");
			console.log(pies[p.team]);
			return;
		}

		// Fire!
		pieCounter++;
		var pieId = 'pie_' + pieCounter;
		var pieX = parseInt(node.css("left"));
		var pieY = parseInt(node.css("top"));
		if (p.team == 1) {
			pieX += PLAYER_WIDTH;
		} else {
			pieX -= PIE_WIDTH;
		}
		console.log("Firing pie for player on team " + p.team);
		console.log(pieAnim[p.team]);
		$('#team' + p.team + "pies").addSprite(pieId, {
			animation: pieAnim[p.team],
			posx: pieX,
			posy: pieY,
			width: PIE_WIDTH,
			height: PIE_HEIGHT
		});
		var pieObj = new Pie($('#' + pieId));
		pieObj.team = p.team;
		pies[p.team].push(pieObj);
		console.log("FIRED PIE " + pieCounter);
		p.lastFired = currentGameTime;
	}

	function updateHealth() {
		$('#health1').html("Health: " + player1.health);
		$('#health2').html("Health: " + player2.health);
	}

	function playerHit(player) {
		player.health--;
		updateHealth();
		$('#player' + player.team + 'Body').setAnimation(player.animations["destroy"], function(node) {
			console.log("First destroy animation sequence over; setting back to idle");
			$(node).setAnimation(player.animations["idle"]);
			if (player.health == 0) {
				// Player is dead!
				gameOver = true;
				winningTeam = player.team == 1 ? 2 : 1;
				alert("Team " + winningTeam + " wins!");
			}
		});
	}
	function capitaliseFirstLetter(string)
	{
    	return string.charAt(0).toUpperCase() + string.slice(1);
	}

	$(document).ready(function() {
		var players = ["obama", "romney"];

		$('#pickplayers').click(function() {
			
			function setPlayer(team, index) {
				$('#playersChoice'+team).css('background-image', 'url(img/'+players[index]+'.png)');
				$('#playersChoice'+team)[0].playerIndex = index;
				$('#playersChoiceName'+team).html(capitaliseFirstLetter(players[index]));
			}
			
			setPlayer(1, 1);
			setPlayer(2, 0);
			
			$('#playersChoice1').click(function() {
				setPlayer(1, (this.playerIndex + 1) % players.length);
			});
			$('#playersChoice2').click(function() {
				setPlayer(2, (this.playerIndex + 1) % players.length);
			});
			
			console.log("pick players");
			$('#welcomeScreen').fadeTo(1000, 0, function() {
				$(this).remove();
			});
			$('#playersScreen').fadeTo(1000, 1, function() {
			});
		});

		$('#startbutton').click(function() {
			player1name = players[$('#playersChoice1')[0].playerIndex];
			player2name = players[$('#playersChoice2')[0].playerIndex];
			
			init();
			
			console.log("startGame");
			$.playground().startGame(function() {
				$('#playersScreen').fadeTo(1000, 0, function() {
					$(this).remove();
				});
			});
		});

	});
	
	

}())

