<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.devNum"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入设备编号"
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
          设备名称:
          <el-input
            v-model="listQuery.devName"
            style="width: 130px"
            size="mini"
            placeholder="请输入设备名称"
          />
        </el-col>
        <el-col :span="5">
          设备类型:
          <el-input
            v-model="listQuery.devType"
            style="width: 130px"
            size="mini"
            placeholder="请输入设备类型"
          />
        </el-col>

        <el-col :span="5">
          设备编号:
          <el-input
            v-model="listQuery.devNum"
            style="width: 130px"
            size="mini"
            placeholder="请输入编号"
          />
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
      <el-table-column type="selection" width="55" />

      <el-table-column align="center" label="设备id" prop="devId" />

      <el-table-column align="center" label="设备名称" prop="devName" />

      <el-table-column align="center" label="类型" prop="devType" />

      <el-table-column align="center" label="编号" prop="devNum" />

      <el-table-column align="center" label="位置" prop="place" />

      <el-table-column align="center" label="状态" prop="status" />

      <el-table-column align="center" label="描述" prop="description" />

      <el-table-column align="center" min-width="150px" label="创建时间" prop="createTime" />

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/device/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/device/delete']"
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
        <el-form-item label="设备名称" prop="devName">
          <el-input v-model.trim="dataForm.devName" />
        </el-form-item>
        <el-form-item label="设备编号" prop="devNum">
          <el-input v-model.trim="dataForm.devNum" />
        </el-form-item>

        <el-form-item label="设备类型" prop="devType">
          <el-select v-model="dataForm.devType" placeholder="请选设备类型">
            <el-option label="摄像头" value="1" />
            <el-option label="热点" value="2" />
            <el-option label="超脑" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="dataForm.devType==3" label="注册超脑">
          <el-switch v-model="dataForm.isRegister" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="ip地址" prop="ipAddr">
          <el-input v-model.trim="dataForm.ipAddr" />
        </el-form-item>

        <el-form-item label="端口号" prop="port">
          <el-input v-model.trim="dataForm.port" />
        </el-form-item>

        <el-form-item label="区域" prop="region">
          <template>
            <el-select v-model="value" filterable placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

        </el-form-item>

        <!-- <el-form-item label="分组" prop="groupId">
          <el-input v-model.trim="dataForm.groupId" />
        </el-form-item>

        <el-form-item label="ipv6地址" prop="ipv6Addr">
          <el-input v-model.trim="dataForm.ipv6Addr" />
        </el-form-item>-->

        <el-form-item label="描述" prop="description">
          <el-input v-model.trim="dataForm.description" />
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
  listDevice,
  createDevice,
  updateDevice,
  deleteDevice
} from "@/api/device";
import { uploadPath } from "@/api/storage";
import { getToken } from "@/utils/auth";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  data() {
    return {

      options: [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }],

      multipleSelection: [],
      advanceSearchViewVisible: false,

      list: [],
      total: 0,
      listLoading: "true",
      listQuery: {
        page: 1,
        limit: 20,
        devNum: "",
        devType: "",
        devName: ""
      },
      dataForm: {
        devNum: "",
        devName: "",
        devType: "",
        ipAddr: "",
        ipv6Addr: "",
        port: "",
        description: "",
        port: "",
        isRegister: "",
        groupId: undefined,
        region: ""
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "创建"
      },
      rules: {
        devNum: [
          { required: true, message: "设备编号不能为空", trigger: "blur" }
        ],
        devName: [
          { required: true, message: "设备名称不能为空", trigger: "blur" }
        ],
        devType: [
          {
            required: true,
            message: "请至少选择一个设备类型",
            trigger: "change"
          }
        ],
        ipAddr: [
          { required: true, message: "ip地址不能为空", trigger: "blur" },
          {
            required: true,
            pattern: /(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/,
            message: "请输入正确的ip地址",
            trigger: "blur"
          }
        ],
        port: [
          { required: true, message: "端口号不能为空", trigger: "blur" },
          {
            required: true,
            pattern: /^[0-9]\d*$/,
            message: "请输入正确的端口号",
            trigger: "blur"
          }
        ],
        ipv6Addr: [
          {
            pattern: /(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/,
            message: "请输入正确的ip地址",
            trigger: "blur"
          }
        ],
        groupId: [
          {
            pattern: /^[0-9]\d*$/,
            message: "请输入数字",
            trigger: "blur"
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
      listDevice(this.listQuery)
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
        limit: 20,
        devNum: "",
        devType: "",
        devName: ""
      };
    },

    // 清空表单
    resetForm() {
      this.dataForm = {
        devNum: "",
        devName: "",
        devType: "",
        ipAddr: "",
        ipv6Addr: "",
        port: "",
        description: "",
        groupId: undefined
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

    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          // 加载中
          this.dialogFormVisible = false;
          const loading = this.$loading({
            lock: true,
            text: "注册超脑中",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)"
          });
          setTimeout(() => {
            loading.close();
          }, 5000);

          createDevice(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data);
              this.$notify.success({
                title: "成功",
                message: "创建成功"
              });
            })
            .catch(response => {
              this.$notify.error({
                title: "失败",
                message: response.data.errmsg
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
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          // 加载中
          this.dialogFormVisible = false;
          const loading = this.$loading({
            lock: true,
            text: "注册超脑中",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)"
          });
          setTimeout(() => {
            loading.close();
          }, 4000);

          updateDevice(this.dataForm)
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
    // handleDelete(row) {
    //   deleteDevice(row)
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
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then(excel => {
        const tHeader = [
          "设备ID",
          "设备名称",
          "分组",
          "类型",
          "编号",
          "位置",
          "状态",
          "描述",
          "创建时间"
        ];
        const filterVal = [
          "devId",
          "devName",
          "groupId",
          "devType",
          "devNum",
          "place",
          "status",
          "description",
          "createTime"
        ];
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          "设备管理信息"
        );
        this.downloadLoading = false;
      });
    },
    // 展示高级搜索窗口
    showAdvanceSearchView() {
      this.advanceSearchViewVisible = !this.advanceSearchViewVisible;
      this.emptyListQuery();
      if (!this.advanceSearchViewVisible) {
        this.emptyListQuery();
        this.getList();
      }
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
    doDelete(devIds) {
      this.tableLoading = true;
      var _this = this;
      deleteDevice(devIds)
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
          var devIds = "";
          for (var i = 0; i < this.multipleSelection.length; i++) {
            devIds += this.multipleSelection[i].devId + ",";
            console.log(devIds);
          }
          this.doDelete(devIds);
        })
        .catch(() => {});
    },
    // 单个删除
    deleteNumber(row) {
      this.$confirm(
        "此操作将永久删除[" + row.devName + "], 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.doDelete(row.devId);
        })
        .catch(() => {});
    }
  }
};
</script>
