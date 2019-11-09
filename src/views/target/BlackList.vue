<template>
  <div>
    <el-container>
      <el-header
        style="padding: 0px;display:flex;justify-content:space-between;align-items: center;background-color:white"
      >
        <div style="display: inline">
          <el-input
            :disabled="advanceSearchViewVisible"
            v-model="target.isdn"
            placeholder="输入电话号码查询"
            clearable
            style="width: 300px;margin: 0px;padding: 0px;"
            size="mini"
            prefix-icon="el-icon-search"
            @change="keywordsChange"
            @keyup.enter.native="searchtarget"
          />

          <el-button
            type="primary"
            size="mini"
            style="margin-left: 5px"
            icon="el-icon-search"
            @click="searchtarget"
          >搜索</el-button>

          <el-button
            slot="reference"
            type="primary"
            size="mini"
            style="margin-left: 5px"
            @click="showAdvanceSearchView"
          >
            <i
              :class="[advanceSearchViewVisible ? faangledoubleup:faangledoubledown]"
              class="fa fa-lg"
              style="margin-right: 5px"
            />高级搜索
          </el-button>

          <el-button type="success" size="mini" @click="exportTargets">
            <i class="fa fa-lg fa-level-down" style="margin-right: 5px"/>导出数据
          </el-button>
        </div>
        <el-button
          type="primary"
          size="mini"
          style="margin-left: 5px;margin-right: 20px"
          icon="el-icon-plus"
          @click="showAddView"
        >添加布控目标</el-button>
      </el-header>
      <el-main style="padding-left: 0px;padding-top: 0px">
        <div>
          <transition name="slide-fade">
            <div
              v-show="advanceSearchViewVisible"
              style="margin-bottom: 10px;border: 1px;border-radius: 5px;border-style: solid;padding: 5px 0px 5px 0px;box-sizing:border-box;border-color: #20a0ff"
            >
              <el-row>
                <el-col :span="5">
                  IMSI:
                  <el-input
                    v-model="target.imsi"
                    style="width: 130px"
                    size="mini"
                    placeholder="请输入IMSI"
                  />
                </el-col>
                <el-col :span="5">
                  IMEI:
                  <el-input
                    v-model="target.imei"
                    style="width: 130px"
                    size="mini"
                    placeholder="请输入IMEI"
                  />
                </el-col>

                <el-col :span="5">
                  目标名称:
                  <el-input
                    v-model="target.name"
                    style="width: 130px"
                    size="mini"
                    placeholder="请输入名称"
                  />
                </el-col>
                <el-col :span="5">
                  案件名:
                  <el-input
                    v-model="target.caseName"
                    style="width: 130px"
                    size="mini"
                    placeholder="请输入案件名"
                  />
                </el-col>

                <el-col :span="4" :offset="0">
                  <el-button size="mini" @click="cancelSearch">取消</el-button>
                  <el-button
                    icon="el-icon-search"
                    type="primary"
                    size="mini"
                    @click="searchtarget"
                  >搜索</el-button>
                </el-col>
              </el-row>
            </div>
          </transition>
          <el-table
            v-loading="tableLoading"
            :data="targets"
            border
            stripe
            size="mini"
            style="width: 100%"
            max-height="700"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" align="left" width="30"/>
            <el-table-column prop="id" align="left" fixed label="ID" width="105"/>
            <el-table-column prop="imsi" width="150" align="left" label="IMSI"/>
            <el-table-column prop="imei" label="IMEI" width="150"/>

            <el-table-column prop="isdn" label="ISDN" width="150"/>

            <el-table-column prop="name" width="190" align="left" label="NAME"/>
            <el-table-column prop="caseName" label="案件名" width="190"/>
            <el-table-column prop="desc" label="描述" width="230"/>
            <el-table-column prop="from" label="目标来源" width="100"/>
            <el-table-column fixed="right" label="操作" width="363" align="center">
              <template slot-scope="scope">
                <el-button
                  style="padding: 3px 4px 3px 4px;margin: 2px"
                  size="mini"
                  @click="showEditView(scope.row)"
                >编辑</el-button>

                <el-button
                  type="danger"
                  style="padding: 3px 4px 3px 4px;margin: 2px"
                  size="mini"
                  @click="deleteList(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex;justify-content: space-between;margin: 2px">
            <el-button
              v-if="targets.length>0"
              :disabled="multipleSelection.length==0"
              type="danger"
              size="mini"
              @click="deleteManyLists"
            >批量删除</el-button>
            <el-pagination
              :page-size="10"
              :current-page="currentPage"
              :total="totalCount"
              background
              layout="prev, pager, next"
              @current-change="currentChange"
            />
          </div>
        </div>
      </el-main>
    </el-container>
    <el-form ref="paper" :model="target" :rules="rules" style="margin: 0px;padding: 0px;">
      <div style="text-align: left">
        <el-dialog
          :show-close="false"
          :title="dialogTitle"
          :close-on-click-modal="false"
          :visible.sync="dialogVisible"
          style="padding: 0px;"
          width="77%"
        >
          <el-row>
            <el-col :span="6">
              <div>
                <el-form-item label="IMSI:" prop="imsi">
                  <el-input
                    v-model="target.imsi"
                    prefix-icon="el-icon-edit"
                    size="mini"
                    style="width: 150px"
                    placeholder="请输入IMSI"
                  />
                </el-form-item>
              </div>
            </el-col>

            <el-col :span="6">
              <div>
                <el-form-item label="IMEI:" prop="imei">
                  <el-input
                    v-model="target.imei"
                    prefix-icon="el-icon-edit"
                    size="mini"
                    style="width: 150px"
                    placeholder="请输入IMEI"
                  />
                </el-form-item>
              </div>
            </el-col>

            <el-col :span="6">
              <div>
                <el-form-item label="电话号码:" prop="isdn">
                  <el-input
                    v-model="target.isdn"
                    prefix-icon="el-icon-message"
                    size="mini"
                    style="width: 150px"
                    placeholder="电话号码..."
                  />
                </el-form-item>
              </div>
            </el-col>

          </el-row>

          <el-row>

            <el-col :span="6">
              <div>
                <el-form-item label="名称:" prop="name">
                  <el-input
                    v-model="target.name"
                    prefix-icon="el-icon-message"
                    size="mini"
                    style="width: 150px"
                    placeholder="目标名称..."
                  />
                </el-form-item>
              </div>
            </el-col>

            <el-col :span="6">
              <div>
                <el-form-item label="案件名称:" prop="caseName">
                  <el-input
                    v-model="target.caseName"
                    prefix-icon="el-icon-message"
                    size="mini"
                    style="width: 150px"
                    placeholder="案件名称"
                  />
                </el-form-item>
              </div>
            </el-col>

            <el-col :span="6">
              <div>
                <el-form-item label="描述:" prop="desc">
                  <el-input
                    v-model="target.desc"
                    prefix-icon="el-icon-message"
                    size="mini"
                    style="width: 150px"
                    placeholder="描述"
                  />
                </el-form-item>
              </div>
            </el-col>
          </el-row>

          <span slot="footer" class="dialog-footer">
            <el-button size="mini" @click="cancelEidt">取 消</el-button>
            <el-button size="mini" type="primary" @click="addTarget('addTargetForm')">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      targets: [],
      faangledoubleup: 'fa-angle-double-up',
      faangledoubledown: 'fa-angle-double-down',
      dialogTitle: '',
      multipleSelection: [],
      depTextColor: '#c0c4cc',
      nations: [],
      politics: [],
      positions: [],
      joblevels: [],
      totalCount: -1,
      currentPage: 1,

      dialogVisible: false,
      tableLoading: false,
      advanceSearchViewVisible: false,
      showOrHidePop: false,
      target: {
        imsi: '',
        imei: '',
        isdn: '',
        name: '',
        from: 'pc',
        caseName: '',
        desc: ''
      },
      rules: {
        isdn: [
          {
            pattern: /^[1]([3-9])[0-9]{9}$/,
            message: '号码格式不正确',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted: function() {
    this.loadtargets()
  },

  methods: {
    cancelSearch() {
      this.advanceSearchViewVisible = false
      this.emptyListData()
      this.beginDateScope = ''
      this.loadtargets()
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    deleteManyLists() {
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
          var ids = ''
          for (var i = 0; i < this.multipleSelection.length; i++) {
            ids += this.multipleSelection[i].id + ','
          }
          this.doDelete(ids)
        })
        .catch(() => {})
    },
    deleteList(row) {
      this.$confirm('此操作将永久删除[' + row.name + '], 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.doDelete(row.id)
        })
        .catch(() => {})
    },
    doDelete(ids) {
      this.tableLoading = true
      var _this = this
      this.deleteRequest('/basicdata/target/' + ids).then(resp => {
        _this.tableLoading = false
        if (resp && resp.status == 200) {
          var data = resp.data
          _this.$message({ type: data.status, message: data.msg })
          _this.loadtargets()
        }
      })
    },
    keywordsChange(val) {
      if (val == '') {
        this.loadtargets()
      }
    },
    searchtarget() {
      this.loadtargets()
    },
    currentChange(currentChange) {
      this.currentPage = currentChange
      this.loadtargets()
    },
    loadtargets() {
      var _this = this
      this.tableLoading = true
      this.getRequest(
        '/basicdata/target?page=' +
          this.currentPage +
          '&size=10&isdn=' +
          this.target.isdn +
          '&name=' +
          this.target.name +
          '&imsi=' +
          this.target.imsi +
          '&imei=' +
          this.target.imei +
          '&caseName=' +
          this.target.caseName
      ).then(resp => {
        this.tableLoading = false
        if (resp && resp.status == 200) {
          var data = resp.data
          _this.targets = data.targets
          _this.totalCount = data.count
          //            _this.emptyListData();
        }
      })
    },
    addTarget(formName) {
      var _this = this
      this.$refs.paper.validate(valid => {
        if (valid) {
          if (this.target.id) {
            // 更新
            this.tableLoading = true
            if (this.target.imsi == '' && this.target.imei == '' && (this.target.isdn == '')) {
              alert('IMEI,IMEI,ISDN不能都为空')
              this.tableLoading = false
              return
            }
            this.putRequest('/basicdata/target', this.target).then(resp => {
              _this.tableLoading = false
              if (resp && resp.status == 200) {
                var data = resp.data
                _this.$message({ type: data.status, message: data.msg })
                _this.dialogVisible = false
                _this.loadtargets()
                _this.emptyListData()
              }
            })
          } else {
            // 添加
            this.tableLoading = true
            if (this.target.imsi == '' && this.target.imei == '' && (this.target.isdn == '')) {
              alert('IMEI,IMEI,ISDN不能都为空')
              this.tableLoading = false
              return
            }
            this.postRequest('/basicdata/target', this.target).then(resp => {
              _this.tableLoading = false
              if (resp && resp.status == 200) {
                var data = resp.data
                _this.$message({ type: data.status, message: data.msg })
                _this.dialogVisible = false
                _this.emptyListData()
                _this.loadtargets()
              }
            })
          }
        } else {
          return false
        }
      })
    },
    cancelEidt() {
      this.$refs.paper.clearValidate()
      this.$refs.paper.resetFields()
      this.dialogVisible = false
      this.emptyListData()
    },

    // 展示高级搜索窗口
    showAdvanceSearchView() {
      this.advanceSearchViewVisible = !this.advanceSearchViewVisible
      this.emptyListData()
      if (!this.advanceSearchViewVisible) {
        this.emptyListData()
        this.loadtargets()
      }
    },

    showEditView(row) {
      this.dialogTitle = '编辑黑名单'
      this.target = row
      this.target.imsi = row.imsi
      this.target.imei = row.imei
      this.target.isdn = row.isdn
      this.target.name = row.name

      this.dialogVisible = true
    },
    showAddView() {
      this.dialogTitle = '添加黑名单'
      this.dialogVisible = true
      var _this = this
      // this.getRequest("/basicdata/target").then(resp=> {
      //   if (resp && resp.status == 200) {
      //        var data = resp.data;
      //     _this.$message({type: data.status, message: data.msg});
      //   }
      // })
    },

    exportTargets() {
      window.open('/basicdata/target/exportTarget', '_parent')
    },

    emptyListData() {
      this.target = {
        imsi: '',
        imei: '',
        isdn: '',
        name: '',
        caseName: '',
        from: 'PC',
        desc: ''
      }
    }
  }
}
</script>
<style>
.el-dialog__body {
  padding-top: 0px;
  padding-bottom: 0px;
}

.slide-fade-enter-active {
  transition: all 0.8s ease;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
