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
        this.bgmList.redRiverValley.autoplay = true;

        this.bgmList.pinkMemory_original = wx.createInnerAudioContext();
        this.bgmList.pinkMemory_original.src = "audio/pinkMemory_original.mp3";
        this.bgmList.pinkMemory_original.loop = true;
        this.bgmList.pinkMemory_repeatable_113 = wx.createInnerAudioContext();
        this.bgmList.pinkMemory_repeatable_113.src = "audio/pinkMemory_repeatable_113.mp3";
        this.bgmList.pinkMemory_repeatable_113.loop = true;
        this.bgmList.pinkMemory_repeatable_136 = wx.createInnerAudioContext();
        this.bgmList.pinkMemory_repeatable_136.src = "audio/pinkMemory_repeatable_136.mp3";
        this.bgmList.pinkMemory_repeatable_136.loop = true;
        this.bgmList.pinkMemory_repeatable_150 = wx.createInnerAudioContext();
        this.bgmList.pinkMemory_repeatable_150.src = "audio/pinkMemory_repeatable_150.mp3";
        this.bgmList.pinkMemory_repeatable_150.loop = true;
        this.bgmList.pinkMemory_repeatable_175 = wx.createInnerAudioContext();
        this.bgmList.pinkMemory_repeatable_175.src = "audio/pinkMemory_repeatable_175.mp3";
        this.bgmList.pinkMemory_repeatable_175.loop = true;

        this.bgmList.happyBirthday = wx.createInnerAudioContext();
        this.bgmList.happyBirthday.src = "audio/happyBirthday.mp3";
        this.bgmList.happyBirthday.loop = true;

        // 预加载音频，避免加速播放时，加载的还不够多，导致需要重新播放（就多那么一两秒就有效？真的是因为这个导致的重新播放吗？）
        for (let bgmName in this.bgmList) {
            this.preloadAudio(this.bgmList[bgmName]);
        }

        this.currentBGM = this.bgmList.redRiverValley;
        // this.currentPlayTime = null;

        // 确保切出小程序后回来能继续播放音乐
        // wx.onHide(()=>{
        //     this.currentBGM.pause();
        //     this.currentPlayTime = this.currentBGM.currentTime; // 存的不是暂停时候的位置，好像暂停有延迟d
        //     console.log('onHide', this.currentBGM.currentTime)
        // })
        wx.onShow(() => {
            if (this.currentBGM && this.currentBGM.paused) {
                // this.currentBGM.seek(this.currentPlayTime)
                this.currentBGM.play();
            }
        });
        // 避免被ios静音(不需要单独设置参数，因为那个是2.3.0版本以下的，我们用了playbackrate，就必须要2.11.0以上)
        wx.setInnerAudioOption({
            obeyMuteSwitch: false,
        });
    }
    playCollisionSound() {
        this.collisionSound.play();
    }
    playRewardSound() {
        this.rewardSound.play();
    }
    playBGM(bgmName, delay = 0) {
        if (this.currentBGM) {
            if (this.currentBGM == this.bgmList[bgmName]) {
                this.currentBGM.play();
                return;//防止重复stop
            } 

            this.currentBGM.playbackRate = 1;
            this.currentBGM.stop(); // 可能设置了速度之后就得暂停或者stop一下，不然下次播放会有问题？
            this.currentBGM.seek(0); // ios的兼容，不加不会从头开始
        }
        this.currentBGM = this.bgmList[bgmName];
        setTimeout(() => {
            this.currentBGM.play();
        }, delay);

        return this.currentBGM;

        // this.currentBGM.onWaiting(() => {
        //     console.log("wating!", this.currentBGM.currentTime);
        // });
    }
    setBGMplayBackRate(playBackRate) {
        // console.log(playBackRate);
        wx.getSystemInfo({
            success: (res) => {
                let os = res.platform;
                if (os.includes("ios")) {
                    // console.log('ios下设置了倍速')
                    // this.currentBGM.playbackRate = 2;
                    // this.currentBGM.pause();
                    // this.currentBGM.onPause(() =>{
                    //     const src = this.currentBGM.src;
                    //     this.currentBGM.src= 'audio/redRiverValley.mp3';
                    //     this.currentBGM.src= src;
                    //     this.currentBGM.play();
                    // })
                } else {
                    this.currentBGM.playbackRate = playBackRate;
                    this.currentBGM.pause();
                    this.currentBGM.play();
                }
            },
        });
        // this.currentBGM.playbackRate = playBackRate;
        // this.currentBGM.pause();
        // this.currentBGM.play();
    }

    preloadAudio(audio) {
        audio.onCanplay(() => {
            let needRestore = false;
            // console.log(this.currentBGM, this.currentBGM.paused)
            if (this.currentBGM && this.currentBGM.paused) {
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
