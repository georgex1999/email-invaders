document.addEventListener('DOMContentLoaded', () => {
	let score = 0;
	let playerName = '';
	let currentLevel = 1;
	let maxLevel = 3;
	let gameLoop;
	let obstacleSpeed = 4;
	let isGameOver = false;
	const numObstacles = 3;
	const obstacles = [];
	
	const georgeface = document.getElementById('georgeface');
	const continueButton = document.getElementById('continueButton');
	const viewLeaderboardButton = document.getElementById('viewLeaderboardButton');
	const backToGameOverButton = document.getElementById('backToGameOverButton');
	const restartButton = document.getElementById('restartButton');
	const gameOverOverlay = document.getElementById('gameOverOverlay');
	const leaderboardOverlay = document.getElementById('leaderboardOverlay');
	const scoreElement = document.getElementById('score');
	
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

	function startGame() {
		playerName = document.getElementById('playerNameInput').value;
		if (!playerName) {
			alert('Please enter your name!');
			return;
		}
		
		score = 0;
		currentLevel = 1;
		obstacleSpeed = 4;
		isGameOver = false;
		
		document.getElementById('startOverlay').style.display = 'none';
		document.getElementById('loadingScreen').style.display = 'none';
		gameOverOverlay.style.display = 'none';
		leaderboardOverlay.style.display = 'none';
		
		georgeface.style.top = '250px';
		
		if (obstacles.length === 0) {
			createObstacles();
		}
		
		obstacles.forEach((obstacle, index) => {
			obstacle.style.left = (900 + (index * 300)) + 'px';
			obstacle.style.top = Math.floor(Math.random() * 500) + 'px';
		});
		
		updateLevel(1);
		
		scoreElement.textContent = 'Score: 0';
		
		if (gameLoop) clearInterval(gameLoop);
		
		moveObstacles();
	}

	function moveObstacles() {
		const positions = obstacles.map(obstacle => parseInt(obstacle.style.left) || 900);
		const speeds = obstacles.map((_, index) => obstacleSpeed + (index * 0.5));
		
		gameLoop = setInterval(() => {
			if (isGameOver) return;
			
			obstacles.forEach((obstacle, index) => {
				positions[index] -= speeds[index];
				obstacle.style.left = positions[index] + 'px';
				
				const playerRect = georgeface.getBoundingClientRect();
				const obstacleRect = obstacle.getBoundingClientRect();
				
				if (
					playerRect.left < obstacleRect.right &&
					playerRect.right > obstacleRect.left &&
					playerRect.top < obstacleRect.bottom &&
					playerRect.bottom > obstacleRect.top
				) {
					gameOver();
					return;
				}
				
				if (positions[index] <= -50) {
					positions[index] = 900;
					obstacle.style.left = positions[index] + 'px';
					obstacle.style.top = Math.floor(Math.random() * 500) + 'px';
					updateScore();
				}
			});
		}, 16);
	}

	function updateLevel(level) {
		const container = document.getElementById('gameContainer');
		
		switch(level) {
			case 1:
				container.style.background = 'url("./assets/level1-background.png") no-repeat center center';
				container.style.backgroundSize = 'cover';
				obstacleSpeed = 4;
				break;
			case 2:
				container.style.background = 'url("./assets/background-new.png") no-repeat center center';
				container.style.backgroundSize = 'cover';
				obstacleSpeed = 5.5;
				break;
			case 3:
				container.style.background = 'url("./assets/background-bars.svg") no-repeat center center';
				container.style.backgroundSize = 'cover';
				obstacleSpeed = 7;
				break;
		}
	}

	function checkLevelProgress() {
		const newLevel = Math.floor(score / 30) + 1;
		if (newLevel <= maxLevel && newLevel !== currentLevel) {
			currentLevel = newLevel;
			updateLevel(currentLevel);
			
			const levelMessage = document.createElement('div');
			levelMessage.textContent = `Level ${currentLevel}!`;
			levelMessage.style.position = 'absolute';
			levelMessage.style.top = '50%';
			levelMessage.style.left = '50%';
			levelMessage.style.transform = 'translate(-50%, -50%)';
			levelMessage.style.color = '#fff';
			levelMessage.style.fontSize = '3em';
			levelMessage.style.fontFamily = 'monospace';
			levelMessage.style.zIndex = '1000';
			document.getElementById('gameContainer').appendChild(levelMessage);
			
			setTimeout(() => levelMessage.remove(), 2000);
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
		}
		if (e.key === 'ArrowDown' && currentTop < 500) {
			georgeface.style.top = (currentTop + 20) + 'px';
		}
	});
});
