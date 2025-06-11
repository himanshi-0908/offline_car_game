// Updated script.js with enhanced jump physics and idle-game-over condition

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const jumpBtn = document.getElementById("jumpBtn");
const forwardBtn = document.getElementById("forwardBtn");
const brakeBtn = document.getElementById("brakeBtn");

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const countdownDisplay = document.getElementById("countdown");
const gameOverScreen = document.getElementById("gameOverScreen");
const gameOverText = document.getElementById("gameOverText");

const jumpSound = document.getElementById("jumpSound");
const crashSound = document.getElementById("crashSound");

const carImage = new Image();
carImage.src = "car.png";
const obstacleImage = new Image();
obstacleImage.src = "obstacle.png";

let car = {
  x: 100,
  y: 300,
  width: 50,
  height: 30,
  velocityY: 0,
  velocityX: 0,
  onGround: false,
  gravity: 0.5,
  jumpPowerY: -10,
  jumpPowerX: 2,
  speed: 0,
  maxSpeed: 5,
};

let terrain = [];
let terrainLength = 2000;
let terrainOffset = 0;
let score = 0;
let level = 1;
let obstacles = [];
let isGameOver = false;
let gameStarted = false;
let countdown = 3;
let idleTime = 0;

function generateTerrain() {
  terrain = [];
  for (let x = 0; x < terrainLength; x++) {
    let y = 300 + 30 * Math.sin(x * 0.01) + 10 * Math.sin(x * 0.05);
    terrain.push({ x, y });
  }
}

function generateObstacles() {
  obstacles = [];
  for (let i = 300; i < terrainLength; i += 400) {
    const y = getTerrainY(i) - 40;
    obstacles.push({ x: i, y, width: 40, height: 40 });
  }
}

function getTerrainY(x) {
  if (x < 0 || x >= terrain.length) return 300;
  return terrain[Math.floor(x)].y;
}

function drawTerrain() {
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x < canvas.width; x++) {
    const terrainX = x + terrainOffset;
    const y = getTerrainY(terrainX);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();
}

function drawCar() {
  const carWidth = car.width;
  const carHeight = car.height;
  const angle = Math.atan2(
    getTerrainY(car.x + terrainOffset + 1) - getTerrainY(car.x + terrainOffset),
    1
  );

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(angle);
  ctx.drawImage(carImage, -carWidth / 2, -carHeight / 2, carWidth, carHeight);
  ctx.restore();
}

function drawObstacles() {
  obstacles.forEach(ob => {
    const screenX = ob.x - terrainOffset;
    if (screenX > -40 && screenX < canvas.width + 40) {
      ctx.drawImage(obstacleImage, screenX, ob.y, ob.width, ob.height);
    }
  });
}

function drawBackground() {
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(100, 80, 20, 0, Math.PI * 2);
  ctx.arc(120, 80, 25, 0, Math.PI * 2);
  ctx.arc(140, 80, 20, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  if (!gameStarted || isGameOver) return;

  const terrainY = getTerrainY(car.x + terrainOffset);

  if (car.y < terrainY - car.height / 2) {
    car.velocityY += car.gravity;
    car.onGround = false;
  } else {
    car.y = terrainY - car.height / 2;
    car.velocityY = 0;
    car.onGround = true;
  }

  car.y += car.velocityY;
  car.x += car.velocityX;

  if (car.speed > 0) {
    terrainOffset += car.speed;
    idleTime = 0;
  } else {
    idleTime++;
    if (idleTime > 300) { // ~5 seconds at 60 FPS
      endGame("Game Over: Car stopped for too long!");
    }
  }

  score += Math.floor(car.speed);

  if (score > level * 1000) {
    level++;
    car.maxSpeed += 0.5;
  }

  obstacles.forEach(ob => {
    const carFrontX = car.x + terrainOffset;
    if (
      carFrontX + car.width / 2 > ob.x &&
      carFrontX - car.width / 2 < ob.x + ob.width &&
      car.y + car.height / 2 > ob.y
    ) {
      endGame("Crashed into obstacle!");
    }
  });

  if (car.y > canvas.height) {
    endGame("Car fell off the path!");
  }

  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawTerrain();
  drawObstacles();
  drawCar();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function endGame(message) {
  isGameOver = true;
  crashSound.play();
  gameOverText.textContent = message;
  gameOverScreen.style.display = "block";
}

function restartGame() {
  car = {
    x: 100,
    y: 300,
    width: 50,
    height: 30,
    velocityY: 0,
    velocityX: 0,
    onGround: false,
    gravity: 0.5,
    jumpPowerY: -10,
    jumpPowerX: 2,
    speed: 0,
    maxSpeed: 5
  };
  terrainOffset = 0;
  score = 0;
  level = 1;
  isGameOver = false;
  gameStarted = false;
  idleTime = 0;
  gameOverScreen.style.display = "none";
  countdown = 3;
  countdownDisplay.textContent = countdown;
  countdownDisplay.style.display = "block";
  startCountdown();
}

function startCountdown() {
  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      countdownDisplay.textContent = countdown;
    } else {
      countdownDisplay.textContent = "Go!";
      clearInterval(interval);
      setTimeout(() => {
        countdownDisplay.style.display = "none";
        gameStarted = true;
      }, 1000);
    }
  }, 1000);
}

jumpBtn.onclick = () => {
  if (car.onGround && gameStarted && !isGameOver) {
    car.velocityY = car.jumpPowerY;
    car.velocityX = car.jumpPowerX; // move forward during jump
    jumpSound.play();
  }
};

forwardBtn.onmousedown = () => {
  if (gameStarted && !isGameOver) {
    car.speed = car.maxSpeed;
  }
};
forwardBtn.onmouseup = () => {
  car.speed = 0;
};

brakeBtn.onclick = () => {
  car.speed = 0;
};

canvas.onclick = () => {
  if (!gameStarted && !isGameOver) startCountdown();
};

generateTerrain();
generateObstacles();
startCountdown();
loop();

window.addEventListener("offline", () => {
  alert("You're offline! Launching offline game mode...");
  if (!gameStarted && !isGameOver) {
    restartGame();
  }
});

