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

</style>
<script>
import { searchArea_device, searchAreaList, searchTraffic } from '@/api/fenxi'
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
          return time.getTime() > Date.now() - 8.64e6// 如果没有后面的-8.64e6就是不可以选择今天的
        },
        shortcuts: [
          {
            text: '所有',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 5000)
              picker.$emit('pick', [start, end])
            }
          }, {
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
      value1: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      value2: '',
      GJData: [],
      GuoBie: ['国内', '国外'],
      GeGuo: [],
      series: [],
      xData: [],
      yData: []
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
      this.listLoading = true
      if (this.formSearch.area == '') {
        this.$message({
          message: '请选择区域',
          type: 'error'
        })
        return
      }
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
      this.xData = []
      this.yData = []
      searchTraffic(this.formSearch).then((data) => {
        if (data && data.data) {
          const json = data.data.data
          for (let i = 0; i < json.length; i++) {
            this.xData.push((json[i].createTime).substring(5, 10))
            this.yData.push(json[i].num)
          }
          this.changeSeries(this.formSearch.area)
        }
      }).catch((err) => {
        this.listLoading = false
        this.$message({ message: '查询异常，请重试', type: 'error' })
      })
    },
    changeSeries() {
      this.series = []
      if (this.formSearch.area == 1) {
        this.series = [{
          name: '东兴',
          itemStyle: {
            normal: {
              color: '#3bc26b',
              lineStyle: {
                color: '#3bc26b',
                width: 2
              }
            }
          },
          smooth: true,
          label: {
            show: true,
            textStyle: {
              color: 'black'
            },
            position: 'top',
            formatter: function(p) {
              return p.value > 0 ? (p.value) : ''
            }
          },
          type: 'bar',
          data: this.yData,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        }]
      } else if (this.formSearch.area == 2) {
        this.series = [{
          name: '友谊关',
          smooth: true,
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#3888fa',
              lineStyle: {
                color: '#3888fa',
                width: 2
              }
            }
          },
          label: {
            show: true,
            textStyle: {
              color: 'black'
            },
            position: 'top',
            formatter: function(p) {
              return p.value > 0 ? (p.value) : ''
            }
          },
          data: this.yData,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        }]
      }
      this.drawLine(this.series)
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
    },
    drawLine(series) {
      const myChart = new echarts.init(this.$refs.eCharts1)
      const option = {
        toolbox: {
          show: true,
          orient: 'vertical',
          left: 'right',
          top: 'center',
          feature: {
            dataView: { readOnly: false },
            magicType: { type: ['line', 'bar'] },
            restore: {},
            saveAsImage: {}
          }
        },
        calculable: true,
        xAxis: {
          data: this.xData,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: 50,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['东兴', '友谊关']
        },
        series: series
      }
      myChart.setOption(option)
    }
  }
}
</script>
