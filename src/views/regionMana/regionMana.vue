<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.regionName"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入区域名称"
      />
      <el-select
        v-model="listQuery.state"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请选择状态"
      >
        <el-option label="正常" value="1" />
        <el-option label="停用" value="0" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>

      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
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

      <el-table-column type="index" :index="indexMethod" label="id" width="50"></el-table-column>

      <el-table-column align="center" label="名称" prop="regionName" />

      <el-table-column align="center" label="状态" prop="state">
        <template slot-scope="scope">
          <span v-if="scope.row.state===0">停用</span>
          <span v-else>正常</span>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="150px" label="更新时间" prop="updateTime" />

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
        <el-form-item label="区域名称" prop="regionName">
          <el-input v-model.trim="dataForm.regionName" />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model.trim="dataForm.desc" />
        </el-form-item>

        <el-form-item label="启用">
          <el-switch v-model="dataForm.state" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createRegion">确定</el-button>
        <el-button v-else type="primary" @click="updateRegion">确定</el-button>
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
  listSubRegion,
  createRegion,
  updateRegion,
  deleteRegion,
  getRegionNameCount
} from "@/api/region";
import { uploadPath } from "@/api/storage";
import { getToken } from "@/utils/auth";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  data() {
        //区域名校验
    let regionNameValidate = (rule, value, callback) => {
      //查询区域名是否重复
      let regionName=value.trim();
      console.log(regionName)
      getRegionNameCount(regionName).then(res => {
        console.log(res);
        if (res.data.data <= 0) {
          callback();
        } else if (res.data.data > 0) {
          callback("区域名称已经存在");
        } else {
          this.$notify.error({
            title: "失败",
            message: "区域名称查询重复失败！",
            duration: 2000
          });
        }
      }).catch((e) => {});
    };
    return {
      multipleSelection: [],

      list: [],
      total: 0,
      listLoading: "true",
      listQuery: {
        page: 1,
        limit: 10,
        regionName: "",
        status: undefined
      },
      dataForm: {
        regionName: "",
        status: undefined,
        des: ""
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "创建"
      },
      rules: {
        regionName: [
          { required: true, message: "区域名称不能为空", trigger: "blur" },
          {
            validator: regionNameValidate,
            required: true
          }
        ]
      },
      downloadLoading: false
    };

  },
  computed: {
    headers() {
      return {
        "X-Litemall-Admin-Token": getToken()
      };
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      listSubRegion(this.listQuery)
        .then(response => {
          this.list = response.data.data.list;
          this.total = response.data.data.total;
          this.listLoading = false;
        })
        .catch(() => {
          this.list = [];
          this.total = 0;
          this.listLoading = false;
        });
    },
    // 分页查询
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },

    // 清空查询条件
    emptyListQuery() {
      this.listQuery = {
        page: 1,
        limit: 10,
        regionName: "",
        status: undefined
      };
    },

    // 清空表单
    resetForm() {
      this.dataForm = {
        regionName: "",
        status: undefined,
        des: ""
      };
    },
    handleCreate() {
      this.resetForm();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createRegion() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          createRegion(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data);
              this.dialogFormVisible = false;
              this.$notify.success({
                title: "成功",
                message: "创建成功"
              });
            })
            .catch(response => {
              this.$notify.error({
                title: "失败",
                message: "添加失败"
              });
            });
        }
      });
    },

    handleUpdate(row) {
      this.dataForm = Object.assign({}, row);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateRegion() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          // 加载中
          this.dialogFormVisible = false;

          updateRegion(this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v);
                  this.list.splice(index, 1, this.dataForm);
                  break;
                }
              }
              this.dialogFormVisible = false;
              this.$notify.success({
                title: "成功",
                message: "更新成功"
              });
            })
            .catch(response => {
              this.dialogFormVisible = false;
              this.$notify.error({
                title: "失败",
                message: response.data.errmsg
              });
            });
        }
      });
    },

    // 取消搜索
    cancelSearch() {
      this.advanceSearchViewVisible = false;
      this.emptyListQuery();
      this.beginDateScope = "";
      this.getList();
    },
    // 监听选项变化
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    // 执行删除
    doDelete(ids) {
      this.tableLoading = true;
      var _this = this;
      deleteRegion(ids)
        .then(resp => {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            this.$notify.success({
              title: "成功",
              message: "删除成功"
            });
            _this.getList();
          }
        })
        .catch(response => {
          this.$notify.error({
            title: "失败",
            message: response.data.errmsg
          });
        });
    },
    // 批量删除
    deleteManyNumbers() {
      this.$confirm(
        "此操作将删除[" + this.multipleSelection.length + "]条数据, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          var ids = "";
          for (var i = 0; i < this.multipleSelection.length; i++) {
            ids += this.multipleSelection[i].id + ",";
            console.log(ids);
          }
          this.doDelete(ids);
        })
        .catch(() => {});
    },
    // 单个删除
    deleteNumber(row) {
      this.$confirm(
        "此操作将永久删除[" + row.regionName + "], 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.doDelete(row.id);
        })
        .catch(() => {});
    },

    indexMethod(index) {
      return (this.listQuery.page - 1) * this.listQuery.limit + index + 1;
    }
  }
};
</script>
