import './js/libs/weapp-adapter'
import './js/libs/symbol'

import Main from './js/main'

new Main()

wx.setPreferredFramesPerSecond(60);

// console.log('version', wx.getAppBaseInfo().SDKVersion)
// console.log('CanIUsePlay', wx.canIUse(InnerAudioContext.playbackRate))
// wx.canIUse(InnerAudioContext.playbackRate)
wx.getSystemInfo({
    success: (res) => {
        console.log(res);
        console.log(res.platform);
        console.log(res.SDKVersion);
    }
});