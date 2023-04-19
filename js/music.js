import { BGMLIST } from "./constant";
export default class Music {
    constructor () {
        this.collisionSound = new Audio("audio/drop.mp3");
        this.rewardSound = new Audio("audio/mario_mushroom.mp3");

        this.bgmList = {}
        // for (bgmName in BGMLIST) {
        //     this.bgmList.bgmName = new Audio(BGMLIST[bgmName])
        //     this.bgmList.bgmName.loop = true;
        // }
        // this.bgmList.redRiverValley = new Audio("audio/redRiverValley.mp3");
        this.bgmList.redRiverValley = wx.createInnerAudioContext();
        this.bgmList.redRiverValley.src = "audio/redRiverValley.mp3"
        this.bgmList.redRiverValley.loop = true;
        // this.bgmList.pinkMemory = new Audio("audio/pinkMemory.mp3");
        this.bgmList.pinkMemory = wx.createInnerAudioContext();
        this.bgmList.pinkMemory.src = "audio/pinkMemory.mp3"
        this.bgmList.pinkMemory.loop = true;
        this.bgmList.happyBirthday = wx.createInnerAudioContext();
        this.bgmList.happyBirthday.src = "audio/happyBirthday.mp3"
        this.bgmList.happyBirthday.loop = true;

        this.currentBGM = null;
    }
    playCollisionSound () {
        this.collisionSound.play();
    }
    playRewardSound () {
        this.rewardSound.play();
    }
    playBGM(bgmName, delay = 0){
        if (this.currentBGM) {
            if (this.currentBGM == this.bgmList[bgmName]) return; //防止重复stop

            this.currentBGM.playbackRate = 1; 
            // seek(0)
            this.currentBGM.stop();// 可能设置了速度之后就得暂停或者stop一下，不然下次播放会有问题？
        }
        this.currentBGM = this.bgmList[bgmName]
        setTimeout(() => {
            this.currentBGM.play();
        }, delay);
        
    }
    setBGMplayBackRate (playBackRate) {
        this.currentBGM.playbackRate = playBackRate;
        this.currentBGM.pause();
        this.currentBGM.play();
    }
}