<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="star" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">取号数量</div>
            <count-to :start-val="0" :end-val="hotNumInfoTotal" :duration="2600" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="size" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">布控数量</div>
            <count-to :start-val="0" :end-val="blackNum" :duration="2600" class="card-panel-num"/>

          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="peoples" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">人脸统计</div>
            <count-to :start-val="0" :end-val="peopleFaces" :duration="2600" class="card-panel-num"/>

          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shoppingCard">
            <svg-icon icon-class="list" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日总量</div>
            <count-to :start-val="0" :end-val="orderTotal" :duration="2600" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="40" :sm="40" :lg="40" class="card-panel-col">
        <div ref="eCharts12" style="margin-top: 1%;width: 100%;height: 300px"/>
      </el-col>

    </el-row>
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="40" :sm="40" :lg="40" class="card-panel-col">
        <div style="margin-top: 3%;width: 100%;height: 200px;display: flex;justify-content: space-between">
          <div ref="eCharts14" style="margin-top:-20px;width: 100%;height: 243px"/>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { info } from '@/api/dashboard'
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      blackNum: 0,
      peopleFaces: 0,
      hotNumInfoTotal: 0,
      orderTotal: 0,
      hotNumInfoList: null,
      xData: [],
      ydata: [],
      todayhotNumInfoNum: '',
      guiShuDi: [],
      xdata: []
    }
  },
  created() {
    info().then(response => {
      this.peopleFaces = response.data.data.peopleFaces
      this.blackNum = response.data.data.blackNum
      this.hotNumInfoTotal = response.data.data.hotNumInfoTotal
      this.hotNumInfoList = response.data.data.hotNumInfoList
      this.guiShuDi = response.data.data.guiShuDi
      this.todayhotNumInfoNum = response.data.data.todayhotNumInfoNum
      const hotNumInfoList = this.hotNumInfoList
      const xData = []
      for (let i = 1; i < 15; i++) {
        const date = this.getDay(-i)
        xData.push(date)
      }
      const ydata = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      for (let j = 0; j < hotNumInfoList.length; j++) {
        const index = this.getDaysBetween(hotNumInfoList[j].capture_time)
        ydata.splice(parseInt(index), 1, hotNumInfoList[j].num)
      }
      // eslint-disable-next-line no-unused-vars
      const data = JSON.parse(JSON.stringify(this.guiShuDi))
      // this.drawYuan(data)
      this.drawLine(xData, ydata)
      for (let i = 1; i < 15; i++) {
        const date = this.getDay(-i)
        this.xdata.push(date)
      }
      const Ydata = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      const cameraCatInfoServiceHoTnumInfoDateNum = response.data.data.cameraCatInfoServiceHoTnumInfoDateNum
      for (let j = 0; j < cameraCatInfoServiceHoTnumInfoDateNum.length; j++) {
        const index = this.getDaysBetween(cameraCatInfoServiceHoTnumInfoDateNum[j].capture_time)
        Ydata.splice(parseInt(index), 1, cameraCatInfoServiceHoTnumInfoDateNum[j].num)
      }
      this.drawZhe(Ydata)
    })
  },
  methods: {
    doHandleMonth(month) {
      let m = month
      if (month.toString().length == 1) {
        m = '0' + month
      }
      return m
    },
    getDaysBetween(dateString1) {
      var startDate = new Date(Date.parse(dateString1)).getDate()
      var endDate = new Date().getDate()
      var days = (endDate - startDate)
      return days - 1
    },
    getDay(day) {
      const today = new Date()
      const targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day
      today.setTime(targetday_milliseconds) // 注意，这行是关键代码
      let tMonth = today.getMonth()
      let tDate = today.getDate()
      tMonth = this.doHandleMonth(tMonth + 1)
      tDate = this.doHandleMonth(tDate)
      return tMonth + '/' + tDate
    },
    drawLine(xdata, ydata) {
      // 基于准备好的dom，初始化echarts实例
      console.log(ydata)
      const xData = xdata
      const yData = ydata
      const myChart = new echarts.init(this.$refs.eCharts12)
      const option = {
        title: {
          text: '近15天取号统计',
          left: 'left',
          textStyle: {
            color: '#040506',
            fontSize: 20
          },
          top: '3%',
          left: '4%'
        },
        backgroundColor: '#FFFFFF',
        grid: {
          top: '25%',
          bottom: '10%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            label: {
              show: true
            }
          }
        },
        xAxis: {
          data: xData,
          axisLine: {
            show: true // 隐藏X轴轴线
          },
          axisTick: {
            show: true // 隐藏X轴刻度
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#8C8C8C' // X轴文字颜色
            }
          },
          axisLine: {
            lineStyle: {
              color: '#8C8C8C'
            }
          }
        },
        yAxis: [{
          type: 'value',
          name: '数量',
          nameTextStyle: {
            color: '#8C8C8C'
          },
          splitLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#95ccff'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#8C8C8C'
            }
          }

        },
        {
          type: 'value',
          gridIndex: 0,
          min: 50,
          max: 100,
          splitNumber: 8,
          splitLine: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(250,250,250,0.0)', 'rgba(250,250,250,0.05)']
            }
          }
        }
        ],
        series: [{
          name: '每日取号',
          type: 'bar',
          barWidth: 15,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: '#00FFE3'
              },
              {
                offset: 1,
                color: '#4693EC'
              }
              ]),
              label: {
                show: true,
                textStyle: {
                  color: 'black'
                },
                position: 'top',
                formatter: function(p) {
                  return p.value > 0 ? (p.value) : ''
                }
              }
            }
          },
          data: yData
        }
        ]
      }
      myChart.setOption(option)
    },
    // drawYuan(data) {
    //   const myChart = new echarts.init(this.$refs.eCharts13)
    //   const option = {
    //     backgroundColor: '#FFFFFF',
    //     title: {
    //       text: '归属地分析',
    //       left: 'left',
    //       top: 0,
    //       textStyle: {
    //         color: '#040506'
    //       },
    //       top: '3%',
    //       left: '10%'
    //     },
    //
    //     tooltip: {
    //       trigger: 'item',
    //       formatter: '{b} : {c} ({d}%)'
    //     },
    //
    //     visualMap: {
    //       show: false,
    //       inRange: {
    //         // colorLightness: [0, 1]
    //       }
    //     },
    //     series: [{
    //       name: '访问来源',
    //       type: 'pie',
    //       radius: '90%',
    //       center: ['50%', '50%'],
    //       color: ['#FFB980', '#2EC7C9', '#B6A2DE', '#5AB1EF'], // '#FBFE27','rgb(11,228,96)','#FE5050'
    //       data: data.sort(function(a, b) {
    //         return a.value - b.value
    //       }),
    //       roseType: 'radius',
    //
    //       label: {
    //         normal: {
    //           formatter: ['{c|{c}次}', '{b|{b}}'].join('\n'),
    //           rich: {
    //             c: {
    //               color: '#040506',
    //               fontSize: 10,
    //               fontWeight: 'bold',
    //               lineHeight: 3
    //             },
    //             b: {
    //               color: '#040506',
    //               fontSize: 13,
    //               height: 20
    //             }
    //           }
    //         }
    //       },
    //       labelLine: {
    //         normal: {
    //           lineStyle: {
    //             color: '#200000'
    //           },
    //           smooth: 0.2,
    //           length: 10,
    //           length2: 20
    //
    //         }
    //       },
    //       itemStyle: {
    //         normal: {
    //           shadowColor: '#FFFFFF',
    //           shadowBlur: 50
    //         }
    //       }
    //     }]
    //   }
    //   myChart.setOption(option)
    // },
    drawZhe(Ydata) {
      const myChart = new echarts.init(this.$refs.eCharts14)
      const xData = JSON.parse(JSON.stringify(this.xdata))
      const option = {
        title: {
          text: '近15天人脸统计',
          left: 'left',
          textStyle: {
            color: '#040506',
            fontSize: 20
          },
          top: '3%',
          left: '4%'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: [{
          type: 'category',
          data: xData,
          axisLine: {
            lineStyle: {
              color: '#55B1DE'
            }
          }
        }],
        backgroundColor: '#FFFFFF',
        yAxis: [{
          type: 'value',
          splitNumber: 4,
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#DDD'
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#55B1DE'
            }
          },
          nameTextStyle: {
            color: '#55B1DE'
          },
          splitArea: {
            show: false
          }
        }],
        series: [{
          name: '数量',
          type: 'line',
          data: Ydata,
          lineStyle: {
            normal: {
              width: 6,
              color: {
                type: 'linear',

                colorStops: [{
                  offset: 0,
                  color: '#5AB1EF' // 0% 处的颜色
                }, {
                  offset: 1,
                  color: '#B6A2DE' // 100% 处的颜色
                }],
                globalCoord: false // 缺省为 false
              },
              shadowColor: 'rgba(72,216,191, 0.3)',
              shadowBlur: 10,
              shadowOffsetY: 20
            }
          },
          itemStyle: {
            normal: {
              color: '#fff',
              borderWidth: 10,
              borderColor: '#A9F387'
            }
          },
          smooth: true
        }]
      }
      myChart.setOption(option)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .dashboard-editor-container {
    padding: 32px;
    height: 100%;
    width: 100%;
    background-color: #F0F2F5;

    .chart-wrapper {
      background: #EFF1F4;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }

  .panel-group {
    margin-top: 5px;

    .card-panel-col {
      margin-bottom: 32px;
    }

    .card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #666;
      background: #fff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgba(0, 0, 0, .05);

      &:hover {
        .card-panel-icon-wrapper {
          color: #fff;
        }

        .icon-people {
          background: #40c9c6;
        }

        .icon-message {
          background: #36a3f7;
        }

        .icon-money {
          background: #f4516c;
        }

        .icon-shoppingCard {
          background: #34bfa3
        }
      }

      .icon-people {
        color: #40c9c6;
      }

      .icon-message {
        color: #36a3f7;
      }

      .icon-money {
        color: #f4516c;
      }

      .icon-shoppingCard {
        color: #34bfa3
      }

      .card-panel-icon-wrapper {
        float: left;
        margin: 14px 0 0 14px;
        padding: 16px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
      }

      .card-panel-icon {
        float: left;
        font-size: 48px;
      }

      .card-panel-description {
        float: right;
        font-weight: bold;
        margin: 26px;
        margin-left: 0px;

        .card-panel-text {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
          margin-bottom: 12px;
        }

        .card-panel-num {
          font-size: 20px;
        }
      }
    }
  }
</style>
