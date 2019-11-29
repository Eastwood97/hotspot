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

      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
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

      <el-table-column align="center" label="目标名称" prop="targetName" />

      <el-table-column align="center" min-width="150px" label="目标外貌" prop="fileName" >
        <template slot-scope="scope">
          <img :src="picURL+scope.row.fileName.fileId1" width="80">
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="150px" label="创建时间" prop="createTime" />
      <el-table-column align="center" min-width="150px" label="更新时间" prop="updateTime" />
      <el-table-column align="center" label="操作人ID" prop="operatorId" />

      <el-table-column align="center" min-width="150px" label="描述" prop="desc" />

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="deleteNumber(scope.row)">删除</el-button>
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
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        layout="total, sizes, prev, pager, next, jumper"
        @pagination="getList"
      />
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @close="closeDialog">
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

        <el-form-item label="品牌商图片">

          <el-upload
            ref="upload"
            :limit="3"
            :http-request="uploadPic"
            :before-upload="beforeAvatarUpload"
            :on-remove="handleRemove"
            :file-list="fileList"
            :on-success="uploadSuccess"
            class="upload-demo"
            action="#"
            accept=".jpg"
            list-type="picture"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb

            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="图片1" prop="fileid1" hidden="true">
          <el-input v-model="dataForm.fileid1" />
        </el-form-item>

        <el-form-item label="图片2" prop="fileid2" hidden="true">
          <el-input v-model="dataForm.fileid2" />
        </el-form-item>

        <el-form-item label="图片3" prop="fileid3" hidden="true">
          <el-input v-model="dataForm.fileid3" />
        </el-form-item>

        <el-form-item label="描述" prop="desc">
          <el-input v-model="dataForm.desc" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCreate">取消</el-button>
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
  listTargetFace,
  createTargetFace,
  updateTargetFace,
  deleteTargetFace
} from '@/api/TargetFace'
import { createStorage, deleteStorage } from '@/api/storage'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      fileList: [],
      dialogImageUrl: '',
      dialogVisible: false,
      imageUrl: '//www.baidu.com/img/bd_logo1.png?where=super',
      multipleSelection: [],
      advanceSearchViewVisible: false,

      picURL: '192.168.43.33:9222/',
      count: 1,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        targetName: '',
        imsi: '',
        isdn: '',
        imei: '',
        id: undefined
      },
      dataForm: {
        targetName: '',
        desc: '',
        fileId1: '',
        fileId2: '',
        fileId3: '',
        picUrl: ''
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
    uploadSuccess() {
      this.$notify.success({
        title: '成功',
        message: '上传成功'
      })
      this.$refs.upload.clearFiles()
    },

    // 自定义上传照片
    uploadPic(params) {
      const file = params.file
      const form = new FormData()
      // fileType = file.type
      // isImage = fileType.indexOf("image/jpeg") != -1,
      // isLt2M = file.size / 1024 / 1024 < 2;
      // 这里常规检验，看项目需求而定
      // if (!isImage) {
      //   this.$message.error("只能上传图片格式:jpg");
      //   return;
      // }
      // if (!isLt2M) {

      //   this.$message.error("只能上传图片大小小于2M");
      //   return;
      // }
      // 根据后台需求数据格式
      // 文件对象
      form.append('file', file)
      // 本例子主要要在请求时添加特定属性，所以要用自己方法覆盖默认的action
      form.append('clientType', 'xxx')
      console.log('uploadPic')
      console.log('up : ' + this.dataForm.fileId1)
      console.log('up : ' + this.dataForm.fileId2)
      console.log('up : ' + this.dataForm.fileId3)
      // 项目封装的请求方法，下面做简单介绍
      createStorage(form)
        .then(response => {
          if (this.dataForm.fileId1 === '' || this.dataForm.fileId1 === undefined) {
            this.dataForm.fileId1 = response.data.data
            this.count++
          } else if (this.dataForm.fileId2 === '' || this.dataForm.fileId2 === undefined) {
            this.dataForm.fileId2 = response.data.data
            this.count++
          } else if (this.dataForm.fileId3 === '' || this.dataForm.fileId3 === undefined) {
            this.dataForm.fileId3 = response.data.data
            this.count++
          } else {
            this.$notify.error({
              title: '失败',
              message: '最多上传三张图片'
            })
            // this.$refs.upload.clearFiles()
            return
          }
          // this.$refs.upload.clearFiles()
          this.$notify.success({
            title: '成功',
            message: '上传成功'
          })
        })
        .catch(() => {
          this.$notify.error({
            title: '失败',
            message: '上传失败'
          })
        })
    },

    // 执行分页查询
    getList() {
      this.listLoading = true
      console.log('targetName:' + this.listQuery.targetName)
      listTargetFace(this.listQuery)
        .then(response => {
          console.log(response.data)

          var data = JSON.stringify(response.data.data)
          alert(data)
          this.list = response.data.data

          this.total = response.data.data.size
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
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
        desc: '',
        fileId1: '',
        fileId2: '',
        fileId3: '',
        picUrl: ''
      }
    },
    // 取消添加
    cancelCreate() {
      this.resetForm()
      this.dialogFormVisible = false
      this.$refs.upload.clearFiles()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 确定添加
    handleCreate() {
      this.resetForm()
      this.count = 1
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // 添加
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createTargetFace(this.dataForm)
            .then(response => {
              // this.list.unshift(response.data.data);

              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
              this.dialogFormVisible = false
              this.$refs.upload.clearFiles()
            })
            .catch(response => {
              this.$refs.upload.clearFiles()
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleUpdate(row) {
      console.log(row)
      const fileNames = row.fileName
      const obj = JSON.parse(fileNames)
      console.log(obj)
      this.dataForm = Object.assign({}, row)
      this.dataForm.fileId1 = ''
      this.dataForm.fileId2 = ''
      this.dataForm.fileId3 = ''
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      if (obj.fileId1 !== '' && obj.fileId1 !== undefined) {
        const url = 'http://192.168.95.101:9333/' + obj.fileId1
        this.dataForm.fileId1 = obj.fileId1
        this.count++
        const k = {}
        k.url = url
        this.fileList.push(k)
        console.log('-------' + obj.fileId1)
      }
      if (obj.fileId2 !== '' && obj.fileId2 !== undefined) {
        const url = 'http://192.168.95.101:9333/' + obj.fileId2
        this.dataForm.fileId2 = obj.fileId2
        this.count++
        var k1 = {
          url: ''
        }
        k1.url = url
        this.fileList.push(k1)
        console.log(obj.fileId2)
      }
      if (obj.fileId3 !== '' && obj.fileId3 !== undefined) {
        const url = 'http://192.168.95.101:9333/' + obj.fileId3
        this.dataForm.fileId3 = obj.fileId3
        this.count++
        const k = {}
        k.url = url
        this.fileList.push(k)
      }
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateTargetFace(this.dataForm)
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
              this.getList()
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
              this.getList()
            })
        }
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
      deleteTargetFace(targetIds).then(resp => {
        _this.tableLoading = false
        if (resp && resp.status === 200) {
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
    },
    // 上传图片前校验
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
        this.count++
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
        this.count++
      }

      return isJPG && isLt2M
    },
    // 删除图片
    handleRemove(file, i) {
      console.log('------' + file)
      this.count--
      console.log('++++++' + i)
      if (this.count === 3) {
        deleteStorage(this.dataForm.fileId3)
          .then(response => {
            this.dataForm.fileId3 = ''
          })
          .catch(() => {
            alert('删除失败' + this.dataForm.fileId3)

            this.dataForm.fileId3 = ''
          })
      }
      if (this.count === 2) {
        deleteStorage(this.dataForm.fileId2)
          .then(response => {
            this.dataForm.fileId2 = ''
          })
          .catch(() => {
            alert('删除失败' + this.dataForm.fileId2)
            this.dataForm.fileId2 = ''
          })
      }

      if (this.count === 1) {
        deleteStorage(this.dataForm.fileId1)
          .then(response => {
            this.dataForm.fileId1 = ''
          })
          .catch(() => {
            alert('删除失败' + this.dataForm.fileId1)
            this.dataForm.fileId1 = ''
          })
      }
      console.log(file)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    closeDialog() {
      console.log('sssss')
      this.$refs.upload.clearFiles()
      this.fileList = []
      this.count = 0
    }
    // handleDownload(file) {
    //   console.log(file)
    // }
  }
}
</script>
