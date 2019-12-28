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

      <!-- <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button> -->

    </div>

    <!-- 查询结果 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="正在查询中。。。"

      border
      fit
      highlight-current-row

    >
      <el-table-column type="selection" width="55"/>
      <el-table-column align="center" label="ID" prop="id" min-width="30px"/>

      <el-table-column align="center" label="目标名称" prop="targetName" min-width="40px"/>

      <el-table-column align="center" min-width="80px" label="目标外貌" prop="targetFace" >
        <template slot-scope="scope">
          <img
            v-if="scope.row.targetFace"
            :src="picURL+scope.row.targetFace"
            width="80"
            preview="1"
            preview-text="1">

        </template>
      </el-table-column>

      <el-table-column align="center" label="Top1" prop="relatedResult.topOne.imsi,relatedResult.topOne.count" >
        <template slot-scope="scope">
          <p>{{ scope.row.relatedResult.topOne.imsi }}</p>
          <p>{{ scope.row.relatedResult.topOne.count }}次</p>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Top2" prop="relatedResult.topTwo.imsi,relatedResult.toptwo.count" >
        <template slot-scope="scope">
          <p>{{ scope.row.relatedResult.topTwo.imsi }}</p>
          <p>{{ scope.row.relatedResult.topTwo.count }}次</p>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Top3" prop="relatedResult.topThree.imsi,relatedResult.topThree.count" >
        <template slot-scope="scope">
          <p>{{ scope.row.relatedResult.topThree.imsi }}</p>
          <p>{{ scope.row.relatedResult.topThree.count }}次</p>
        </template>
      </el-table-column>

      <el-table-column align="center" label="中标次数" prop="captureNum" />
    </el-table>

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

</template>

<style>
img{
  width: 100px;
  height: 100px;
}

</style>

<script>
import {
  listResult
} from '@/api/relatedNum'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {

  data() {
    return {

      picURL: 'http://192.168.2.14:9222/',

      multipleSelection: [],
      advanceSearchViewVisible: false,

      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 5,
        targetName: '',
        id: undefined
      },
      dataForm: {
        targetName: ''
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
      listResult(this.listQuery)
        .then(response => {
          this.list = response.data.data.list
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
        targetName: '',
        id: undefined
      }
    },

    // 清空表单
    resetForm() {
      this.dataForm = {
        targetName: ''
      }
    },

    // 导出
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '目标ID',
          '目标名称',
          '目标外貌',
          'Top1',
          'Top2',
          'Top3',
          '中标次数'
        ]
        const filterVal = [
          'id',
          'targetName',
          'targetFace',
          'relatedResult',
          'relatedResult.topTwo.imsi',
          'relatedResult.topThree.imsi',
          'captureNum'
        ]
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          '关联号码结果'
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
    }

  }
}
</script>
