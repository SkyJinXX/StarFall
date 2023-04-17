const ctx = canvas.getContext("2d");

export default class Main {
    constructor() {
        this.canvas = canvas;
        this.ctx = ctx;

        this.startButton = {
            buttonWidth: 200,
            buttonHeight: 50,
        };
        this.startButton.buttonX =
            (canvas.width - this.startButton.buttonWidth) / 2;
        this.startButton.buttonY =
            (canvas.height - this.startButton.buttonHeight) / 2;
        this.restartButton = {
            buttonWidth: 200,
            buttonHeight: 50,
        };
        this.restartButton.buttonX =
            (canvas.width - this.restartButton.buttonWidth) / 2;
        this.restartButton.buttonY =
            (canvas.height - this.restartButton.buttonHeight) / 2 + 100;

        this.animationCycle = 0;
        this.score = 0;
        this.gameStatus = 0; // 0未进行游戏， 1进行中， 2死亡
        this.gameStarted = false;
        this.gameStartTime = null;
        this.STAR = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: 30,
            height: 30,
            speed: 3,
            lastMovedTime: Date.now(),
        };
        this.lastStarX = this.STAR.x;
        this.images = {
            meteor24x32: new Image(),
            meteor32x48: new Image(),
            meteor35x32: new Image(),
            meteor50x48: new Image(),
            star:new Image()
        };
        this.images.star.src = "images/star.png";
        this.images.meteor24x32.src = "images/24-32.png";
        this.images.meteor32x48.src = "images/32-48.png";
        this.images.meteor35x32.src = "images/35-32.png";
        this.images.meteor50x48.src = "images/50-48.png";

        this.obstacles = [];

        // Event Listener
        canvas.addEventListener("mousemove", (event) =>
            this.handleMouseMove(event)
        );
        canvas.addEventListener("touchmove", (event) =>
            this.handleTouchMove(event)
        );
        canvas.addEventListener("touchstart", (event) =>
            this.handleTouchStart(event)
        );

