import Music from "./music";
const ctx = canvas.getContext("2d");
const REWARD_SCORE = 2023;
const BG_MAXALPHA = 0.5;
const speedList = [4, 5, 7, 8, 10];
const musicList = [
  "pinkMemory_original",
  "pinkMemory_repeatable_113",
  "pinkMemory_repeatable_136",
  "pinkMemory_repeatable_150",
  "pinkMemory_repeatable_175",
];
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
        this.lastDirectionChangeTime = Date.now();
        this.lastXforDirextion = this.x;
        this.xWhenTouchStart = this.x;
        this.image = new Image();
        this.image.src = "images/star.png";
        this.radius = Math.min(width, height) / 2;
    }
    draw() {
        // 1. draw star
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        // 2. change tail direction depend on lastDirectionChangeTime and move direction
        const tailWidth = 3;
        const tailLength = this.height * 2;
        let tailXOffset = 0;

        if (this.direction === 1) {
            tailXOffset = -10;
        } else if (this.direction === -1) {
            tailXOffset = 10;
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
    resetParameters() {
        this.animationCycle = 0;
        this.score = 0;
        this.gameStatus = 0; // 0:haven't started， 1: gaming， 2: dead, 3: reward
        this.startTime = Date.now();
        this.initialTouchX = null;
        // this.STAR = new Star(canvas.width / 2, canvas.height / 2, 30, 30, 4);
        this.STAR = new Star(canvas.width / 2, canvas.height / 10 * 5, 30, 30, 4);
        this.obstacles = [];
        this.touchEnabled = true;

        this.currentSpeedIndex = 0;
        this.currentMusicIndex = 0;

        this.backgroundStars = this.createBackgroundStars(25);
    }
    constructor() {
        this.canvas = canvas;
        this.ctx = ctx;

        this.resetParameters();

        this.lastFrameTime = Date.now(); //帧数计算算是全局的，不用被重置
        this.frameInterval = 0;

        // Obstacle's images
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

        // Music
        this.music = new Music();

        // Buttons
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

        // Event Listener
        canvas.addEventListener("touchmove", (event) =>
            this.handleTouchMove(event)
        );
        canvas.addEventListener("touchstart", (event) =>
            this.handleTouchStart(event)
        );
        canvas.addEventListener("touchend", (event) =>
            this.handleTouchEnd(event)
        );

        this.gameLoop();
    }

    createBackgroundStars(numStars) {
        const stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1 + 1,
                alpha: Math.random() * BG_MAXALPHA,
                alphaSpeed: Math.random() * 0.005,
            });
        }
        return stars;
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

    updateStar() {
        // 更新Star方向
        if (Date.now() - this.STAR.lastDirectionChangeTime > 200) {
            this.STAR.direction = 0;
        }
        // 更新Star位置(其实是更新Obstacle位置)
        for (const obstacle of this.obstacles) {
            obstacle.y -= this.STAR.speed;
        }
    }
    updateSpeed() {
        const preSpeed = this.STAR.speed;
        const score = Math.floor(this.score);
        const elapsedTime = Date.now() - this.startTime;

        // this.music.currentBGM.onEnded(() => {
        //     this.music.currentBGM.offEnded();

        //     switch(this.music.currentBGM) {
        //         case this.music.bgmList[pinkMemory_original]:
        //             break;
        //         case this.music.bgmList[pinkMemory_repeatable_113]:
        //             break;
        //         case this.music.bgmList[pinkMemory_repeatable_136]:
        //             break;
        //         case this.music.bgmList[pinkMemory_repeatable_150]:
        //             break;
        //         case this.music.bgmList[pinkMemory_repeatable_175]:
        //             break;
        //     }
        // })

        if (elapsedTime < 19958) { // 可以改成播放完毕立即播放下一首，不过可能有延迟？
            this.STAR.speed = 4;
            this.music.playBGM('pinkMemory_original')
        } else if (elapsedTime < 19958 + 13777) {
            this.STAR.speed = 5;
            this.music.playBGM('pinkMemory_repeatable_113')
        } else if (elapsedTime < 19958 + 13777 + 11447) {
            this.STAR.speed = 7;
            this.music.playBGM('pinkMemory_repeatable_136')
        } else if (elapsedTime < 19958 + 13777 + 11447 + 10310) {
            this.STAR.speed = 8;
            this.music.playBGM('pinkMemory_repeatable_150')
        } else if (elapsedTime < 19958 + 13777 + 11447 + 10310 + 8840) {
            this.STAR.speed = 10;
            this.music.playBGM('pinkMemory_repeatable_175')
        } else {
            this.STAR.speed = 10; // 最大速度
            this.music.playBGM('pinkMemory_repeatable_175')
        }

        // if (preSpeed != this.STAR.speed) {
        //     if (score < 300) {
        //     } else if (score < 500) {
        //         this.STAR.speed = 5;
        //     } else if (score < 1000) {
        //         this.STAR.speed = 7;
        //     } else if (score < 1500) {
        //         this.STAR.speed = 8;
        //     } else if (score < 2000) {
        //         this.STAR.speed = 10;
        //     } else {
        //         this.STAR.speed = 10; // 最大速度
        //     }
        //     // this.music.setBGMplayBackRate(1 + (this.STAR.speed - 4) / 8);
        // }
    }
    updateBackgroundStars() {
        for (const star of this.backgroundStars) {
            star.alpha += star.alphaSpeed;

            if (star.alpha >= BG_MAXALPHA) {
                star.alpha = BG_MAXALPHA;
                star.alphaSpeed = -Math.abs(star.alphaSpeed);
            } else if (star.alpha <= 0) {
                star.alpha = 0;
                star.alphaSpeed = Math.abs(star.alphaSpeed);
            }
        }
    }
    updateObstacles() {
        if (
            this.obstacles.length === 0 ||
            this.obstacles[this.obstacles.length - 1].y <
                canvas.height - (Math.floor(Math.random() * 51) + 175)
        ) {
            this.obstacles.push(this.createObstacle());
        }

        if (this.obstacles.length > 15) {
            this.obstacles.shift();
        }
    }

    drawObstacles() {
        for (const obstacle of this.obstacles) {
            obstacle.draw(ctx);
        }
    }
    drawRestartButton() {
        const { buttonWidth, buttonHeight, buttonX, buttonY } =
            this.restartButton;

        ctx.fillStyle = "#4CAF50";
        drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 10);

        ctx.font = "24px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(
            "重新开始",
            buttonX + buttonWidth / 2,
            buttonY + buttonHeight / 2 + 6
        );
    }
    drawStartButton() {
        const { buttonWidth, buttonHeight, buttonX, buttonY } =
            this.startButton;

        ctx.fillStyle = "#4CAF50";
        drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 10);

        ctx.font = "24px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(
            "开始游戏",
            canvas.width / 2,
            buttonY + buttonHeight / 2 + 8
        );
    }
    drawTitle() {
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#f7f736";
        ctx.textAlign = "center";
        ctx.fillText("星星下凡", canvas.width / 2, canvas.height / 2 - 80); // 添加这个函数，绘制标题
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
    drawBackground() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const star of this.backgroundStars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    showMainMenu() {
        // 先放音乐
        this.music.playBGM("redRiverValley");
        this.music.playBGM("redRiverValley", 1000); // 增加播放成功的概率？

        this.drawTitle();
        this.drawStartButton();
    }
    showRewardScreen() {
        const elapsedTime = Date.now() - this.startTime;
        const highScore = parseInt(localStorage.getItem("highScore")) || 0;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        localStorage.setItem("rewardHasShown", 1);

        if (elapsedTime >= 1500) {
            // 1500ms 假设每帧16.67ms
            ctx.font = "64px Arial";
            ctx.fillStyle = "pink";
            ctx.textAlign = "center";
            ctx.fillText("生日快乐", canvas.width / 2, canvas.height / 2 - 40);
        }
        this.music.playBGM("happyBirthday", 1750);
        if (elapsedTime >= 3000) {
            // 3000ms
            ctx.font = "12px Arial";
            ctx.fillStyle = "yellow";
            ctx.fillText(
                "（凭本页截图可兑换5张甜甜券）",
                canvas.width / 2,
                canvas.height / 2 + 150
            );
        }

        ctx.font = "28px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText(
            "本次下落: " + Math.floor(this.score) + "m",
            canvas.width / 2,
            canvas.height / 2 + 10
        );

        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(
            "最多下落: " + Math.floor(highScore) + "m",
            canvas.width / 2,
            canvas.height / 2 + 50
        );

        this.drawRestartButton();
    }
    showGameOverScreen() {
        const highScore = parseInt(localStorage.getItem("highScore")) || 0;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.music.playBGM("redRiverValley", 1000);

        ctx.font = "64px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = "28px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText(
            "本次下落: " + Math.floor(this.score) + "m",
            canvas.width / 2,
            canvas.height / 2 + 10
        );

        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(
            "最多下落: " + Math.floor(highScore) + "m",
            canvas.width / 2,
            canvas.height / 2 + 50
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
        if (!this.touchEnabled) return;

        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const moveThreshold = 6;
        const touchMoveX =
            (event.touches[0].clientX - this.initialTouchX) * scaleX;
        // const newStarX = this.STAR.xWhenTouchStart + touchMoveX;

        this.STAR.x = this.STAR.xWhenTouchStart + touchMoveX;
        // 判断移动方向
        const deltaX = this.STAR.x - this.STAR.lastXforDirextion; // deltaX是上一次重新计算方向时的x和现在的x的差

        if (Math.abs(deltaX) > moveThreshold) {
            this.STAR.direction = deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0;
            this.STAR.lastXforDirextion = this.STAR.x;
            this.STAR.lastDirectionChangeTime = Date.now();
        }

        // 防止星星移出屏幕
        this.STAR.x = Math.min(
            Math.max(this.STAR.x, 0),
            canvas.width - this.STAR.width
        );
    }
    handleTouchEnd(event) {
        if (!this.touchEnabled) return;

        let btn;
        switch (this.gameStatus) {
            case 0:
                btn = this.startButton;
                break;
            case 2:
            case 3:
                btn = this.restartButton;
                break;
            default:
                return;
        }
        const { buttonWidth, buttonHeight, buttonX, buttonY } = btn;

        const mouseX =
            event.changedTouches[0].clientX -
            canvas.getBoundingClientRect().left;
        const mouseY =
            event.changedTouches[0].clientY -
            canvas.getBoundingClientRect().top;

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
    handleTouchStart(event) {
        this.touchEnabled = true;
        switch (this.gameStatus) {
            case 1:
                this.initialTouchX = event.touches[0].clientX;
                this.STAR.xWhenTouchStart = this.STAR.x;
                break;
            default:
                return;
        }
    }

    gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // this.animationCycle = (this.animationCycle + 1) % 2;
        this.updateBackgroundStars();
        this.drawBackground();

        switch (this.gameStatus) {
            case 0:
                this.showMainMenu();
                break;
            case 1:
                this.updateStar();
                this.STAR.draw();

                this.updateObstacles();
                this.drawObstacles();

                this.score += this.STAR.speed / 10;
                this.updateSpeed();
                this.drawScore();

                for (const obstacle of this.obstacles) {
                    if (this.isColliding(this.STAR, obstacle)) {
                        const preHighScore =
                            parseInt(localStorage.getItem("highScore")) || 0;
                        const highScore = Math.max(this.score, preHighScore);
                        const rewardHasShown =
                            parseInt(localStorage.getItem("rewardHasShown")) ||
                            0; //类型可能不对

                        this.startTime = Date.now(); // 只重置这个，不能调用resetParameters，会把分数也清零
                        localStorage.setItem("highScore", highScore);
                        this.touchEnabled = false; // 防止触发touchend事件，直接手都没抬起来就点了按钮

                        // if (1) {
                        if (
                            !rewardHasShown &&
                            preHighScore < REWARD_SCORE &&
                            this.score >= REWARD_SCORE
                        ) {
                            this.music.playRewardSound();
                            vibrateWithInterval(4, 225, true);
                            this.gameStatus = 3;
                        } else {
                            this.music.playCollisionSound();
                            wx.vibrateShort({ type: "light" });
                            this.gameStatus = 2;
                        }
                    }
                }
                break;
            case 2:
                this.showGameOverScreen();
                break;
            case 3:
                this.showRewardScreen();
                break;
        }

        // 帧数相关计算
        const currentTime = Date.now();
        this.frameInterval = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        const actualFPS = 1000 / this.frameInterval;
        // console.log(actualFPS)

        this.bindGameLoop = this.gameLoop.bind(this);
        window.requestAnimationFrame(this.bindGameLoop, canvas);
    }

    startGame() {
        this.resetParameters();

        this.gameStatus = 1;
        // this.playNextMusic();
        this.music.playBGM("pinkMemory_original");
    }
    // playNextMusic() {
    //     // 设置速度
    //     this.STAR.speed = speedList[this.currentSpeedIndex];
    
    //     // 播放音乐
    //     const currentMusic = musicList[this.currentMusicIndex];
    //     const musicInstance = this.music.playBGM(currentMusic);
    //     console.log(currentMusic, this.currentMusicIndex, this.currentSpeedIndex)
        
    //     // 检查是否有音乐实例返回，确保我们可以添加事件监听器
    //     if (musicInstance) {
    //       // 当音乐播放完毕时
    //       const onMusicEnded = () => {
    //         console.log('音乐结束')
    //         // 如果不是最后一个音乐和速度，将索引递增
    //         if (this.currentMusicIndex < musicList.length - 1) {
    //           this.currentMusicIndex++;
    //           this.currentSpeedIndex++;
    //         }
    //         // 播放下一首音乐
    //         this.playNextMusic();
    
    //         // 移除事件监听器
    //         musicInstance.offEnded(onMusicEnded);
    //       };
          
    //       musicInstance.onEnded(onMusicEnded); // 无语，onEnded也不被触发，什么垃圾wx
    //     }
    //   }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
    ctx.closePath();
    ctx.fill();
}
function vibrateWithInterval(times, interval, startWithInterval = false) {
    if (startWithInterval) {
        setTimeout(() => {
            vibrateWithInterval(times, interval);
        }, interval);
        return;
    }
    if (times > 0) {
        wx.vibrateShort({ type: "light" });
        setTimeout(() => {
            vibrateWithInterval(times - 1, interval);
        }, interval);
    }
}
