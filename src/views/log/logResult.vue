<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.username"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入用户名"
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
      <el-table-column type="selection" min-width="50"/>
      <el-table-column align="center" label="id" min-width="120px" prop="id"/>
      <el-table-column prop="username" label="用户名" align="center" min-width="100"/>
      <el-table-column prop="operation" label="具体操作" align="center" min-width="100"/>
      <el-table-column prop="params" label="参数" align="center" min-width="255"/>
      <el-table-column prop="ip" label="ip" align="center" min-width="80"/>
      <el-table-column prop="createdate" label="时间" align="center" min-width="130"/>
      <!--      <el-table-column align="center" label="操作" min-width="145px" class-name="small-padding fixed-width">-->
      <!--        <template slot-scope="scope">-->
      <!--          <el-button-->
      <!--            type="danger"-->
      <!--            size="mini"-->
      <!--            @click="handleDelete(scope.$index, scope.row)">删除-->
      <!--          </el-button>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
    </el-table>
    <div>
      <!--      <el-button-->
      <!--        v-if="list.length>0"-->
      <!--        :disabled="multipleSelection.length==0"-->
      <!--        size="small"-->
      <!--        type="danger"-->
      <!--        @click="deleteMany">批量删除-->
      <!--      </el-button>-->
      <pagination
        :total="total"
        :page.sync="listQuery.currentPage"
        :limit.sync="listQuery.pageSize"
        style="text-align:right;margin-top: 0px"
        layout="total, sizes, prev, pager, next, jumper"
        @pagination="getList"/>
    </div>

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
import { listLog, deleteLog } from '@/api/log'
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
      options: [{
        value: 0,
        label: '口岸'
      }, {
        value: 1,
        label: '大桥'
      }, {
        value: 2,
        label: '口岸大桥'
      }],
      value: '',
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        username: '',
        currentPage: 1,
        pageSize: 10
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
  mounted() {
    this.getList()
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    getList() {
      this.listLoading = true
      listLog(this.listQuery)
        .then(response => {
          this.list = response.data.data.rows
          console.log(response)
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
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
        deleteLog(id)
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
        deleteLog(ids)
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
    // 展示高级搜索窗口
    // 取消搜索
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
  }
}
</script>
