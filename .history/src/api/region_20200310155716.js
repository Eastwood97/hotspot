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
    url: '/device',
    method: 'post',
    data
  })
}



export function updateDevice(data) {
  return request({
    url: '/device',
    method: 'put',
    data
  })
}

export function deleteDevice(data) {
  return request({
    url: '/device',
    method: 'delete',
    data
  })
}