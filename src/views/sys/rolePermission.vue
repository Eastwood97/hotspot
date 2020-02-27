<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">新建角色</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="角色ID" width="220">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.desc }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'新增'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="role.name" placeholder="角色名" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.desc"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="描述"
          />
        </el-form-item>
        <el-form-item label="權限">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="path"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { getRoutes, getRoles, addRole, deleteRole, updateRole, getCurrentRoleRoutes } from '@/api/rolePermission'
import { asyncRouterMap, constantRouterMap } from '@/router'

const defaultRole = {
  key: '',
  name: '',
  description: '',
  routes: []
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      // 所有路由
      routes: [],
      // 所有角色
      rolesList: [],
      // 当前角色对应路由
      currentRoleRoutes: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getRoutes()
    this.getRoles()
  },
  methods: {
    /**
      获取所有的路由
     */
    getRoutes() {
      // const res = await getRoutes()
      // this.serviceRoutes = res.data
      // this.routes = this.generateRoutes(res.data)
      this.listLoading = true
      getRoutes()
        .then(response => {
          if (response.data.data.type == false) {
            this.$notify.error({
              title: '失败',
              message: '您没有权限访问!'
            })
            this.listLoading = false
            this.$router.push({ path: '/' })
          } else {
            this.serviceRoutes = response.data.data
            console.log(response)
            for(let i = 0; i < asyncRouterMap.length; i++){
              this.routes.push(asyncRouterMap[i])
            }
          this.routes = this.generateRoutes(this.routes)
          this.routes.title = this.routes.meta.title
            console.log("-------+++++++--" + route)
            this.total = response.data.data.total
          }
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    },
    /**
      获取角色表
     */
    getRoles() {
      // const res = await getRoles()
      // this.rolesList = res.data\
      this.listLoading = true
      getRoles()
        .then(response => {
          if (response.data.data.type == false) {
            this.$notify.error({
              title: '失败',
              message: '您没有权限访问!'
            })
            this.listLoading = false
            this.$router.push({ path: '/' })
          } else {
            this.rolesList = response.data.data
            console.log(response)
            this.total = response.data.data.total
          }
          this.listLoading = false
        })
        .catch(() => {
          this.rolesList = []
          this.total = 0
          this.listLoading = false
        })
    },

    /**
      生成动态路由表
     */
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title

        }
        data.name = route.name
        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    /**
      判断是否要选中
     */
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        console.log(route)
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    /**
      判断是否要选中
    */
    generateArrss(routes) {
      let data = []
      routes.forEach(route => {
        for(let i = 0; i < this.currentRoleRoutes.length; i++){
          if (this.currentRoleRoutes[i] == route.name){
            data.push(route)
          }
        }
        if (route.children) {
          const temp = this.generateArrss(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },

    /**
      新增角色
     */
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },

    /**
      编辑角色的权限信息
     */
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      getCurrentRoleRoutes(scope.row.id)
        .then(response => {
          if (response.data.data.type == false) {
            this.$notify.error({
              title: '失败',
              message: '您没有权限访问!'
            })
            this.listLoading = false
            this.$router.push({ path: '/' })
          } else {
            this.currentRoleRoutes = response.data.data
            console.log("this.currentRoleRoutes:" + this.currentRoleRoutes)
          }
          this.listLoading = false
           this.$nextTick(() => {
              const routes = this.generateRoutes(this.routes)
              if (this.currentRoleRoutes == '*'){
                this.$refs.tree.setCheckedNodes(this.generateArr(routes))
              }else{
                this.$refs.tree.setCheckedNodes(this.generateArrss(routes))
              }
              // set checked state of a node not affects its father and child nodes
              this.checkStrictly = false
          })
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
     
    },

    /**
      删除
     */
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除角色么?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          console.log(row)

          await deleteRole(row.id)
          this.rolesList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },

    /**
      构造树
     */
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)

        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },

    /**
      异步确认
     */
    confirmRole() {
      const isEdit = this.dialogType === 'edit'

      const checkedKeys = this.$refs.tree.getCheckedNodes()
      console.log(checkedKeys)
      //this.role.routes = this.generateTree(deepClone(this.serviceRoutes), '/', checkedKeys)

      if (isEdit) {
        // 编辑
        const rolePermissions = {};
        rolePermissions.roleId = this.role.id
        rolePermissions.roleName = this.role.name
        rolePermissions.desc = this.role.desc
        const permissions = []
        for(let i = 0; i < checkedKeys.length; i++)
        {
          permissions.push(checkedKeys[i].name)
        }
        rolePermissions.permissions = permissions
        updateRole(rolePermissions).then(response => {
          if (response.data.data.type == false) {
            this.$notify.error({
              title: '失败',
              message: '編輯失敗!'
            })
            this.listLoading = false
          } else {
            this.$notify.success({
              title: '成功',
              message: '編輯成功'
            })
            this.dialogVisible=false
            this.getRoles()
            // this.getRoutes()
          }
          this.listLoading = false
        })
        .catch(() => {
           this.$notify.error({
              title: '失败',
              message: '編輯失敗!'
            })
        })

      } else {
        // 新增
        const rolePermissions = {};
         rolePermissions.roleId = this.role.id
        rolePermissions.roleName = this.role.name
        rolePermissions.desc = this.role.desc
        const permissions = []
        for(let i = 0; i < checkedKeys.length; i++)
        {
          permissions.push(checkedKeys[i].name)
        }
        rolePermissions.permissions = permissions
        addRole(rolePermissions).then(response => {
          if (response.data.data.type == false) {
            this.$notify.error({
              title: '失败',
              message: '新增失敗!'
            })
            this.listLoading = false
          } else {
            this.$notify.success({
              title: '成功',
              message: '新增成功'
            })
             this.dialogVisible=false
            this.getRoles()
            // this.getRoutes()
          }
          this.listLoading = false
        })
        .catch(() => {
           this.$notify.error({
              title: '失败',
              message: '新增失敗!'
            })
        })
       
      }

      // const { description, key, name } = this.role
      // this.dialogVisible = false
      // this.$notify({
      //   title: 'Success',
      //   dangerouslyUseHTMLString: true,
      //   message: `
      //       <div>Role Key: ${key}</div>
      //       <div>Role Name: ${name}</div>
      //       <div>Description: ${description}</div>
      //     `,
      //   type: 'success'
      // })
    },
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
