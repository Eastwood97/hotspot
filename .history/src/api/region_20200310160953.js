import request from '@/utils/request'

export function listRegion() {
  return request({
    url: '/region/list',
    method: 'get'
  })
}

export function listSubRegion(query) {
  return request({
    url: '/region/clist',
    method: 'get',
    params: query
  })
}


export function createRegion() {
  return request({
    url: '/region',
    method: 'post',
    data
  })
}



export function updateRegion(data) {
  return request({
    url: '/region',
    method: 'put',
    data
  })
}

export function deleteregion(data) {
  return request({
    url: '/region',
    method: 'delete',
    data
  })
}