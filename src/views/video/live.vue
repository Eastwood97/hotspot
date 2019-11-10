<template>
  <div class="app-container">
    <div class="player">
      <video-player
        ref="videoPlayer"
        :playsinline="true"
        :options="playerOptions"
        :x5-video-player-fullscreen="true"
        class="video-player vjs-custom-skin"
        style="object-fit:fill;width: 400px;height: 400px"
        custom-event-name="customstatechangedeventname"
      />
    </div>
  </div>
</template>

<style scoped>

.video-js .vjs-big-play-button {
  width: 72px;
  height: 72px;
  border-radius: 100%;
  z-index: 100;
  background-color: #ffffff;
  border: solid 1px #979797;
	}
.filter-item{
  margin-left: 100px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
.player {
    margin: 20px;
  width: 400px;
  height: 400px;
  display: block;
  object-fit: fill;
}
</style>

<script>
import { listRTSPUrl } from '@/api/videore'
import { getToken } from '@/utils/auth'
import 'video.js/dist/video-js.css'
import 'videojs-flash'
import { videoPlayer } from 'vue-video-player'

export default {
  name: 'Category',
  components: {
    videoPlayer
  },
  data() {
    return {
      camera: {
        url: '',
        desc: ''
      },
      title: '',
      size: '',
      name: [1],
      videoShow: false,
      playerOptions: {
        // videojs options
        muted: true,
        language: 'en',
        fluid: true,
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        techOrder: ['flash', 'html5'], // 设置顺序，
        sourceOrder: true,
        flash: { hls: { withCredentials: false }},
        html5: { hls: { withCredentials: false }},
        sources: [
          {
            type: 'rtmp/flv',
            src: 'rtmp://192.201.102.100/hls/cctv'
          },
          {
            withCredentials: false,
            type: 'application/x-mpegURL',
            src: 'http://192.201.102.100/hls/cctv.m3u8'// 这是hls流
          }
        ],
        width: '280px',
        height: '120px',
        autoplay: true
      },
      playerOptionss: {
        //        playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
        autoplay: false, // 如果true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 导致视频一结束就重新开始。
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [{
          type: 'application/x-mpegURL',
          src: 'video.m3u8' // 你的m3u8地址（必填）
        }],
        poster: 'poster.jpg', // 你的封面地址
        width: document.documentElement.clientWidth,
        notSupportedMessage: '此视频暂无法播放，请稍后再试' // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        //        controlBar: {
        //          timeDivider: true,
        //          durationDisplay: true,
        //          remainingTimeDisplay: false,
        //          fullscreenToggle: true  //全屏按钮
        //        }
      }

    }
  },
  computed: {
    // player() {
    //   return this.$refs.videoPlayer.player
    // },
    headers() {
      return {
        'X-Litemall-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.getList()
  },
  mounted() {
  },
  methods: {
    getList() {
      this.listLoading = true
      listRTSPUrl()
        .then(response => {
          this.list = response.data.data.list
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    }
  }
}
</script>
