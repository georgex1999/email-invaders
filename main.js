document.addEventListener('DOMContentLoaded', () => {
	let score = 0;
	let playerName = '';
	let currentLevel = 1;
	let maxLevel = 4;
	let obstacleSpeed = 3.5;
	let isGameOver = false;
	let isWaitingToStart = false;
	let hasWon = false;
	const numObstacles = 4;
	const obstacles = [];
	let obstaclePositions = [];
	const PLAYER_START_X = 30;
	let playerTop = 250; // Track player position globally
	let animationFrameId;
	let lives = 3;
	const HITBOX_PADDING = 8; // Shrinks hitbox by 8px on all sides for fairness
	
	const georgeface = document.getElementById('georgeface');
	const continueButton = document.getElementById('continueButton');
	const viewLeaderboardButton = document.getElementById('viewLeaderboardButton');
	const backToGameOverButton = document.getElementById('backToGameOverButton');
	const restartButton = document.getElementById('restartButton');
	const gameOverOverlay = document.getElementById('gameOverOverlay');
	const leaderboardOverlay = document.getElementById('leaderboardOverlay');
	const scoreElement = document.getElementById('score');
	const livesContainer = document.getElementById('livesContainer');
	const winOverlay = document.getElementById('winOverlay');
	const continueAfterWinButton = document.getElementById('continueAfterWinButton');
	
	georgeface.style.left = `${PLAYER_START_X}px`;
	
	function createObstacles() {
		const gameContainer = document.getElementById('gameContainer');
		for (let i = 0; i < numObstacles; i++) {
			const obstacle = document.createElement('div');
			obstacle.className = 'obstacle';
			obstacle.style.backgroundImage = 'url("./assets/envelope.svg")';
			obstacle.style.backgroundSize = 'contain';
			obstacle.style.backgroundRepeat = 'no-repeat';
			obstacle.style.width = '50px';
			obstacle.style.height = '50px';
			obstacle.style.position = 'absolute';
			obstacle.style.left = '900px';
			obstacle.style.top = Math.floor(Math.random() * 550) + 'px';
			gameContainer.appendChild(obstacle);
			obstacles.push(obstacle);
		}
	}

	if (!localStorage.getItem('leaderboard')) {
		localStorage.setItem('leaderboard', JSON.stringify([
			{ name: 'Taran', score: 300 }
		]));
	}

	function updateLeaderboard() {
		const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
		const leaderboardList = document.getElementById('leaderboardList');
		leaderboardList.innerHTML = leaderboard
			.sort((a, b) => b.score - a.score)
			.slice(0, 10)
			.map((entry, index) => `${index + 1}. ${entry.name}: ${entry.score}`)
			.join('<br>');
	}

	function showWelcomeMessage() {
		isWaitingToStart = true;
		const welcomeMessage = document.createElement('div');
		welcomeMessage.style.position = 'absolute';
		welcomeMessage.style.top = '50%';
		welcomeMessage.style.left = '50%';
		welcomeMessage.style.transform = 'translate(-50%, -50%)';
		welcomeMessage.style.background = 'rgba(0,0,0,0.85)';
		welcomeMessage.style.color = '#fff';
		welcomeMessage.style.padding = '24px 32px';
		welcomeMessage.style.borderRadius = '12px';
		welcomeMessage.style.fontSize = '1.2em';
		welcomeMessage.style.fontFamily = 'monospace';
		welcomeMessage.style.textAlign = 'center';
		welcomeMessage.style.zIndex = '1000';
		welcomeMessage.innerHTML = 'Score 30 points to reach the next level<br><br>Press up or down arrow to continue';
		document.getElementById('gameContainer').appendChild(welcomeMessage);

		const startOnKeyPress = (e) => {
			if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isWaitingToStart) {
				isWaitingToStart = false;
				document.removeEventListener('keydown', startOnKeyPress);
				welcomeMessage.remove();
				moveObstacles();
			}
		};

		document.addEventListener('keydown', startOnKeyPress);
	}

	function startGame() {
		playerName = document.getElementById('playerNameInput').value;
		if (!playerName) {
			alert('Please enter your name!');
			return;
		}
		
		score = 0;
		currentLevel = 1;
		obstacleSpeed = 3.5;
		isGameOver = false;
		isWaitingToStart = false;
		hasWon = false;
		lives = 3;
		
		document.getElementById('startOverlay').style.display = 'none';
		document.getElementById('loadingScreen').style.display = 'none';
		gameOverOverlay.style.display = 'none';
		leaderboardOverlay.style.display = 'none';
		
		georgeface.style.top = '250px';
		georgeface.style.left = `${PLAYER_START_X}px`;
		
		if (obstacles.length === 0) {
			createObstacles();
		}
		
		obstaclePositions = []; // Clear and reset positions
		obstacles.forEach((obstacle, index) => {
			const startLeft = 900 + (index * 200);
			obstacle.style.left = startLeft + 'px';
			obstacle.style.top = Math.floor(Math.random() * 500) + 'px';
			obstaclePositions.push(startLeft);
		});
		
		updateLevel(1);
		scoreElement.textContent = 'Score: 0';
		updateLivesDisplay();
		
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
		
		showWelcomeMessage();
	}

	function moveAndCollideObstacles() {
		if (isGameOver || isWaitingToStart) return;

		playerTop = parseInt(georgeface.style.top) || 250;
		const playerBox = {
			left: PLAYER_START_X + HITBOX_PADDING,
			right: PLAYER_START_X + 50 - HITBOX_PADDING,
			top: playerTop + HITBOX_PADDING,
			bottom: playerTop + 50 - HITBOX_PADDING,
		};

		for (let i = 0; i < obstacles.length; i++) {
			let currentLeft = obstaclePositions[i];
			let baseSpeed = obstacleSpeed;
			let variation = 0;
			switch(currentLevel) {
				case 1: variation = i * 0.4; break;
				case 2: variation = i * 0.5; break;
				case 3: variation = i * 0.7; break;
				case 4: variation = i * 0.9; break;
			}
			let speed = baseSpeed + variation;
			currentLeft -= speed;
			
			if (currentLeft <= -50) {
				const levelSpacing = currentLevel === 1 ? 25 : 50 * currentLevel;
				currentLeft = 900 + Math.random() * levelSpacing;
				const newObstacleImage = getObstacleImageForLevel(currentLevel);
				obstacles[i].style.top = Math.round(Math.random() * 550) + 'px';
				obstacles[i].style.backgroundImage = newObstacleImage;
				updateScore();
			}
			
			obstaclePositions[i] = currentLeft;
			obstacles[i].style.left = Math.round(currentLeft) + 'px';
			
			const obstacleTop = parseInt(obstacles[i].style.top) || 0;
			const obstacleBox = {
				left: Math.round(currentLeft) + HITBOX_PADDING,
				right: Math.round(currentLeft) + 50 - HITBOX_PADDING,
				top: obstacleTop + HITBOX_PADDING,
				bottom: obstacleTop + 50 - HITBOX_PADDING,
			};

			if (
				playerBox.left < obstacleBox.right &&
				playerBox.right > obstacleBox.left &&
				playerBox.top < obstacleBox.bottom &&
				playerBox.bottom > obstacleBox.top
			) {
				handleCollision();
				return;
			}
		}

		animationFrameId = requestAnimationFrame(moveAndCollideObstacles);
	}

	function moveObstacles() {
		if (isGameOver || isWaitingToStart) return;
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		animationFrameId = requestAnimationFrame(moveAndCollideObstacles);
	}

	function updateLevel(level) {
		const container = document.getElementById('gameContainer');
		const newObstacleImage = getObstacleImageForLevel(level);
		
		obstacles.forEach(obstacle => {
			obstacle.style.backgroundImage = newObstacleImage;
		});

		switch(level) {
			case 1:
				container.style.background = 'url("./assets/level1-background.png") no-repeat center center';
				container.style.backgroundSize = 'cover';
				obstacleSpeed = 3.5;
				georgeface.style.backgroundImage = 'url("./assets/gl-face.png")';
				break;
			case 2:
				container.style.background = 'url("./assets/level2-background.png") no-repeat center center';
				container.style.backgroundSize = 'cover';
				obstacleSpeed = 6;
				georgeface.style.backgroundImage = 'url("./assets/tl-face.png")';
				break;
			case 3:
				container.style.background = 'url("./assets/level3-background.png") no-repeat center center';
				container.style.backgroundSize = 'cover';
				obstacleSpeed = 8;
				georgeface.style.backgroundImage = 'url("./assets/ll-face.png")';
				break;
			case 4:
				container.style.background = 'url("./assets/level4-background.png") no-repeat center center';
				container.style.backgroundSize = 'cover';
				obstacleSpeed = 11;
				georgeface.style.backgroundImage = 'url("./assets/is-face.png")';
				break;
		}
	}

	function checkLevelProgress() {
		const newLevel = Math.floor(score / 30) + 1;
		
		if (newLevel <= maxLevel && newLevel !== currentLevel) {
			currentLevel = newLevel;
			updateLevel(currentLevel);
			
			// Pause the game and show level message
			isWaitingToStart = true;
			const levelMessage = document.createElement('div');
			levelMessage.style.position = 'absolute';
			levelMessage.style.top = '50%';
			levelMessage.style.left = '50%';
			levelMessage.style.transform = 'translate(-50%, -50%)';
			levelMessage.style.background = 'rgba(0,0,0,0.85)';
			levelMessage.style.color = '#fff';
			levelMessage.style.padding = '24px 32px';
			levelMessage.style.borderRadius = '12px';
			levelMessage.style.fontSize = '1.2em';
			levelMessage.style.fontFamily = 'monospace';
			levelMessage.style.textAlign = 'center';
			levelMessage.style.zIndex = '1000';
			
			let messageText = '';
			if (currentLevel === 2) {
				messageText = 'Level 2!<br><br>Score 60 points to reach the next level<br><br>Press up or down arrow to continue';
			} else if (currentLevel === 3) {
				messageText = 'Level 3!<br><br>Score 90 points to reach the final level<br><br>Press up or down arrow to continue';
			} else if (currentLevel === 4) {
				messageText = 'Final Level!<br><br>How far can you go?<br><br>Press up or down arrow to continue';
			}
			levelMessage.innerHTML = messageText;
			
			const startOnKeyPress = (e) => {
				if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isWaitingToStart) {
					isWaitingToStart = false;
					document.removeEventListener('keydown', startOnKeyPress);
					levelMessage.remove();
					moveObstacles(); // Resume game
				}
			};
			
			document.addEventListener('keydown', startOnKeyPress);
			document.getElementById('gameContainer').appendChild(levelMessage);
		}
	}

	function updateScore() {
		score++;
		scoreElement.textContent = `Score: ${score}`;
		if (score >= 500 && !hasWon) {
			showWinScreen();
		}
		checkLevelProgress();
	}

	function handleCollision() {
		cancelAnimationFrame(animationFrameId);
		lives--;
		updateLivesDisplay();

		if (lives > 0) {
			isWaitingToStart = true;
			setTimeout(() => {
				restartCurrentLevel();
			}, 1000);
		} else {
			gameOver();
		}
	}

	function restartCurrentLevel() {
		playerTop = 250;
		georgeface.style.top = `${playerTop}px`;
		obstaclePositions = [];
		obstacles.forEach((obstacle, index) => {
			const startLeft = 900 + (index * 250); // Increased spacing on restart
			obstacle.style.left = startLeft + 'px';
			obstacle.style.top = Math.round(Math.random() * 550) + 'px';
			obstaclePositions.push(startLeft);
		});
		isWaitingToStart = false;
		moveObstacles();
	}

	function gameOver() {
		isGameOver = true;
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		document.getElementById('finalScore').textContent = `Score: ${score}`;
		gameOverOverlay.style.display = 'flex';
		
		const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
		leaderboard.push({ name: playerName, score: score });
		leaderboard.sort((a, b) => b.score - a.score);
		localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
		updateLeaderboard();
	}

	function getObstacleImageForLevel(level) {
		switch (level) {
			case 2: return 'url("./assets/football.svg")';
			case 3: return 'url("./assets/raincloud.svg")';
			case 4: return 'url("./assets/pumpkin.svg")';
			default: return 'url("./assets/envelope.svg")';
		}
	}

	function showWinScreen() {
		hasWon = true;
		isWaitingToStart = true;
		if (winOverlay) {
			winOverlay.style.display = 'flex';
		}
		if (typeof confetti === 'function') {
			confetti({
				particleCount: 200,
				spread: 180,
				origin: { y: 0.6 }
			});
		}
	}

	continueButton.addEventListener('click', startGame);
	
	viewLeaderboardButton.addEventListener('click', () => {
		gameOverOverlay.style.display = 'none';
		leaderboardOverlay.style.display = 'flex';
		updateLeaderboard();
	});
	
	backToGameOverButton.addEventListener('click', () => {
		leaderboardOverlay.style.display = 'none';
		gameOverOverlay.style.display = 'flex';
	});
	
	restartButton.addEventListener('click', startGame);

	if (continueAfterWinButton) {
		continueAfterWinButton.addEventListener('click', () => {
			if (winOverlay) {
				winOverlay.style.display = 'none';
			}
			isWaitingToStart = false;
			moveObstacles();
		});
	}

	document.addEventListener('keydown', (e) => {
		if (isGameOver) return;
		
		const currentTop = parseInt(georgeface.style.top) || 250;
		
		if (e.key === 'ArrowUp' && currentTop > 0) {
			georgeface.style.top = (currentTop - 20) + 'px';
			playerTop = currentTop - 20; // Update global position
		}
		if (e.key === 'ArrowDown' && currentTop < 500) {
			georgeface.style.top = (currentTop + 20) + 'px';
			playerTop = currentTop + 20; // Update global position
		}
	});

	// Mobile controls
	function handleMobileUp() {
		if (isGameOver) return;
		const currentTop = parseInt(georgeface.style.top) || 250;
		if (currentTop > 0) {
			georgeface.style.top = (currentTop - 20) + 'px';
			playerTop = currentTop - 20;
		}
	}
	function handleMobileDown() {
		if (isGameOver) return;
		const currentTop = parseInt(georgeface.style.top) || 250;
		if (currentTop < 500) {
			georgeface.style.top = (currentTop + 20) + 'px';
			playerTop = currentTop + 20;
		}
	}
	if (window.innerWidth < 600) {
		const upBtn = document.getElementById('mobileUpBtn');
		const downBtn = document.getElementById('mobileDownBtn');
		if (upBtn && downBtn) {
			upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileUp(); });
			downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileDown(); });
		}
		// Swipe support
		let touchStartY = null;
		document.getElementById('gameContainer').addEventListener('touchstart', (e) => {
			if (e.touches.length === 1) {
				touchStartY = e.touches[0].clientY;
			}
		});
		document.getElementById('gameContainer').addEventListener('touchend', (e) => {
			if (touchStartY !== null && e.changedTouches.length === 1) {
				const touchEndY = e.changedTouches[0].clientY;
				if (touchEndY < touchStartY - 30) {
					handleMobileUp();
				} else if (touchEndY > touchStartY + 30) {
					handleMobileDown();
				}
			}
			touchStartY = null;
		});
	}

	function updateLivesDisplay() {
		if (livesContainer) {
			livesContainer.innerHTML = '♥ '.repeat(lives);
		}
	}
});
