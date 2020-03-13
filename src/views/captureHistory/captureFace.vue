<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <div class="filter-item">
        <el-date-picker
          v-model="timeZone"
          :picker-options="pickerOptions"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right"
          @change="chooseTimeRange"
        />
      </div>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>

      <!-- <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>-->
    </div>

    <!-- 查询结果 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="正在查询中。。。"
      border
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />

      <el-table-column type="index" :index="indexMethod" label="id" width="50"></el-table-column>
      <el-table-column align="center" min-width="150px" label="场景图" prop="sceneStorageUrl">
        <template slot-scope="scope">
          <img
            v-if="scope.row.sceneStorageUrl"
            :src="picURL+scope.row.sceneStorageUrl"
            width="80"
            preview="1"
            preview-text="场景图"
          />
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="150px" label="抓拍人脸" prop="captureFaceStorageUrl">
        <template slot-scope="scope">
          <img
            v-if="scope.row.captureFaceStorageUrl"
            :src="picURL+scope.row.captureFaceStorageUrl"
            width="80"
            preview="1"
<<<<<<< Updated upstream
            preview-text="抓拍人脸"
          />
=======
            preview-text="抓拍人脸">
>>>>>>> Stashed changes
        </template>
      </el-table-column>

      <el-table-column align="center" label="设备id" prop="devId" />

      <el-table-column align="center" label="属性" prop="quality">
        <template slot-scope="scope">
          <span v-if="scope.row.quality===0">普通</span>
          <span v-else>目标</span>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="150px" label="抓拍时间" prop="captureTime" />
      <el-table-column
      

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
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
        :page-sizes="[5, 10, 20, 100]"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="currentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style>
img {
  width: 50px;
  height: 50px;
}
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

.el-table td, .el-table th.is-leaf,.el-table--border, .el-table--group{
  border-color: #304156; 
}
.el-table--border::after, .el-table--group::after, .el-table::before{
  background-color: #304156;
}

</style>

<script>
import { listResult, deleteResult, doDownload } from "@/api/cameraCatInfo";
import { getToken } from "@/utils/auth";
// import Pagination from '@/components/Pagination'

export default {
  data() {
    return {
      haveTarget: false,
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },

      isDownLoad: "1",
      dialogImageUrl: "",
      multipleSelection: [],
      advanceSearchViewVisible: false,

      picURL: 'http://192.168.70.18:9222/',
      count: 1,
      list: [],
      total: 0,
      timeZone: "",
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        startTime: "",
        endTime: " ",
        id: undefined
      },
      downloadLoading: false,
      downloadParams: {
        captureTime: "",
        devIP:""
      },
      deleteParams:{
        ids:"",
        fileIds:"",
      }
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
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },

    currentChange(page) {
      this.listQuery.page = page;
      this.getList();
    },

    // 监听时间变化
    chooseTimeRange(t) {
      this.listQuery.startTime = t[0];
      this.listQuery.endTime = t[1];
    },

    // 执行分页查询
    getList() {
      this.listLoading = true;
      listResult(this.listQuery)
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
        timeZone: "",
        id: undefined
      };
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
    doDelete(deleteParams) {
      this.tableLoading = true;
      var _this = this;
      deleteResult(deleteParams).then(resp => {
        _this.tableLoading = false;
        alert(fileIds)
        if (resp && resp.status === 200) {
          _this.$message({
            msg: "删除成功",
            type: "sucess"
          });
          _this.getList();
        }else{
          alert("2222222222")
        }
      }).catch(()=>{
         _this.$message({
            msg: "删除失败",
            type: "error"
          });
          _this.getList();
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
          var ids = '';
          var fileIds='';
          for (var i = 0; i < this.multipleSelection.length; i++) {
            ids += this.multipleSelection[i].id + ','
            fileIds+=this.multipleSelection[i].sceneStorageUrl + '-'+this.multipleSelection[i].captureFaceStorageUrl+"-"
          }
          this.doDelete(ids,fileIds);
        })
        .catch(() => {})
    },
    // 单个删除
    deleteNumber(row) {
      this.$confirm(
        '此操作将永久删除数据与文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then((confirm) => {
          this.deleteParams.ids=row.id
          this.deleteParams.fileIds=row.sceneStorageUrl+"-"+row.captureFaceStorageUrl
          this.doDelete(this.deleteParams);
          
        })
        .catch(() => {})
    },

  

    indexMethod(index) {
      return (this.listQuery.page - 1) * this.listQuery.limit + index + 1;
    },

    // doDownLoadVedio(captureTime) {},
    // 导出
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then(excel => {
        const tHeader = [
          "目标ID",
          "目标名称",
          "imsi",
          "imei",
          "号码",
          "创建时间",
          "更新时间",
          "操作人id",
          "描述"
        ];
        const filterVal = [
          "targetId",
          "targetName",
          "imsi",
          "imei",
          "isdn",
          "createTime",
          "updateTime",
          "operatorId",
          "desc"
        ];
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          "布控号码信息"
        );
        this.downloadLoading = false;
      });
    }
  }
};
</script>
