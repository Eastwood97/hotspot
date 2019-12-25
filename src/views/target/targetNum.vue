<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.targetName"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入目标名称"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="showAdvanceSearchView"
      >高级搜索</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>

    </div>

    <!--高级搜索框-->
    <div
      v-show="advanceSearchViewVisible"
      style="margin-bottom: 10px;border: 1px;border-radius: 5px;border-style: solid;padding: 5px 0px 5px 0px;box-sizing:border-box;border-color: #20a0ff"
    >
      <el-row>
        <el-col :span="5">
          IMSI:
          <el-input
            v-model="listQuery.imsi"
            style="width: 130px"
            size="mini"
            placeholder="请输入IMSI"
          />
        </el-col>
        <el-col :span="5">
          IMEI:
          <el-input
            v-model="listQuery.imei"
            style="width: 130px"
            size="mini"
            placeholder="请输入IMEI"
          />
        </el-col>

        <el-col :span="5">
          电话号码:
          <el-input v-model="listQuery.isdn" style="width: 130px" size="mini" placeholder="请输入名称" />
        </el-col>

        <el-col :span="4" :offset="0">
          <el-button size="mini" @click="cancelSearch">取消</el-button>
          <el-button icon="el-icon-search" type="primary" size="mini" @click="handleFilter">搜索</el-button>
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"/>

      <el-table-column align="center" label="目标ID" prop="targetId" />

      <el-table-column align="center" label="目标名称" prop="targetName" />

      <el-table-column align="center" label="imsi" prop="imsi" />

      <el-table-column align="center" label="imei" prop="imei" />

      <el-table-column align="center" label="号码" prop="isdn" />

      <el-table-column align="center" min-width="150px" label="创建时间" prop="createTime" />
      <el-table-column align="center" min-width="150px" label="更新时间" prop="updateTime" />
      <el-table-column align="center" label="操作人ID" prop="operatorId" />

      <el-table-column align="center" min-width="180px" label="描述" prop="desc" />

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/targetNum/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/targetNum/delete']"
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
        <el-form-item label="目标名称" prop="targetName">
          <el-input v-model="dataForm.targetName" />
        </el-form-item>
        <el-form-item label="imsi" prop="imsi">
          <el-input v-model="dataForm.imsi" />
        </el-form-item>

        <el-form-item label="imei" prop="imei">
          <el-input v-model="dataForm.imei" />
        </el-form-item>

        <el-form-item label="电话号码" prop="isdn">
          <el-input v-model="dataForm.isdn" />
        </el-form-item>

        <el-form-item label="描述" prop="desc">
          <el-input v-model="dataForm.desc" />
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
  listTargetNum,
  createTargetNum,
  updateTargetNum,
  deleteTargetNum
} from '@/api/targetNum'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {

  data() {
    return {

      multipleSelection: [],
      advanceSearchViewVisible: false,

      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 5,
        targetName: '',
        imsi: '',
        isdn: '',
        imei: '',
        id: undefined
      },
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
        targetName: [
          { required: true, message: '目标名称不能为空', trigger: 'blur' }
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
      listTargetNum(this.listQuery)
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
        limit: 20,
        targetName: '',
        imsi: '',
        isdn: '',
        imei: '',
        id: undefined
      }
    },

    // 清空表单
    resetForm() {
      this.dataForm = {
        targetName: '',
        imsi: '',
        isdn: '',
        imei: '',
        targetId: undefined,
        desc: ''
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
          createTargetNum(this.dataForm)
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
                message: response.data.errmsg
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
          updateTargetNum(this.dataForm)
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
    // handleDelete(row) {
    //   deleteTargetNum(row)
    //     .then(response => {
    //       this.$notify.success({
    //         title: "成功",
    //         message: "删除成功"
    //       });
    //       const index = this.list.indexOf(row);
    //       this.list.splice(index, 1);
    //       this.getList();
    //     })
    //     .catch(response => {
    //       this.$notify.error({
    //         title: "失败",
    //         message: response.data.errmsg
    //       });
    //     });
    // },
    // 导出
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '目标ID',
          '目标名称',
          'imsi',
          'imei',
          '号码',
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
          'createTime',
          'updateTime',
          'operatorId',
          'desc'
        ]
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          '布控号码信息'
        )
        this.downloadLoading = false
      })
    },
    // 展示高级搜索窗口
    showAdvanceSearchView() {
      this.advanceSearchViewVisible = !this.advanceSearchViewVisible
      this.emptyListQuery()
      if (!this.advanceSearchViewVisible) {
        this.emptyListQuery()
        this.getList()
      }
    },
    // 取消搜索
    cancelSearch() {
      this.advanceSearchViewVisible = false
      this.emptyListQuery()
      this.beginDateScope = ''
      this.getList()
    },
    // 监听选项变化
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 执行删除
    doDelete(targetIds) {
      this.tableLoading = true
      var _this = this
      deleteTargetNum(targetIds).then(resp => {
        _this.tableLoading = false
        if (resp && resp.status == 200) {
          var data = resp.data
          _this.$message({ type: data.status, message: data.msg })
          _this.getList()
        }
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
        '此操作将永久删除[' + row.targetName + '], 是否继续?',
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
    }

  }
}
</script>
