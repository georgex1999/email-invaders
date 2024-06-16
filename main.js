document.addEventListener('DOMContentLoaded', () => {
  const georgeface = document.getElementById('georgeface');
  const obstacles = document.querySelectorAll('.obstacle');
  const gameOverMessage = document.getElementById('gameOverMessage');
  const scoreElement = document.getElementById('score');
  const startButton = document.getElementById('startButton');
  let georgefaceBottom = 20;
  let gameOver = false;
  let score = 0;
  const initialSpeeds = [5, 6, 7, 8];
  let obstacleSpeeds = [...initialSpeeds];
  const speedIncrementInterval = 5000; // Increase speed every 5 seconds
  const sadFaceURL = 'https://i.ibb.co/PDLC7T4/Face-hit2.png'; // Replace with your sad face image URL
  let moveObstaclesInterval;
  let increaseSpeedInterval;

  function control(e) {
    if (gameOver) return;
    if (e.key === 'ArrowUp') {
      if (georgefaceBottom < 350) georgefaceBottom += 10;
    } else if (e.key === 'ArrowDown') {
      if (georgefaceBottom > 0) georgefaceBottom -= 10;
    }
    georgeface.style.bottom = georgefaceBottom + 'px';
  }

  document.addEventListener('keydown', control);

  function moveObstacles() {
    if (gameOver) return;
    obstacles.forEach((obstacle, index) => {
      let obstacleLeft = parseInt(obstacle.style.left || 600);
      obstacleLeft -= obstacleSpeeds[index];
      if (obstacleLeft < -30) {
        obstacleLeft = 600;
        let newTop;
        let validPosition = false;

        while (!validPosition) {
          newTop = Math.random() * 370;
          validPosition = true;

          // Check for overlap with other obstacles
          obstacles.forEach((otherObstacle) => {
            if (otherObstacle !== obstacle) {
              const otherTop = parseInt(otherObstacle.style.top);
              if (Math.abs(newTop - otherTop) < 50) {
                validPosition = false;
              }
            }
          });
        }

        obstacle.style.top = `${newTop}px`;
        score += 10; // Increase score when obstacle is repositioned
        scoreElement.textContent = `Score: ${score}`;
      }
      obstacle.style.left = obstacleLeft + 'px';
      checkCollision(obstacle);
    });
  }

  function checkCollision(obstacle) {
    const georgefaceRect = georgeface.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
      georgefaceRect.left < obstacleRect.right &&
      georgefaceRect.right > obstacleRect.left &&
      georgefaceRect.top < obstacleRect.bottom &&
      georgefaceRect.bottom > obstacleRect.top
    ) {
      gameOver = true;
      shakeGeorgeface();
      georgeface.style.backgroundImage = `url('${sadFaceURL}')`;
      gameOverMessage.style.display = 'block';
      setTimeout(resetGame, 2000);
    }
  }

  function shakeGeorgeface() {
    georgeface.style.animation = 'shake 0.5s';
    setTimeout(() => {
      georgeface.style.animation = '';
    }, 500);
  }

  function resetGame() {
    gameOver = false;
    gameOverMessage.style.display = 'none';
    georgefaceBottom = 20;
    georgeface.style.bottom = georgefaceBottom + 'px';
    georgeface.style.backgroundImage =
      'url("https://i.ibb.co/JnrpZ8k/GL-face.png")'; // Replace with your face image URL
    setObstaclePositions();
    obstacleSpeeds = [...initialSpeeds]; // Reset speeds to initial values
    score = 0; // Reset score
    scoreElement.textContent = `Score: ${score}`;
    startButton.style.display = 'block'; // Show the start button

    // Clear intervals to stop obstacle movement and speed increase
    clearInterval(moveObstaclesInterval);
    clearInterval(increaseSpeedInterval);
  }

  function increaseSpeed() {
    if (gameOver) return;
    obstacleSpeeds = obstacleSpeeds.map((speed) => speed + 1);
  }

  function setObstaclePositions() {
    obstacles.forEach((obstacle) => {
      obstacle.style.left = '600px';
      obstacle.style.top = `${Math.random() * 370}px`;
    });
  }

  startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    setObstaclePositions(); // Set random positions at the start
    moveObstaclesInterval = setInterval(moveObstacles, 50);
    increaseSpeedInterval = setInterval(increaseSpeed, speedIncrementInterval);
  });

  // Hide the start button initially until the game is reset
  startButton.style.display = 'block';
});
