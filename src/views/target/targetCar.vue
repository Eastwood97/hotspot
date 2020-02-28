<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.plateNumber"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入目标车牌"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <!-- <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="exportTarget"
      >导出</el-button>
      <el-button
        @click="dialogFormVisible2=true"
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-upload，"
      >导入</el-button>-->
    </div>

   
 

    <!-- 查询结果 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="正在查询中。。。"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />

      <el-table-column align="center" label="目标ID" prop="targetId" />

      <el-table-column align="center" label="目标车牌" prop="plateNumber" />
 
      <el-table-column align="center" min-width="180px" label="描述" prop="desc" />
      <el-table-column align="center" min-width="160px" label="更新时间" prop="updateTime" />
      <el-table-column align="center" label="操作人ID" prop="operatorId" />

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/targetCar/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/targetCar/delete']"
            type="danger"
            size="mini"
            @click="deleteNumber(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 批量删除-->

    <div style="display: flex;justify-content: space-between;margin: 2px">
      <el-button
        v-if="list.length>0"
        :disabled="multipleSelection.length==0"
        type="danger"
        size="mini"
        @click="deleteManyNumbers"
      >批量删除</el-button>

      <el-pagination
        v-show="total>0"
        :total="total"
        :page-sizes="[5, 10, 20, 100]"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="currentChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="目标车牌" prop="plateNumber">
          <el-input v-model.trim="dataForm.plateNumber" />
        </el-form-item>

        <el-form-item label="描述" prop="desc">
          <el-input v-model.trim="dataForm.desc" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
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
import {
  listTargetCar,
  createTargetCar,
  updateTargetCar,
  deleteTargetCar,
  listAll
} from '@/api/targetCar'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  data() {
    return {
      peopleid: '',
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      // 文件上传完展示
      dialogFormVisible2: false,
      files: [], // 要上传的文件对象
      multipleSelection: [],
      file: [],
      advanceSearchViewVisible: false,

      all: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        plateNumber: '',
        id: undefined
      },
      dataForm: {
        plateNumber: '',
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
        plateNumber: [
          { required: true, message: '目标车牌不能为空', trigger: 'blur' }
        ],
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
      listTargetCar(this.listQuery)
        .then(response => {
          this.list = response.data.data.list
          console.log(response.data.data.list)
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    },

    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },

    currentChange(page) {
      this.listQuery.page = page
      this.getList()
    },

    // 分页查询
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    // 清空查询条件
    emptyListQuery() {
      this.listQuery = {
        page: 1,
        limit: 10,
        plateNumber: '',
        id: undefined
      }
    },

    // 清空表单
    resetForm() {
      this.dataForm = {
        plateNumber: '',
        targetId: undefined,
        desc: '',
        operatorId: ''
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createTargetCar(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: "创建失败"
              })
            })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateTargetCar(this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.dataForm)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '更新成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    exportTarget() {
      listAll()
        .then(response => {
          this.all = response.data.data.list
        })
        .then(() => {
          handleDownload()
        })
        .catch(() => {
          alert('导出失败')
        })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '目标ID',
          '目标名称',
          'imsi',
          'imei',
          '号码',
          '案件名',
          '创建时间',
          '更新时间',
          '操作人id',
          '描述'
        ]
        const filterVal = [
          'targetId',
          'targetName',
          'imsi',
          'imei',
          'isdn',
          'caseName',
          'createTime',
          'updateTime',
          'operatorId',
          'desc'
        ]
        excel.export_json_to_excel2(
          tHeader,
          this.all,
          filterVal,
          '布控号码信息'
        )
        this.downloadLoading = false
      })
    },



    // 监听选项变化
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 执行删除
    doDelete(targetIds) {
      this.tableLoading = true
      var _this = this
      deleteTargetCar(targetIds)
        .then(resp => {
          _this.tableLoading = false
          if (resp && resp.status == 200) {
            this.$notify.success({
              title: '成功',
              message: '删除成功'
            })
            _this.getList()
          }
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    // 批量删除
    deleteManyNumbers() {
      this.$confirm(
        '此操作将删除[' + this.multipleSelection.length + ']条数据, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          var targetIds = ''
          for (var i = 0; i < this.multipleSelection.length; i++) {
            targetIds += this.multipleSelection[i].targetId + ','
            console.log(targetIds)
          }
          this.doDelete(targetIds)
        })
        .catch(() => {})
    },
    // 单个删除
    deleteNumber(row) {
      this.$confirm(
        '此操作将永久删除[' + row.plateNumber + '], 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.doDelete(row.targetId)
        })
        .catch(() => {})
    },

  }
}
</script>
