import request from '@/utils/request'

/**
 * 根據RoleID得到當前Role的路由列表
 * @param {*} query 
 */
export function getCurrentRoleRoutes(query) {
  console.log(query)
    return request(
        {
            url: '/role/routes/current?id=' + query,
            method: 'get'
        }
    )
}

/**
 * 獲取路由列表
 */
export function getRoutes() {
  return request({
    url: '/role/routes/routes',
    method: 'get'
  })
}

/**
 * 獲取角色列表
 */
export function getRoles() {
  return request({
    url: '/role/routes/roles',
    method: 'get'
  })
}

/**
 * 新增角色
 * @param {} data 
 */
export function addRole(data) {
  return request({
    url: '/role/routes/role',
    method: 'post',
    data
  })
}

/**
 * 更新角色信息
 * @param {*} id 
 * @param {*} data 
 */
export function updateRole(data) {
  return request({
    url: '/role/routes/update',
    method: 'post',
    data
  })
}

/**
 * 刪除角色
 * @param {} id 
 */
export function deleteRole(id) {
  return request({
    url: `/role/routes/delete/${id}`,
    method: 'delete'
  })
}
