<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-form
        ref="formSearch"
        :label-position="labelPosition"
        :inline="true"
        :model="formSearch"
        style="display: flex"
        class="filter-item"
      >
        <el-form-item label="区域" prop="area">
          <el-select
            v-model="formSearch.area"
            placeholder="请选择区域"
            clearable
            class="select-type1"
            @change="changeArea"
          >
            <el-option
              v-for="item in AreaOptions"
              :key="item.id"
              :label="item.value"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备号" prop="devId">
          <el-select
            v-model="formSearch.devId"
            placeholder="请选择设备号"
            clearable
            class="select-type1">
            <el-option
              v-for="item in DevIdOption"
              :key="item.devId"
              :label="item.value"
              :value="item.devId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间" prop="createTime">
          <el-date-picker
            v-model="formSearch.createTime"
            :picker-options="pickerOptions"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="" prop="">
          <el-button
            v-permission="['GET /admin/admin/list']"
            type="primary"
            icon="el-icon-search"
            @click="search"
          >查找
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-row>
      <el-col :span="24">
        <div ref="eCharts1" class="context-div"/>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div ref="eCharts2" class="context-div"/>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div ref="eCharts3" class="context-div"/>
      </el-col>
    </el-row>
  </div>
</template>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .context-div {
    width: 100%;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px dashed #e7eaec;
    margin: 20px 0;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #20a0ff;
  }

