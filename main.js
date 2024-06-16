document.addEventListener('DOMContentLoaded', () => {
  const georgeface = document.getElementById('georgeface');
  const obstacles = document.querySelectorAll('.obstacle');
  const gameOverMessage = document.getElementById('gameOverMessage');
  let georgefaceBottom = 20;
  let gameOver = false;
  const initialSpeeds = [5, 6, 7, 8];
  let obstacleSpeeds = [...initialSpeeds];
  const speedIncrementInterval = 5000; // Increase speed every 5 seconds
  const sadFaceURL = 'https://i.ibb.co/PDLC7T4/Face-hit2.png'; // Replace with your sad face image URL

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
    obstacles.forEach((obstacle, index) => {
      obstacle.style.left = '600px';
      obstacle.style.top = `${Math.random() * 370}px`;
    });
    obstacleSpeeds = [...initialSpeeds]; // Reset speeds to initial values
  }

  function increaseSpeed() {
    if (gameOver) return;
    obstacleSpeeds = obstacleSpeeds.map((speed) => speed + 1);
  }

  setInterval(moveObstacles, 50);
  setInterval(increaseSpeed, speedIncrementInterval);
});
