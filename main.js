document.addEventListener('DOMContentLoaded', () => {
	let score = 0;
	let playerName = '';
	let currentLevel = 1;
	let maxLevel = 4;
	let gameLoop;
	let collisionLoop;
	let obstacleSpeed = 3.5;
	let isGameOver = false;
	let isWaitingToStart = false;
	const numObstacles = 4;
	const obstacles = [];
	const PLAYER_START_X = 30;
	let playerTop = 250; // Track player position globally
	
	const georgeface = document.getElementById('georgeface');
	const continueButton = document.getElementById('continueButton');
	const viewLeaderboardButton = document.getElementById('viewLeaderboardButton');
	const backToGameOverButton = document.getElementById('backToGameOverButton');
	const restartButton = document.getElementById('restartButton');
	const gameOverOverlay = document.getElementById('gameOverOverlay');
	const leaderboardOverlay = document.getElementById('leaderboardOverlay');
	const scoreElement = document.getElementById('score');
	
	georgeface.style.left = `${PLAYER_START_X}px`;
	
	function createObstacles() {
		const gameContainer = document.getElementById('gameContainer');
		const obstacle1 = document.getElementById('obstacle1');
		obstacles.push(obstacle1);
		
		for (let i = 1; i < numObstacles; i++) {
			const obstacle = document.createElement('div');
			obstacle.className = 'obstacle';
			obstacle.style.backgroundImage = 'url("./assets/envelope.svg")';
			obstacle.style.backgroundSize = 'contain';
			obstacle.style.backgroundRepeat = 'no-repeat';
			obstacle.style.width = '50px';
			obstacle.style.height = '50px';
			obstacle.style.position = 'absolute';
			obstacle.style.left = '900px';
			obstacle.style.top = Math.floor(Math.random() * 500) + 'px';
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
		
		document.getElementById('startOverlay').style.display = 'none';
		document.getElementById('loadingScreen').style.display = 'none';
		gameOverOverlay.style.display = 'none';
		leaderboardOverlay.style.display = 'none';
		
		georgeface.style.top = '250px';
		georgeface.style.left = `${PLAYER_START_X}px`;
		georgeface.style.backgroundImage = 'url("./assets/gl-face.png")';
		
		if (obstacles.length === 0) {
			createObstacles();
		}
		
		obstacles.forEach((obstacle, index) => {
			obstacle.style.left = (900 + (index * 200)) + 'px';
			obstacle.style.top = Math.floor(Math.random() * 500) + 'px';
		});
		
		updateLevel(1);
		scoreElement.textContent = 'Score: 0';
		
		if (gameLoop) clearInterval(gameLoop);
		if (collisionLoop) clearInterval(collisionLoop);
		
		showWelcomeMessage();
	}

	function moveObstacles() {
		const positions = obstacles.map(obstacle => parseInt(obstacle.style.left) || 900);
		const speeds = obstacles.map((_, index) => {
			let baseSpeed = obstacleSpeed;
			let variation;
			switch(currentLevel) {
				case 1:
					variation = index * 0.4;
					break;
				case 2:
					variation = index * 0.5;
					break;
				case 3:
					variation = index * 0.7;
					break;
				case 4:
					variation = index * 0.9;
					break;
			}
			return baseSpeed + variation;
		});
		
		playerTop = parseInt(georgeface.style.top) || 250;
		
		// Movement loop - handles obstacle movement
		gameLoop = setInterval(() => {
			if (isGameOver || isWaitingToStart) return;
			
			obstacles.forEach((obstacle, index) => {
				positions[index] -= speeds[index];
				obstacle.style.left = positions[index] + 'px';
				
				if (positions[index] <= -50) {
					const levelSpacing = currentLevel === 1 ? 25 : 50 * currentLevel;
					positions[index] = 900 + (Math.random() * levelSpacing);
					obstacle.style.left = positions[index] + 'px';
					
					if (currentLevel === 1) {
						const sections = 4;
						const sectionHeight = 500 / sections;
						const randomSection = Math.floor(Math.random() * sections);
						obstacle.style.top = (randomSection * sectionHeight + Math.random() * 50) + 'px';
					} else {
						const verticalRange = 500 - (currentLevel * 50);
						const verticalOffset = currentLevel * 25;
						obstacle.style.top = Math.floor(verticalOffset + Math.random() * verticalRange) + 'px';
					}
					updateScore();
				}
			});
		}, 16);
		
		// Collision detection loop - runs less frequently to reduce flickering
		collisionLoop = setInterval(() => {
			if (isGameOver || isWaitingToStart) return;
			
			// Update player position
			playerTop = parseInt(georgeface.style.top) || 250;
			
			obstacles.forEach((obstacle, index) => {
				const obstacleTop = parseInt(obstacle.style.top) || 0;
				const obstacleLeft = parseInt(obstacle.style.left) || 900;
				
				// Check collision using position values
				if (
					PLAYER_START_X < obstacleLeft + 50 &&
					PLAYER_START_X + 50 > obstacleLeft &&
					playerTop < obstacleTop + 50 &&
					playerTop + 50 > obstacleTop
				) {
					gameOver();
					return;
				}
			});
		}, 32); // Run collision detection at 30fps instead of 60fps
	}

	function updateLevel(level) {
		const container = document.getElementById('gameContainer');
		
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
			
			if (currentLevel === 2) {
				levelMessage.innerHTML = 'Level 2!<br><br>Score 90 points to reach the next level<br><br>Press up or down arrow to continue';
				georgeface.style.backgroundImage = 'url("./assets/tl-face.png")';
				isWaitingToStart = true;
			} else if (currentLevel === 3) {
				levelMessage.innerHTML = 'Level 3!<br><br>Score 120 points to reach the final level<br><br>Press up or down arrow to continue';
				georgeface.style.backgroundImage = 'url("./assets/ll-face.png")';
				isWaitingToStart = true;
			} else if (currentLevel === 4) {
				levelMessage.innerHTML = 'Final Level!<br><br>How far can you go?<br><br>Press up or down arrow to continue';
				isWaitingToStart = true;
			} else {
				levelMessage.textContent = `Level ${currentLevel}`;
				levelMessage.style.top = '16px';
				levelMessage.style.left = '16px';
				levelMessage.style.transform = 'none';
				levelMessage.style.padding = '8px 16px';
				setTimeout(() => levelMessage.remove(), 2000);
				return;
			}
			
			const startOnKeyPress = (e) => {
				if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isWaitingToStart) {
					isWaitingToStart = false;
					document.removeEventListener('keydown', startOnKeyPress);
					levelMessage.remove();
					moveObstacles();
				}
			};
			
			document.addEventListener('keydown', startOnKeyPress);
			document.getElementById('gameContainer').appendChild(levelMessage);
		}
	}

	function updateScore() {
		score++;
		scoreElement.textContent = `Score: ${score}`;
		checkLevelProgress();
	}

	function gameOver() {
		isGameOver = true;
		clearInterval(gameLoop);
		clearInterval(collisionLoop);
		document.getElementById('finalScore').textContent = `Score: ${score}`;
		gameOverOverlay.style.display = 'flex';
		
		const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
		leaderboard.push({ name: playerName, score: score });
		leaderboard.sort((a, b) => b.score - a.score);
		localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
		updateLeaderboard();
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
});
