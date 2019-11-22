<template>
  <div class="app-container">
    <!--按时间段搜索、设备名称搜索-->
    <div class="filter-container">
      <el-input
        v-model="devId"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入设备编号"
      />
      <el-date-picker
        v-model="time"
        :picker-options="pickerOptions"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="right"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>
    <!-- <video-player
        @click.stop
        class="video-player"
        :playsinline="playsinline"
        :options="playerOptions"
        :headers="headers"
        @play="onPlayerPlay($event)"
        @pause="onPlayerPause($event)"
        @ended="onPlayerEnded($event)"
        @loadeddata="onPlayerLoadeddata($event)"
        @waiting="onPlayerWaiting($event)"
        @playing="onPlayerPlaying($event)"
        @timeupdate="onPlayerTimeupdate($event)"
        @canplay="onPlayerCanplay($event)"
        @canplaythrough="onPlayerCanplaythrough($event)"
        @ready="playerReadied"
        @statechanged="playerStateChanged($event)"
      >
</video-player> -->
    <video id="my-video" class="video-js vjs-default-skin" controls="true" preload="auto" width="400px" heigt="400px">
      <source src="http://192.201.102.100:10008/record/stream_265/20191120/out.m3u8" type="application/x-mpegURL">
    </video>

    <canvas id="video-canvas"/>

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
// import { getToken } from '@/utils/auth'
// import 'video.js/dist/video-js.css'
// import 'videojs-flash'
// import { videoPlayer } from 'vue-video-player'
import { listFilterM3U8 } from '@/api/videore'
// import 'vue-video-player/src/custom-theme.css'
// import 'videojs-contrib-hls'
// import videojs from 'video.js'

import videojs from 'video.js'
import { getToken } from '@/utils/auth'
import 'video.js/dist/video-js.css'
import 'videojs-contrib-hls'

