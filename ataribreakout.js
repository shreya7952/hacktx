let gameCanvas;
let canvasWidth = 500;
let canvasHeight = 500;
let ctx;

// Player settings
let paddleWidth = 80;
let paddleHeight = 10;
let paddleSpeed = 10;

let paddle = {
    posX: canvasWidth / 2 - paddleWidth / 2,
    posY: canvasHeight - paddleHeight - 5,
    width: paddleWidth,
    height: paddleHeight,
    speedX: paddleSpeed
};

// Ball settings
let ballSize = 10;
let ballSpeedX = 3;
let ballSpeedY = 2;

let ball = {
    posX: canvasWidth / 2,
    posY: canvasHeight / 2,
    width: ballSize,
    height: ballSize,
    speedX: ballSpeedX,
    speedY: ballSpeedY
};

// Block settings
let blocks = [];
let blockW = 86;  // Width of each block
let blockH = 20;  // Height of each block
let columns = 5;  // Number of columns of blocks
let rows = 4;     // Number of rows of blocks
let remainingBlocks = 0;

let startX = 15;  // Starting position of blocks
let startY = 45;

let points = 0;
let gameEnded = false;

// Initialize the canvas and start the game
window.onload = function() {
    gameCanvas = document.getElementById("gameCanvas");
    gameCanvas.height = canvasHeight;
    gameCanvas.width = canvasWidth;
    ctx = gameCanvas.getContext("2d");

    setupBlocks();
    gameEnded = false;
    points = 0;
    ball.posX = canvasWidth / 2;
    ball.posY = canvasHeight / 2;
    ball.speedX = ballSpeedX;
    ball.speedY = ballSpeedY;
    document.getElementById("tryAgainButton").style.display = "none";
    requestAnimationFrame(gameLoop);
    document.addEventListener("keydown", controlPaddle);
};

function gameLoop() {
    if (gameEnded) return;

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Draw paddle
    ctx.fillStyle = "lightgreen";
    ctx.fillRect(paddle.posX, paddle.posY, paddle.width, paddle.height);

    // Update ball position
    ball.posX += ball.speedX;
    ball.posY += ball.speedY;
    ctx.fillStyle = "white";
    ctx.fillRect(ball.posX, ball.posY, ball.width, ball.height);

    // Ball-paddle collision
    if (collisionTop(ball, paddle) || collisionBottom(ball, paddle)) {
        ball.speedY *= -1;
    } else if (collisionLeft(ball, paddle) || collisionRight(ball, paddle)) {
        ball.speedX *= -1;
    }

    // Ball-wall collisions
    if (ball.posY <= 0) {
        ball.speedY *= -1;
    } else if (ball.posX <= 0 || ball.posX + ball.width >= canvasWidth) {
        ball.speedX *= -1;
    } else if (ball.posY + ball.height >= canvasHeight) {
        gameOver();
    }

    // Draw blocks and check collisions
    ctx.fillStyle = "hotpink"; // Set block color to hot pink
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        if (!block.destroyed) {
            if (collisionTop(ball, block) || collisionBottom(ball, block) ||
                collisionLeft(ball, block) || collisionRight(ball, block)) {
                block.destroyed = true; // Mark block as destroyed
                ball.speedY *= -1; // Change ball direction
                points += 100; // Increase points
            }
            ctx.fillRect(block.posX, block.posY, block.width, block.height);
        }
    }

    // Display score
    ctx.font = "20px sans-serif";
    ctx.fillText("Score: " + points, 10, 25);

    if (!gameEnded) requestAnimationFrame(gameLoop);
}

// Function to setup the blocks
function setupBlocks() {
    blocks = [];
    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            let newBlock = {
                posX: startX + col * (blockW + 10), // 10 is spacing
                posY: startY + row * (blockH + 10),
                width: blockW,
                height: blockH,
                destroyed: false
            };
            blocks.push(newBlock);
        }
    }
    remainingBlocks = blocks.length;
}

// Handle game over
function gameOver() {
    gameEnded = true;
    // Show the Try Again button
    document.getElementById("tryAgainButton").style.display = "block";
}

// Paddle controls
function controlPaddle(event) {
    if (event.key === "ArrowLeft" && paddle.posX > 0) {
        paddle.posX -= paddle.speedX; // Move paddle left
    } else if (event.key === "ArrowRight" && paddle.posX + paddle.width < canvasWidth) {
        paddle.posX += paddle.speedX; // Move paddle right
    }
}

// Restart the game
document.getElementById("tryAgainButton").addEventListener("click", function() {
    gameEnded = false; // Reset game state
    points = 0; // Reset points
    ball.posX = canvasWidth / 2; // Reset ball position
    ball.posY = canvasHeight / 2; // Reset ball position
    paddle.posX = canvasWidth / 2 - paddleWidth / 2; // Reset paddle position
    document.getElementById("tryAgainButton").style.display = "none"; // Hide button
    setupBlocks(); // Re-setup blocks
    requestAnimationFrame(gameLoop); // Restart game loop
});

// Collision detection functions
function collisionTop(ball, rect) {
    return ball.posY <= rect.posY + rect.height && ball.posY + ball.height >= rect.posY && ball.posX + ball.width >= rect.posX && ball.posX <= rect.posX + rect.width;
}

function collisionBottom(ball, rect) {
    return ball.posY + ball.height >= rect.posY && ball.posY <= rect.posY && ball.posX + ball.width >= rect.posX && ball.posX <= rect.posX + rect.width;
}

function collisionLeft(ball, rect) {
    return ball.posX <= rect.posX + rect.width && ball.posX + ball.width >= rect.posX && ball.posY + ball.height >= rect.posY && ball.posY <= rect.posY + rect.height;
}

function collisionRight(ball, rect) {
    return ball.posX + ball.width >= rect.posX && ball.posX <= rect.posX && ball.posY + ball.height >= rect.posY && ball.posY <= rect.posY + rect.height;
}
