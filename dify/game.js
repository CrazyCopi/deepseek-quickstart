// 游戏变量
let canvas, ctx;
let gridSize = 20;
let tileSize;
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = 0;
let gameSpeed = 150;
let wallMode = 'solid';
let gameLoop;
let changingDirection = false;
let gameStarted = false;

// DOM元素
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const finalScore = document.getElementById('finalScore');
const gridSizeSelect = document.getElementById('gridSize');
const gameSpeedSelect = document.getElementById('gameSpeed');
const wallModeSelect = document.getElementById('wallMode');

// 初始化游戏
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 设置画布大小
    const maxWidth = Math.min(500, window.innerWidth - 40);
    const canvasSize = Math.floor(maxWidth / gridSize) * gridSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    tileSize = canvas.width / gridSize;
    
    // 重置游戏状态
    resetGame();
    
    // 设置事件监听器
    document.addEventListener('keydown', changeDirection);
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    
    // 显示开始界面
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    
    // 绘制初始画面
    drawGame();
}

// 重置游戏状态
function resetGame() {
    snake = [
        {x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2)}
    ];
    generateFood();
    dx = 0;
    dy = 0;
    score = 0;
    changingDirection = false;
    gameStarted = false;
    updateScoreDisplay();
}

// 开始游戏
function startGame() {
    // 获取设置
    gridSize = parseInt(gridSizeSelect.value);
    gameSpeed = parseInt(gameSpeedSelect.value);
    wallMode = wallModeSelect.value;
    
    // 重新初始化画布
    initGame();
    
    // 隐藏屏幕
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // 开始游戏循环
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(main, gameSpeed);
    gameStarted = true;
}

// 主游戏循环
function main() {
    if (isGameOver()) {
        gameOver();
        return;
    }
    
    changingDirection = false;
    moveSnake();
    if (didEatFood()) {
        generateFood();
        increaseScore();
        increaseSpeed();
    }
    drawGame();
}

// 移动蛇
function moveSnake() {
    // 创建新的蛇头
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // 检查墙壁穿透模式
    if (wallMode === 'passable') {
        if (head.x >= gridSize) head.x = 0;
        else if (head.x < 0) head.x = gridSize - 1;
        if (head.y >= gridSize) head.y = 0;
        else if (head.y < 0) head.y = gridSize - 1;
    }
    
    // 将新头部添加到蛇身
    snake.unshift(head);
    
    // 如果没吃到食物，移除尾部
    if (!didEatFood()) {
        snake.pop();
    }
}

// 改变方向
function changeDirection(event) {
    if (!gameStarted) return;
    
    // 防止连续改变方向
    if (changingDirection) return;
    changingDirection = true;
    
    const keyPressed = event.keyCode;
    
    // 上箭头或W
    if ((keyPressed === 38 || keyPressed === 87) && dy === 0) {
        dx = 0;
        dy = -1;
    }
    // 下箭头或S
    else if ((keyPressed === 40 || keyPressed === 83) && dy === 0) {
        dx = 0;
        dy = 1;
    }
    // 左箭头或A
    else if ((keyPressed === 37 || keyPressed === 65) && dx === 0) {
        dx = -1;
        dy = 0;
    }
    // 右箭头或D
    else if ((keyPressed === 39 || keyPressed === 68) && dx === 0) {
        dx = 1;
        dy = 0;
    }
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
    
    // 确保食物不会出现在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

// 检查是否吃到食物
function didEatFood() {
    return snake[0].x === food.x && snake[0].y === food.y;
}

// 增加分数
function increaseScore() {
    score += 10;
    updateScoreDisplay();
}

// 更新分数显示
function updateScoreDisplay() {
    scoreDisplay.textContent = `分数: ${score}`;
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = `最高分: ${highScore}`;
    }
}

// 增加游戏速度
function increaseSpeed() {
    if (gameSpeed > 50 && score % 50 === 0) {
        gameSpeed -= 10;
        clearInterval(gameLoop);
        gameLoop = setInterval(main, gameSpeed);
    }
}

// 检查游戏结束条件
function isGameOver() {
    // 检查是否撞墙（如果墙壁不可穿透）
    if (wallMode === 'solid') {
        if (snake[0].x < 0 || 
            snake[0].x >= gridSize || 
            snake[0].y < 0 || 
            snake[0].y >= gridSize) {
            return true;
        }
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    finalScore.textContent = score;
    gameOverScreen.classList.remove('hidden');
    gameStarted = false;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < gridSize; i++) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
    }
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#e74c3c';
        } else {
            // 蛇身
            ctx.fillStyle = '#2ecc71';
        }
        ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
        
        // 蛇身边框
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
    });
    
    // 绘制食物
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    const centerX = food.x * tileSize + tileSize / 2;
    const centerY = food.y * tileSize + tileSize / 2;
    const radius = tileSize / 2 - 2;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
}

// 窗口加载时初始化游戏
window.onload = initGame;

// 响应窗口大小变化
window.addEventListener('resize', () => {
    if (!gameStarted) {
        initGame();
    }
});