        this.showMainMenu();
    }

    createObstacle() {
        const width = 20 + Math.random() * 40;
        const height = 20 + Math.random() * 40;
        const x = Math.random() * (canvas.width - width);
        const y = canvas.height;

        return { x, y, width, height };
    }

    drawStar() {
        // 1. 绘制星星图片
        this.ctx.drawImage(
            this.images.star,
            this.STAR.x,
            this.STAR.y,
            this.STAR.width,
            this.STAR.height
        );
    
        // 2. 根据星星的移动方向和停止时间调整尾巴的倾斜
        const tailWidth = 3;
        const tailLength = this.STAR.height * 2;
        let tailXOffset = 0;
    
        if (Date.now() - this.STAR.lastMovedTime < 100) {
            if (this.STAR.direction === 1) {
                tailXOffset = -10;
            } else if (this.STAR.direction === -1) {
                tailXOffset = 10;
            }
        }
    
        // 3. 绘制火花尾巴
        this.ctx.globalCompositeOperation = "source-over";
        const tailPositions = [
            { x: this.STAR.x + this.STAR.width / 2 - tailWidth / 2 - 8, y: this.STAR.y +2 },
            { x: this.STAR.x + this.STAR.width / 2 - tailWidth / 2, y: this.STAR.y - 5},
            { x: this.STAR.x + this.STAR.width / 2 - tailWidth / 2 + 8, y: this.STAR.y +2},
        ];
    
        for (const position of tailPositions) {
            for (let i = 0; i < tailLength; i += tailWidth * 2) {
                const tailY = position.y - i - this.animationCycle * 2;
                const tailX = position.x + tailXOffset * (i / tailLength);
    
                const colorValue = 255 - Math.floor((i / tailLength) * 255);
                this.ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, 0)`;
    
                this.ctx.fillRect(tailX, tailY, tailWidth, tailWidth);
            }
        }
    }
    
    updateStarPosition() {
        for (const obstacle of this.obstacles) {
            obstacle.y -= this.STAR.speed;
        }
    }
    drawPixelArtRock(obstacle) {
        ctx.fillStyle = "#837b8a";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
    drawObstacles() {
        for (const obstacle of this.obstacles) {
            this.drawPixelArtRock(obstacle);
        }
    }
    updateObstacles() {
        if (
            this.obstacles.length === 0 ||
            this.obstacles[this.obstacles.length - 1].y < canvas.height - 150
        ) {
            this.obstacles.push(this.createObstacle());
        }

        if (this.obstacles.length > 15) {
            this.obstacles.shift();
        }
    }
    drawRestartButton() {
        const { buttonWidth, buttonHeight, buttonX, buttonY } =
            this.restartButton;

        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        ctx.font = "24px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(
            "重新开始",
            buttonX + buttonWidth / 2,
            buttonY + buttonHeight / 2
        );
    }
    drawTitle() {
        ctx.font = "48px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("星星坠落", canvas.width / 2, canvas.height / 2 - 80); // 添加这个函数，绘制标题
    }
    drawStartButton() {
        const { buttonWidth, buttonHeight, buttonX, buttonY } =
            this.startButton;

        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        ctx.font = "24px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(
            "开始游戏",
            canvas.width / 2,
            buttonY + buttonHeight / 2 + 8
        );
    }
    drawScore() {
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(
            Math.floor(this.score) + "m",
            // canvas.width / 2,
            20,
            30
        );
    }

    showMainMenu() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawTitle();
        this.drawStartButton();
    }
    showGameOverScreen() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "48px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 60);

        ctx.font = "32px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(
            "本次坠落了: " + Math.floor(this.score) + "m",
            canvas.width / 2,
            canvas.height / 2
        );

        const highScore = Math.max(
            this.score,
            localStorage.getItem("highScore") || 0
        );
        localStorage.setItem("highScore", highScore);
        ctx.fillText(
            "最多坠落: " + Math.floor(highScore) + "m",
            canvas.width / 2,
            canvas.height / 2 + 40
        );
        this.drawRestartButton();
    }

    isColliding(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;

        const newStarX =
            (event.clientX - rect.left) * scaleX - this.STAR.width / 2;
        this.STAR.direction =
            this.STAR.x < newStarX ? 1 : this.STAR.x > newStarX ? -1 : 0;
        this.STAR.x = newStarX;
        this.lastStarX = this.STAR.x;
        this.STAR.lastMovedTime = Date.now();
    }
    handleTouchMove(event) {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;

        const newStarX =
            (event.touches[0].clientX - rect.left) * scaleX -
            this.STAR.width / 2;
        this.STAR.direction =
            this.STAR.x < newStarX ? 1 : this.STAR.x > newStarX ? -1 : 0;
        this.STAR.x = newStarX;
        this.lastStarX = this.STAR.x;
        this.STAR.lastMovedTime = Date.now();
    }
    handleTouchStart(event) {
        let btn;
        switch (this.gameStatus) {
            case 0:
                btn = this.startButton;
                break;
            case 2:
                btn = this.restartButton;
                break;
            default:
                return;
        }
        const { buttonWidth, buttonHeight, buttonX, buttonY } = btn;

        const mouseX =
            event.touches[0].clientX - canvas.getBoundingClientRect().left;
        const mouseY =
            event.touches[0].clientY - canvas.getBoundingClientRect().top;

        // 检查点击是否在开始游戏按钮上
        if (
            mouseX >= buttonX &&
            mouseX <= buttonX + buttonWidth &&
            mouseY >= buttonY &&
            mouseY <= buttonY + buttonHeight
        ) {
            this.startGame();
        }
    }

    updateSpeed() {
        if (this.gameStartTime !== null) {
            const elapsedTime = (Date.now() - this.gameStartTime) / 1000;
            this.STAR.speed = 3 + elapsedTime / 10;
        }
    }

    gameLoop() {
        if (this.gameStatus !== 1) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // this.animationCycle = (this.animationCycle + 1) % 2;

        this.updateStarPosition();
        this.drawStar();

        this.updateObstacles();
        this.drawObstacles();

        this.score += this.STAR.speed / 10;
        this.updateSpeed();
        this.drawScore();

        for (const obstacle of this.obstacles) {
            if (this.isColliding(this.STAR, obstacle)) {
                wx.vibrateShort({ type: "light" });
                this.gameStatus = 2;
            }
            if (this.gameStatus == 2) {
                this.showGameOverScreen();
                console.log("Collision detected!");
                return;
            }
        }

        this.bindGameLoop = this.gameLoop.bind(this);
        window.requestAnimationFrame(this.bindGameLoop, canvas);
    }

    startGame() {
        this.gameStatus = 1;
        this.gameStartTime = Date.now();

        this.STAR.x = canvas.width / 2 - this.STAR.width / 2;
        this.STAR.y = canvas.height / 2 - this.STAR.height / 2;

        this.score = 0;
        this.STAR.speed = 3;
        this.obstacles = [];

        this.drawStar();
        this.gameLoop();
    }
}
