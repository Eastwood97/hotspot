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
        IMSI:
        <el-input
          v-model="listQuery.imsi"
          style="width: 170px"
          size="mini"
          placeholder="请输入IMSI"
        />
        IMEI:
        <el-input
          v-model="listQuery.imei"
          style="width: 170px"
          size="mini"
          placeholder="请输入IMEI"
        />
        抓拍时间:
        <el-date-picker
          v-model="captureTime"
          :picker-options="pickerOptions"
          value-format="yyyy-MM-dd HH:mm:ss"
          size="mini"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="chooseTimeRange"
        />
        <el-button size="mini" @click="cancelSearch">取消</el-button>
        <el-button
          icon="el-icon-search"
          type="primary"
          size="mini"
          @click="handleFilter"
        >搜索
        </el-button>
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
      <el-table-column type="index" :index="indexMethod" label="id" min-width="50"></el-table-column>
      <el-table-column align="center" label="姓名" min-width="110px" prop="target_name"/>
      <el-table-column align="center" label="imsi" min-width="110px" prop="imsi"/>
      <el-table-column align="center" label="imei" min-width="110px" prop="imei"/>
      <el-table-column align="center" label="备注" min-width="110px" prop="attribution"/>
      <el-table-column align="center" label="抓拍时间" width="110px" prop="capture_time"/>
      <el-table-column align="center" label="操作" width="110px" class-name="small-padding fixed-width">
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
        v-if="list.length>0"
        :disabled="multipleSelection.length==0"
        size="small"
        type="danger"
        @click="deleteMany">批量删除
      </el-button>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.row"
        style="text-align:right;margin-top: -30px"
        layout="total, sizes, prev, pager, next, jumper"
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
          shortcuts: [
            {
              text: "最近一周",
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                picker.$emit("pick", [start, end])
              }
            },
            {
              text: "最近一个月",
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                picker.$emit("pick", [start, end])
              }
            },
            {
              text: "最近三个月",
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                picker.$emit("pick", [start, end])
              }
            }
          ]
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
        captureTime: null,
        listLoading: true,
        listQuery: {
          imsi: '',
          imei: '',
          isdn: '',
          page: 1,
          row: 7,
          startTime: '',
          endTime: ''
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
      chooseTimeRange(t) {
        console.log(t)
        if (t != null) {
          this.listQuery.startTime = t[0]
          this.listQuery.endTime = t[1]
        } else {
          this.listQuery.startTime = ''
          this.listQuery.endTime = ''
        }
      },
      getList() {
        this.listLoading = true
        listTargetInfo(this.listQuery)
          .then(response => {
            this.list = response.data.data.rows
            this.total = response.data.data.total
            console.log(this.list)
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
      indexMethod(index) {
        return (this.listQuery.page - 1) * this.listQuery.row + index + 1;
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
      // 清空查询条件
      emptyListQuery() {
        this.captureTime = null,
          this.listQuery = {
            page: 1,
            row: 20
          }
      },
      // 取消搜索
      cancelSearch() {
        this.advanceSearchViewVisible = false
        this.emptyListQuery()
        this.beginDateScope = ""
        this.getList()
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
        console.log(this.multipleSelection)
      },
      format(time, format) {
        var t = new Date(time)
        var tf = function(i) {
          return (i < 10 ? '0' : '') + i
        }
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
      }
    }
  }
</script>
