import { BGMLIST } from "./constant";
export default class Music {
    constructor() {
        this.collisionSound = new Audio("audio/drop.mp3");
        this.rewardSound = new Audio("audio/mario_mushroom.mp3");

        this.bgmList = {};
        // for (bgmName in BGMLIST) {
        //     this.bgmList.bgmName = new Audio(BGMLIST[bgmName])
        //     this.bgmList.bgmName.loop = true;
        // }

        // this.bgmList.redRiverValley = new Audio("audio/redRiverValley.mp3");
        this.bgmList.redRiverValley = wx.createInnerAudioContext();
        this.bgmList.redRiverValley.src = "audio/redRiverValley.mp3";
        this.bgmList.redRiverValley.loop = true;
        // this.bgmList.pinkMemory = new Audio("audio/pinkMemory.mp3");
        this.bgmList.pinkMemory = wx.createInnerAudioContext();
        this.bgmList.pinkMemory.src = "audio/pinkMemory.mp3";
        this.bgmList.pinkMemory.loop = true;

        this.bgmList.happyBirthday = wx.createInnerAudioContext();
        this.bgmList.happyBirthday.src = "audio/happyBirthday.mp3";
        this.bgmList.happyBirthday.loop = true;

        // 预加载音频，避免加速播放时，加载的还不够多，导致需要重新播放（就多那么一两秒就有效？真的是因为这个导致的重新播放吗？）
        this.preloadAudio(this.bgmList.redRiverValley);
        this.preloadAudio(this.bgmList.pinkMemory);
        this.preloadAudio(this.bgmList.happyBirthday);

        this.currentBGM = null;
    }
    playCollisionSound() {
        this.collisionSound.play();
    }
    playRewardSound() {
        this.rewardSound.play();
    }
    playBGM(bgmName, delay = 0) {
        if (this.currentBGM) {
            if (this.currentBGM == this.bgmList[bgmName]) return; //防止重复stop

            this.currentBGM.playbackRate = 1;
            // seek(0)
            this.currentBGM.stop(); // 可能设置了速度之后就得暂停或者stop一下，不然下次播放会有问题？
        }
        this.currentBGM = this.bgmList[bgmName];
        setTimeout(() => {
            this.currentBGM.play();
        }, delay);
    }
    setBGMplayBackRate(playBackRate) {
        console.log(playBackRate);
        this.currentBGM.playbackRate = playBackRate;
        this.currentBGM.pause();
        this.currentBGM.play();
    }

    preloadAudio(audio) {
        audio.onCanplay(() => {
            let needRestore = false;
            if (this.currentBGM && this.currentBGM) {
                needRestore = true;
            }

            audio.offCanplay();
            audio.play();
            audio.pause();
            audio.currentTime = 0;
            if (needRestore) {
                this.currentBGM.play();
            }
        });
    }
}