export default {
  name: 'Category',
  //   components: {
  //     videoPlayer,
  //     hls
  //   },
  data() {
    return {
      camera: {
        url: '',
        desc: ''
      },
      title: '',
      size: '',
      name: [1],
      devId: '',
      videoShow: false,
      playsinline: true,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      time: '',
      listQuery: {
        devId: ''
      }
    //   playerOptions: {
    //     events: [],
    //     playbackRates: [0.7, 1.0, 1.5, 2.0], // 播放速度
    //     autoplay: true, // 如果true,浏览器准备好时开始回放。
    //     controls: true, //  控制条
    //     preload: 'auto', // 视频预加载
    //     muted: false, //  默认情况下将会消除任何音频。
    //     loop: false, // 导致视频一结束就重新开始。
    //     language: 'zh-CN',
    //     controlBar: {
    //       timeDivider: true,
    //       durationDisplay: true
    //     },
    //     aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
    //     fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
    //     sources: [{
    //       type: 'application/x-mpegURL',
    //       src: ''
    //     }],
    //     hls: true, // 启用hls？
    //     poster: '', // 你的封面地址
    //     width: document.documentElement.clientWidth,
    //     notSupportedMessage: '此视频暂无法播放，请稍后再试' //  允许覆盖Video.js无法播放媒体源时显示的默认信息。
    //   }

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
    // this.playerOptions.sources[0].src = "http://192.201.102.100:10008/record/stream_265/20191119/out.m3u8"
  },
  mounted() {
    // var $ = document.querySelector.bind(document)
    // var vjsParsed,
    //   video,
    //   mediaSource

    // const xhr = new XMLHttpRequest()
    // xhr.open('GET', './test.ts')
    // // 接收的是 video/mp2t 二进制数据，Blob类型也可以，但arraybuffer类型方便后续直接处理
    // xhr.responseType = 'arraybuffer'
    // xhr.send()
    // xhr.onreadystatechange = function() {
    //   if (xhr.readyState == 4) {
    //     if (xhr.status == 200) {
    //       transferFormat(xhr.response)
    //     } else {
    //       console.log('error')
    //     }
    //   }
    // }

    videojs('my-video', {
      bigPlayButton: true,
      textTrackDisplay: true,
      posterImage: true,
      errorDisplay: false,
      controlBar: true
    }, function() {
      this.play()
    })
    // var canvas = document.getElementById('video-canvas')
    // console.log(canvas)
    // var url = 'out.ts'
    // // var url = 'ws://'+document.location.hostname+':8082/';
    // var player = new JSMpeg.Player(url, { canvas: canvas, loop: true, autoplay: true })
  },
  methods: {
    // logevent(event) {
    //   console.log(event)
    // },

    // transferFormat(data) {
    //   // 将源数据从ArrayBuffer格式保存为可操作的Uint8Array格式
    //   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
    //   var segment = new Uint8Array(data)
    //   var combined = false
    //   // 接收无音频ts文件，OutputType设置为'video'，带音频ts设置为'combined'
    //   var outputType = 'video'
    //   var remuxedSegments = []
    //   var remuxedBytesLength = 0
    //   var remuxedInitSegment = null

    //   // remux选项默认为true，将源数据的音频视频混合为mp4，设为false则不混合
    //   var transmuxer = new muxjs.mp4.Transmuxer({ remux: false })

    //   // 监听data事件，开始转换流
    //   transmuxer.on('data', function(event) {
    //     console.log(event)
    //     if (event.type === outputType) {
    //       remuxedSegments.push(event)
    //       remuxedBytesLength += event.data.byteLength
    //       remuxedInitSegment = event.initSegment
    //     }
    //   })
    //   // 监听转换完成事件，拼接最后结果并传入MediaSource
    //   transmuxer.on('done', function() {
    //     var offset = 0
    //     var bytes = new Uint8Array(remuxedInitSegment.byteLength + remuxedBytesLength)
    //     bytes.set(remuxedInitSegment, offset)
    //     offset += remuxedInitSegment.byteLength

    //     for (var j = 0, i = offset; j < remuxedSegments.length; j++) {
    //       bytes.set(remuxedSegments[j].data, i)
    //       i += remuxedSegments[j].byteLength
    //     }
    //     remuxedSegments = []
    //     remuxedBytesLength = 0
    //     // 解析出转换后的mp4相关信息，与最终转换结果无关
    //     vjsParsed = muxjs.mp4.tools.inspect(bytes)
    //     console.log('transmuxed', vjsParsed)

    //     prepareSourceBuffer(combined, outputType, bytes)
    //   })
    //   // push方法可能会触发'data'事件，因此要在事件注册完成后调用
    //   transmuxer.push(segment) // 传入源二进制数据，分割为m2ts包，依次调用上图中的流程
    //   // flush的调用会直接触发'done'事件，因此要事件注册完成后调用
    //   transmuxer.flush() // 将所有数据从缓存区清出来
    // },

    // prepareSourceBuffer(combined, outputType, bytes) {
    //   var buffer
    //   video = document.createElement('video')
    //   video.controls = true
    //   // MediaSource Web API: https://developer.mozilla.org/zh-CN/docs/Web/API/MediaSource
    //   mediaSource = new MediaSource()
    //   video.src = URL.createObjectURL(mediaSource)

    //   $('#video-wrapper').appendChild(video) // 将H5 video元素添加到对应DOM节点下

    //   // 转换后mp4的音频格式 视频格式
    //   var codecsArray = ['avc1.64001f', 'mp4a.40.5']

    //   mediaSource.addEventListener('sourceopen', function() {
    //     // MediaSource 实例默认的duration属性为NaN
    //     mediaSource.duration = 0
    //     // 转换为带音频、视频的mp4
    //     if (combined) {
    //       buffer = mediaSource.addSourceBuffer('video/mp4;codecs="' + 'avc1.64001f,mp4a.40.5' + '"')
    //     } else if (outputType === 'video') {
    //       // 转换为只含视频的mp4
    //       buffer = mediaSource.addSourceBuffer('video/mp4;codecs="' + codecsArray[0] + '"')
    //     } else if (outputType === 'audio') {
    //       // 转换为只含音频的mp4
    //       buffer = mediaSource.addSourceBuffer('audio/mp4;codecs="' + (codecsArray[1] || codecsArray[0]) + '"')
    //     }

    //     buffer.addEventListener('updatestart', this.logevent)
    //     buffer.addEventListener('updateend', this.logevent)
    //     buffer.addEventListener('error', this.logevent)
    //     video.addEventListener('error', this.logevent)
    //     // mp4 buffer 准备完毕，传入转换后的数据
    //     // 将 bytes 放入 MediaSource 创建的sourceBuffer中
    //     // https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/appendBuffer
    //     buffer.appendBuffer(bytes)
    //     // 自动播放
    //     // video.play();
    //   })
    // },

    handleFilter() {
      // 根据时间和设备进行搜索
      console.log(this.time)
      this.listQuery.startTime = this.format(this.time[0], 'yyyy-MM-dd HH:mm:ss')
      this.listQuery.endTime = this.format(this.time[1], 'yyyy-MM-dd HH:mm:ss')
      this.listQuery.devId = this.devId
      listFilterM3U8(this.listQuery)
        .then(response => {
          this.url = response.data
        })
        .catch(() => {
          this.url = ''
        })
    },

    format(time, format) {
      var t = new Date(time)
      var tf = function(i) { return (i < 10 ? '0' : '') + i }
      return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a) {
        switch (a) {
          case 'yyyy':
            return tf(t.getFullYear())
          case 'MM':
            return tf(t.getMonth() + 1)
          case 'mm':
            return tf(t.getMinutes())
          case 'dd':
            return tf(t.getDate())
          case 'HH':
            return tf(t.getHours())
          case 'ss':
            return tf(t.getSeconds())
        }
      })
    },
    handleAdd() {
      // 添加
      console.log(this.time)
    },
    getList() {

    },
    onPlayerPlay(player) {
      console.log('player play!', player)
    },
    onPlayerPause(player) {
      console.log('player pause!', player)
    },
    onPlayerEnded(player) {
      console.log('player ended!', player)
    },
    onPlayerLoadeddata(player) {
      console.log('player Loadeddata!', player)
    },
    onPlayerWaiting(player) {
      console.log('player Waiting!', player)
    },
    onPlayerPlaying(player) {
      console.log('player Playing!', player)
    },
    onPlayerTimeupdate(player) {
      console.log('player Timeupdate!', player.currentTime())
    },
    onPlayerCanplay(player) {
      console.log('player Canplay!', player)
    },
    onPlayerCanplaythrough(player) {
      console.log('player Canplaythrough!', player)
    },
    playerStateChanged(playerCurrentState) {
      console.log(playerCurrentState)
    },
    playerReadied(player) {
      // const _this = this
      // var hls = player.tech({ IWillNotUseThisInPlugins: true }).hls
      player.tech_.hls.xhr.beforeRequest = function(options) {
        console.log(options)
        const userInfo = localStorage.getItem('userInfo')
        const token = JSON.parse(userInfo).accessToken
        options.headers = {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json;charset=UTF-8',
          'Accept-Language': 'zh-CN,zh;q=0.9,hy;q=0.8,mn;q=0.7',
          'Authorization': 'Bearer ' + token
        }
        return options
      }
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
