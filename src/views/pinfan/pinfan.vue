<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.imsi"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入最少次数"/>
      <el-date-picker
        v-model="listQuery.captureTime"
        :picker-options="pickerOptions"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="right"
        value-format="yyyy-MM-dd"
        class="filter-item"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>
    <!-- 查询结果 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="正在查询中。。。"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50"/>
      <el-table-column align="center" label="id" width="130px" prop="id"/>
      <el-table-column align="center" label="imsi" width="220px" prop="imsi"/>
      <el-table-column align="center" label="imei" width="200px" prop="imei"/>
      <el-table-column align="center" label="号码" width="200px" prop="isdn"/>
      <el-table-column align="center" label="抓拍时间" width="200px" prop="captureTime"/>
      <el-table-column align="center" label="操作" width="145px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.$index, scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row>
      <pagination
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.row"
        style="text-align:right"
        layout="total,  prev, pager, next, jumper"
        @pagination="getList"/>
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

  .avatar-uploader .el-upload:hover {
    border-color: #20a0ff;
  }
</style>
<script>
import { listTargetInfo, deleteTargetInfo } from '@/api/targetInfo'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
export default {
  name: 'Brand',
  components: { Pagination },
  data() {
    return {
      advanceSearchViewVisible: false,
      uploadPath,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
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
      list: [
        {
          id: 1,
          targetName: '小三',
          imsi: '460006682758499',
          imei: '310120048481877',
          isdn: '15261802134',
          captureTime: '2019-10-30 16:48:54'
        }
      ],
      total: 0,
      listLoading: true,
      listQuery: {
        imsi: '',
        imei: '',
        isdn: '',
        captureTime: null,
        page: 1,
        row: 7
      },
      multipleSelection: [],
      dataForm: {
        targetName: '',
        imsi: '',
        isdn: '',
        imei: '',
        targetId: undefined,
        desc: '',
        operatorId: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [
          { required: true, message: '品牌商名称不能为空', trigger: 'blur' }
        ]
      },
      downloadLoading: false
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
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listTargetInfo(this.listQuery)
        .then(response => {
          this.list = response.data.data.rows
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        imsi: '',
        isdn: '',
        imei: '',
        captureTime: ''
      }
    },
    /**
       * 删除
       */
    handleDelete(index, rowData) {
      const id = []
      id.push(rowData.id)
      this.$confirm('此操作将永久删除该信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTargetInfo(id)
          .then((data) => {
            this.$message({ type: 'success', message: '删除成功!' })
            this.getList()
          })
          .catch(() => {
            this.$message({ message: '执行失败，请重试', type: 'error' })
          })
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
      })
    },
    /**
       * 批量删除
       */
    deleteMany() {
      var ids = this.multipleSelection.map(item => item.id)
      if (ids.length == 0) {
        this.$message({ message: '请选择要删除的项', showClose: true, type: 'warning' })
        return
      }
      debugger
      this.$confirm('此操作将批量永久删除文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTargetInfo(ids)
          .then((data) => {
            this.$message({ type: 'success', message: '删除成功!' })
            this.getList()
          })
          .catch(() => {
            debugger
            this.$message({ message: '执行失败，请重试', type: 'error' })
          })
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
      })
    },
    handleDownload() {
      this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = [
            'id',
            'imsi',
            'imei',
            '号码',
            '抓拍时间'
          ]
          const filterVal = ['id', 'imsi', 'imei', 'isdn', 'captureTime']
          excel.export_json_to_excel2(
            tHeader,
            this.list,
            filterVal,
            '中标信息'
          )
          this.downloadLoading = false
        })
    },
    // 展示高级搜索窗口
    showAdvanceSearchView() {
      this.advanceSearchViewVisible = !this.advanceSearchViewVisible
      this.resetForm()
      if (!this.advanceSearchViewVisible) {
        this.resetForm()
        this.getList()
      }
    },
    // 取消搜索
    cancelSearch() {
      this.advanceSearchViewVisible = false
      this.resetForm()
      this.beginDateScope = ''
      this.getList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(this.multipleSelection)
    }
  }
}
</script>
