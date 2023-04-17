const ctx = canvas.getContext("2d");
class Obstacle {
    constructor(x, y, width, height, image, rotation) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.rotation = rotation;
        this.radius = Math.min(width, height) / 2;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.drawImage(
            this.image,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();
    }
}
class Star {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 0;
        this.lastMovedTime = Date.now();
        this.lastStarX = this.x;
        this.image = new Image();
        this.image.src = "images/star.png";
        this.radius = Math.min(width, height) / 2;
    }
    draw() {
        // 1. draw star
        ctx.drawImage(
            this.image,
            this.x,
            this.y,
            this.width,
            this.height
        );

        // 2. change tail direction depend on lastMovedTime and move direction
        const tailWidth = 3;
        const tailLength = this.height * 2;
        let tailXOffset = 0;

        if (Date.now() - this.lastMovedTime < 100) {
            if (this.direction === 1) {
                tailXOffset = -10;
            } else if (this.direction === -1) {
                tailXOffset = 10;
            }
        }

        // 3. draw spark tail
        ctx.globalCompositeOperation = "source-over";
        const tailPositions = [
            { x: this.x + this.width / 2 - tailWidth / 2 - 8, y: this.y + 2 },
            { x: this.x + this.width / 2 - tailWidth / 2, y: this.y - 5 },
            { x: this.x + this.width / 2 - tailWidth / 2 + 8, y: this.y + 2 },
        ];

        for (const position of tailPositions) {
            for (let i = 0; i < tailLength; i += tailWidth * 2) {
                // const tailY = position.y - i - this.animationCycle * 2;
                const tailY = position.y - i;
                const tailX = position.x + tailXOffset * (i / tailLength);

                const colorValue = 255 - Math.floor((i / tailLength) * 255);
                ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, 0)`;

                ctx.fillRect(tailX, tailY, tailWidth, tailWidth);
            }
        }
    }
}
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
        this.gameStatus = 0; // 0:haven't started， 1: gaming， 2: dead
        this.gameStarted = false;
        this.gameStartTime = null;
        this.STAR = new Star(canvas.width / 2, canvas.height / 2, 30, 30, 3);
        this.images = {
            meteor36x74: new Image(),
            meteor56x104: new Image(),
            meteor70x64: new Image(),
            meteor100x96: new Image(),
        };
        this.images.meteor36x74.src = "images/36x74.png";
        this.images.meteor56x104.src = "images/56x104.png";
        this.images.meteor70x64.src = "images/70x64.png";
        this.images.meteor100x96.src = "images/100x96.png";

        this.obstacles = [];

        // Event Listener
        canvas.addEventListener("touchmove", (event) =>
            this.handleTouchMove(event)
        );
        canvas.addEventListener("touchstart", (event) =>
            this.handleTouchStart(event)
        );

        this.showMainMenu();
    }

    createObstacle() {
        const meteorImages = [
            // { image: this.images.meteor36x74, width: 36, height: 74 },
            // { image: this.images.meteor56x104, width: 56, height: 104 },
            { image: this.images.meteor100x96, width: 50, height: 74 },
            { image: this.images.meteor100x96, width: 76, height: 104 },
            { image: this.images.meteor70x64, width: 70, height: 64 },
            { image: this.images.meteor100x96, width: 100, height: 96 },
        ];
        const selectedMeteor =
            meteorImages[Math.floor(Math.random() * meteorImages.length)];

        const sizeMultiplier = 0.8 + Math.random() * 0.2; // random size
        const width = selectedMeteor.width * sizeMultiplier;
        const height = selectedMeteor.height * sizeMultiplier;

        const x = Math.random() * (canvas.width - width);
        const y = canvas.height;

        const rotation = Math.random() * 2 * Math.PI; // random angle:0 to 2π

        return new Obstacle(
            x,
            y,
            width,
            height,
            selectedMeteor.image,
            rotation
        );
    }

    updateStarPosition() {
        for (const obstacle of this.obstacles) {
            obstacle.y -= this.STAR.speed;
        }
    }
    drawObstacles() {
        for (const obstacle of this.obstacles) {
            obstacle.draw(ctx);
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

    isColliding(circle1, circle2) {
        const dx =
            circle1.x + circle1.width / 2 - (circle2.x + circle2.width / 2);
        const dy =
            circle1.y + circle1.height / 2 - (circle2.y + circle2.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < circle1.radius + circle2.radius;
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
        this.STAR.lastStarX = this.STAR.x;
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
        this.STAR.draw();

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

        this.STAR.draw();
        this.gameLoop();
    }
}
