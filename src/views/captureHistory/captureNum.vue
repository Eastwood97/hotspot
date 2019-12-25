<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.imsi"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入imsi"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="showAdvanceSearchView">高级搜索
      </el-button>
      <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload">导出
      </el-button>
    </div>
    <!--高级搜索框-->
    <div
      v-show="advanceSearchViewVisible"
      style="margin-bottom: 10px;border: 1px;border-radius: 5px;border-style: solid;padding: 5px 0px 5px 0px;box-sizing:border-box;border-color: #EBEEF5"
    >
      <el-row>
        <el-col :span="3">
          设备号:
          <el-input
            v-model="listQuery.devId"
            style="width: 70px"
            size="mini"
            width="10px"
            placeholder="设备号"
          />
        </el-col>
        <el-col :span="4">
          IMSI:
          <el-input
            v-model="listQuery.imsi"
            style="width: 120px"
            size="mini"
            placeholder="请输入IMSI"
          />
        </el-col>
        <el-col :span="4">
          IMEI:
          <el-input
            v-model="listQuery.imei"
            style="width: 120px"
            size="mini"
            placeholder="请输入IMEI"
          />
        </el-col>
        <el-col :span="4">
          电话号码:
          <el-input
            v-model="listQuery.isdn"
            style="width: 110px"
            size="mini"
            placeholder="请输入电话"
          />
        </el-col>
        <el-col :span="5">
          抓拍时间:
          <el-date-picker
            v-model="listQuery.captureTime"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd HH:mm:ss"
            size="mini"
            style="width: 160px"
            type="datetime">
            placeholder="选择日期"/>
          </el-date-picker>
        </el-col>
        <el-col :span="4" :offset="0" style="text-align: right">
          <el-button size="mini" @click="cancelSearch">取消</el-button>
          <el-button
            icon="el-icon-search"
            type="primary"
            size="mini"
            @click="handleFilter"
          >搜索
          </el-button>
        </el-col>
      </el-row>
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
      <el-table-column align="center" label="id" width="120px" prop="id"/>
      <el-table-column align="center" label="设备号" width="110px" prop="devId"/>
      <el-table-column align="center" label="imsi" width="180px" prop="imsi"/>
      <el-table-column align="center" label="imei" width="180px" prop="imei"/>
      <el-table-column align="center" label="号码" width="180px" prop="isdn"/>
      <el-table-column align="center" label="抓拍时间" width="180px" prop="captureTime"/>
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
      <el-button
        style="margin-top: 10px"
        size="small"
        round
        type="danger"
        @click="deleteMany">批量删除
      </el-button>
      <pagination
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.row"
        style="text-align:right;margin-top: -30px"
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
import { getHotnumInfo, deleteHotnumInfo } from '@/api/hotnuminfo'
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
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        devId: '',
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
      getHotnumInfo(this.listQuery)
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
        deleteHotnumInfo(id)
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
        deleteHotnumInfo(ids)
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
            '设备号',
            'imsi',
            'imei',
            '号码',
            '抓拍时间'
          ]
          const filterVal = ['id', 'devId', 'imsi', 'imei', 'isdn', 'captureTime']
          excel.export_json_to_excel2(
            tHeader,
            this.list,
            filterVal,
            '取号信息'
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
    }
  }
}
</script>
