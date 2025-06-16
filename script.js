const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const carImage = new Image();
carImage.src = "images/red_car.png";

const roadImage = new Image();
roadImage.src = "images/bg.jpg"; // Updated background (trees + grass, no road)

const coinImage = new Image();
coinImage.src = "images/coin.png";

const powerImage = new Image();
powerImage.src = "images/power.png";

const obstacleSources = ["images/obstacle1.png", "images/obstacle2.png"];
const obstacleImages = obstacleSources.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

const car = {
  x: 100,
  y: 300,
  width: 60,
  height: 40,
  speed: 2,
  dy: 0,
  gravity: 0.6,
  jumping: false
};

let bgX = 0;
let score = 0;
let level = 1;
let gameOver = false;
let obstacles = [];
let coins = [];
let powers = [];
let obstacleSpawnTimer = 0;
let coinSpawnTimer = 0;
let powerSpawnTimer = 0;
let gameStarted = false;

const bgMusic = new Audio("audio/bg-music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;

document.getElementById("startBtn").addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    bgMusic.play().catch(err => console.log("Autoplay blocked:", err));
    document.getElementById("startBtnWrapper").style.display = "none";
    document.getElementById("restartBtn").style.display = "none";
    updateGame();
  }
});

document.getElementById("restartBtn").addEventListener("click", () => {
  score = 0;
  level = 1;
  gameOver = false;
  obstacles = [];
  coins = [];
  powers = [];
  car.y = 300;
  car.x = 100;
  car.dy = 0;
  document.getElementById("restartBtn").style.display = "none";
  updateGame();
});

document.getElementById("jumpBtn").onclick = () => {
  if (!car.jumping) {
    car.dy = -12; // reduced jump height
    car.jumping = true;
    if (car.x < canvas.width - car.width - 100) {
      car.x += 15;
    }
  }
};

document.getElementById("forwardBtn").onmousedown = () => {
  car.speed = 6;
};
document.getElementById("forwardBtn").onmouseup = () => {
  car.speed = 2;
};

document.getElementById("brakeBtn").onclick = () => {
  car.speed = 0;
};

// Get ground Y based on X (simulated terrain)
function getGroundY(x) {
  return 320 + 20 * Math.sin((x + bgX) * 0.005);
}

function drawCar() {
  ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
}

function drawBackground() {
  bgX -= car.speed / 2;
  if (bgX <= -canvas.width) bgX = 0;
  ctx.drawImage(roadImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(roadImage, bgX + canvas.width, 0, canvas.width, canvas.height);
}

// Optional: draw the virtual road
function drawVirtualRoad() {
  ctx.beginPath();
  ctx.moveTo(0, getGroundY(0));
  for (let x = 0; x <= canvas.width; x++) {
    ctx.lineTo(x, getGroundY(x));
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fillStyle = "#444";
  ctx.fill();
}

function createObstacle() {
  const img = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
  obstacles.push({
    x: canvas.width + 100,
    y: getGroundY(canvas.width + 100) - 5,
    width: 40,
    height: 40,
    speed: car.speed,
    img: img
  });
}

function createCoin() {
  coins.push({
    x: canvas.width,
    y: getGroundY(canvas.width) - 40,
    width: 30,
    height: 30,
    speed: car.speed
  });
}

function createPower() {
  powers.push({
    x: canvas.width,
    y: getGroundY(canvas.width) - 40,
    width: 30,
    height: 30,
    speed: car.speed
  });
}

function updateObstacles(currentSpeed) {
  obstacles.forEach((obs, index) => {
    obs.x -= currentSpeed;
    ctx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);

    if (
      car.x < obs.x + obs.width &&
      car.x + car.width > obs.x &&
      car.y < obs.y + obs.height &&
      car.y + car.height > obs.y
    ) {
      gameOver = true;
    }

    if (obs.x + obs.width < 0) obstacles.splice(index, 1);
  });
}

function updateCoins(currentSpeed) {
  coins.forEach((coin, index) => {
    coin.x -= currentSpeed;
    ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);

    if (
      car.x < coin.x + coin.width &&
      car.x + car.width > coin.x &&
      car.y < coin.y + coin.height &&
      car.y + car.height > coin.y
    ) {
      score += 10;
      coins.splice(index, 1);
    }

    if (coin.x + coin.width < 0) coins.splice(index, 1);
  });
}

function updatePowers(currentSpeed) {
  powers.forEach((p, index) => {
    p.x -= currentSpeed;
    ctx.drawImage(powerImage, p.x, p.y, p.width, p.height);

    if (
      car.x < p.x + p.width &&
      car.x + car.width > p.x &&
      car.y < p.y + p.height &&
      car.y + car.height > p.y
    ) {
      score += 25;
      powers.splice(index, 1);
    }

    if (p.x + p.width < 0) powers.splice(index, 1);
  });
}

function updateGame() {
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    document.getElementById("restartBtn").style.display = "inline-block";
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawVirtualRoad(); // optional
  drawCar();

  car.y += car.dy;
  car.dy += car.gravity;

  let groundY = getGroundY(car.x);
  if (car.y > groundY) {
    car.y = groundY;
    car.jumping = false;
  }

  if (score >= level * 100) {
    level++;
    car.speed += 0.5;
  }

  obstacleSpawnTimer++;
  coinSpawnTimer++;
  powerSpawnTimer++;

  if (obstacleSpawnTimer > 100 - level * 2) {
    createObstacle();
    obstacleSpawnTimer = 0;
  }

  if (coinSpawnTimer > 150) {
    createCoin();
    coinSpawnTimer = 0;
  }

  if (powerSpawnTimer > 500) {
    createPower();
    powerSpawnTimer = 0;
  }

  const currentSpeed = car.jumping ? car.speed + 2 : car.speed;

  updateObstacles(currentSpeed);
  updateCoins(currentSpeed);
  updatePowers(currentSpeed);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Level: " + level, 10, 60);

  requestAnimationFrame(updateGame);
}

carImage.onload = () => {
  roadImage.onload = () => {
    // Ready to start
  };
};
