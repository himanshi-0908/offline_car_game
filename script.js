const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const carImage = new Image();
carImage.src = "images/car.png";

const roadImage = new Image();
roadImage.src = "images/road.jpg";

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
  gravity: 1,
  jumping: false
};

let bgX = 0;
let score = 0;
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
  gameOver = false;
  obstacles = [];
  coins = [];
  powers = [];
  car.y = 300;
  car.dy = 0;
  document.getElementById("restartBtn").style.display = "none";
  updateGame();
});

document.getElementById("jumpBtn").onclick = () => {
  if (!car.jumping) {
    car.dy = -15;
    car.jumping = true;
  }
};
document.getElementById("forwardBtn").onmousedown = () => {
  car.speed = 6;
};
document.getElementById("forwardBtn").onmouseup = () => {
  car.speed = 2;
};
document.getElementById("brakeBtn").onclick = () => {
  car.speed = 1;
};

function drawCar() {
  ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
}

function drawBackground() {
  bgX -= car.speed / 2;
  if (bgX <= -canvas.width) bgX = 0;
  ctx.drawImage(roadImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(roadImage, bgX + canvas.width, 0, canvas.width, canvas.height);
}

function createObstacle() {
  let img = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
  obstacles.push({
    x: canvas.width,
    y: 300,
    width: 40,
    height: 40,
    speed: car.speed,
    img: img
  });
}

function createCoin() {
  coins.push({
    x: canvas.width,
    y: 260 + Math.random() * 40, // near car level
    width: 30,
    height: 30,
    speed: car.speed
  });
}

function createPower() {
  powers.push({
    x: canvas.width,
    y: 260,
    width: 30,
    height: 30,
    speed: car.speed
  });
}

function updateObstacles() {
  obstacles.forEach((obs, index) => {
    obs.x -= car.speed;
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

function updateCoins() {
  coins.forEach((coin, index) => {
    coin.x -= car.speed;
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

function updatePowers() {
  powers.forEach((p, index) => {
    p.x -= car.speed;
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
  drawCar();

  car.y += car.dy;
  car.dy += car.gravity;

  if (car.y > 300) {
    car.y = 300;
    car.jumping = false;
  }

  obstacleSpawnTimer++;
  coinSpawnTimer++;
  powerSpawnTimer++;

  if (obstacleSpawnTimer > 100) {
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

  updateObstacles();
  updateCoins();
  updatePowers();

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  requestAnimationFrame(updateGame);
}

carImage.onload = () => {
  roadImage.onload = () => {
    // ready
  };
};