</style>
<script>
import { searchArea_device, searchAreaList, searchCountry } from '@/api/fenxi'
export default {
  name: 'Admin',
  data() {
    return {
      formSearch: { // 表单查询
        area: '',
        devId: '',
        createTime: ''
      },
      Data: [],
      labelPosition: 'left', // lable对齐方式
      AreaOptions: [],
      DevIdOption: [],
      values: '',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()  - 24 * 60 * 60 * 1000;
        },
        shortcuts: [
          {
            text: '所有',
            onClick(picker) {
              const end = new Date(new Date().getTime()-1000*60*60*24)
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 5000)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date(new Date().getTime()-1000*60*60*24)
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date(new Date().getTime()-1000*60*60*24)
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date(new Date().getTime()-1000*60*60*24)
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }]
      },
      value1: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      value2: '',
      GJData: [],
      GuoBie: ['国内', '国外'],
      GeGuo: []
    }
  },
  computed: {
    headers() {
      return {
        'X-Litemall-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.searchArea()
  },
  methods: {
    search() {
      if (this.formSearch.area == '') {
        this.$message({
          message: '请选择区域',
          type: 'error'
        })
        return
      }
      console.log(this.formSearch.devId)
      if (this.formSearch.devId == null) {
        this.$message({
          message: '请选择设备',
          type: 'error'
        })
        return
      }
      if (this.formSearch.createTime == '') {
        this.$message({
          message: '请选择时间',
          type: 'error'
        })
        return
      }
      const param = Object.assign({}, this.formSearch)
      console.log(param)
      searchCountry(param).then((data) => {
        if (data && data.data) {
          this.Data = []
          this.GJData = []
          this.GeGuo = []
          const json = data.data.data
          console.log(json)
          for (var i = 0; i < json.guoBieList.length; i++) {
            this.Data.push({ value: json.guoBieList[i].num, name: json.guoBieList[i].attribution })
          }
          console.log(json)
          for (var i = 0; i < json.GuojiCountList.length; i++) {
            this.GJData.push({ value: json.GuojiCountList[i].num, name: json.GuojiCountList[i].country })
          }
          this.GeGuo.push({ value: json.MyGuoCount.num, name: '中国' })
          for (var i = 0; i < json.GuoWaiGeGuoCount.length; i++) {
            this.GeGuo.push({ value: json.GuoWaiGeGuoCount[i].num, name: json.GuoWaiGeGuoCount[i].country })
          }
          this.drawPie1()
          this.drawPie2()
          this.drawPie3()
        }
      }).catch((err) => {
        this.listLoading = false
        this.$message({ message: '查询异常，请重试', type: 'error' })
      })
    },
    drawPie1() {
      const myChart = new echarts.init(this.$refs.eCharts1)
      const option = {
        title: {
          text: '国内各省份比例',
          x: 'left',
          color: '#565050'
        },
        grid: {
          bottom: '1%',
          containLabel: true
        },
        legend: {
          top: '10%',
          orient: 'vertical',
          x: 'left'
        },
        color: ['#37a2da', '#32c5e9', '#3bc26b', '#87681F', '#c96c4c', '#fb7293', '#a33ebf', '#8378ea', '#ea02a2', '#ea7c30'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        toolbox: {
          left: 'right',
          top: 'center',
          orient: 'vertical',
          show: true,
          feature: {
            mark: {
              show: true
            },
            dataView: {
              show: true,
              readOnly: false
            },
            magicType: {
              show: true,
              type: ['pie', 'funnel']
            },
            restore: {
              show: true
            },
            saveAsImage: {
              show: true
            }
          }
        },
        calculable: true,
        series: [{
          name: '归属地业务统计表',
          label: {
            normal: {
              formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
              backgroundColor: '#eee',
              borderColor: '#aaa',
              borderWidth: 1,
              borderRadius: 4,
              rich: {
                a: {
                  color: '#454343',
                  lineHeight: 22,
                  align: 'center'
                },
                hr: {
                  borderColor: '#aaa',
                  width: '100%',
                  borderWidth: 0.5,
                  height: 0
                },
                b: {
                  fontSize: 14,
                  lineHeight: 20
                },
                per: {
                  color: '#ffffff',
                  backgroundColor: '#000000',
                  padding: [2, 4],
                  borderRadius: 2
                }
              }
            }
          },
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '50%'],
          data: this.Data,
          animationEasing: 'cubicInOut',
          animationDuration: 2000
        }]
      }
      myChart.setOption(option)
    },
    drawPie2() {
      const myChart = new echarts.init(this.$refs.eCharts2)
      const option = {
        title: {
          text: '各国比例',
          x: 'left'
        },
        legend: {
          top: '10%',
          orient: 'vertical',
          x: 'left'
        },
        color: ['#37a2da', '#32c5e9', '#9fe6b8', '#ffdb5c', '#ff9f7f', '#fb7293', '#e7bcf3', '#8378ea'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        toolbox: {
          show: true,
          left: 'right',
          top: 'center',
          orient: 'vertical',
          feature: {
            mark: {
              show: true
            },
            dataView: {
              show: true,
              readOnly: false
            },
            magicType: {
              show: true,
              type: ['pie', 'funnel']
            },
            restore: {
              show: true
            },
            saveAsImage: {
              show: true
            }
          }
        },
        calculable: true,
        series: [{
          name: '归属地业务统计表',
          label: {
            normal: {
              formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
              backgroundColor: '#eee',
              borderColor: '#aaa',
              borderWidth: 1,
              borderRadius: 4,
              rich: {
                a: {
                  color: '#454343',
                  lineHeight: 22,
                  align: 'center'
                },
                hr: {
                  borderColor: '#aaa',
                  width: '100%',
                  borderWidth: 0.5,
                  height: 0
                },
                b: {
                  fontSize: 16,
                  lineHeight: 20
                },
                per: {
                  color: '#ffffff',
                  backgroundColor: '#000000',
                  padding: [2, 4],
                  borderRadius: 2
                }
              }
            }
          },
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '50%'],
          data: this.GeGuo,
          animationEasing: 'cubicInOut',
          animationDuration: 2000
        }]
      }
      myChart.setOption(option)
    },
    drawPie3() {
      const myChart = new echarts.init(this.$refs.eCharts3)
      const option = {
        title: {
          text: '国内、国外对比',
          x: 'left'
        },
        legend: {
          top: '10%',
          orient: 'vertical',
          x: 'left',
          data: ['国内', '国外']
        },
        color: ['#FB7293', '#FF9F7F'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        toolbox: {
          left: 'right',
          top: 'center',
          orient: 'vertical',
          show: true,
          feature: {
            mark: {
              show: true
            },
            dataView: {
              show: true,
              readOnly: false
            },
            magicType: {
              show: true,
              type: ['pie', 'funnel']
            },
            restore: {
              show: true
            },
            saveAsImage: {
              show: true
            }
          }
        },
        calculable: true,
        series: [{
          avoidLabelOverlap: true, // 对，就是这里avoidLabelOverlap
          name: '归属地业务统计表',
          label: {
            normal: {
              formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
              backgroundColor: '#eee',
              borderColor: '#aaa',
              borderWidth: 1,
              borderRadius: 4,
              rich: {
                a: {
                  color: '#454343',
                  lineHeight: 22,
                  align: 'center'
                },
                hr: {
                  borderColor: '#aaa',
                  width: '100%',
                  borderWidth: 0.5,
                  height: 0
                },
                b: {
                  fontSize: 16,
                  lineHeight: 20
                },
                per: {
                  color: '#ffffff',
                  backgroundColor: '#000000',
                  padding: [2, 4],
                  borderRadius: 2
                }
              }
            }
          },
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '50%'],
          data: this.GJData,
          animationEasing: 'cubicInOut',
          animationDuration: 2000
        }]
      }
      myChart.setOption(option)
    },
    searchArea() {
      this.AreaOptions = []
      searchAreaList().then((data) => {
        if (data && data.data) {
          const json = data.data.data
          console.log(json)
          for (let i = 0; i < json.length; i++) {
            const param = {
              id: json[i].devId,
              value: json[i].devName
            }
            this.AreaOptions.push(param)
          }
        }
      }).catch((err) => {
        this.$message({ message: '查询异常，请重试', type: 'error' })
      })
    },
    changeArea() {
      this.DevIdOption = []
      this.formSearch.devId = null
      const id = this.formSearch.area
      searchArea_device({ id }).then((data) => {
        if (data && data.data) {
          var json = data.data.data
          console.log(json)
          for (let i = 0; i < json.length; i++) {
            const param = {
              devId: json[i].devId,
              value: json[i].value
            }
            this.DevIdOption.push(param)
          }
        }
      })
    }
  }
}
</script>
