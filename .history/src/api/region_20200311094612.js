import request from '@/utils/request'

export function listAllRegion() {
  return request({
    url: '/region/getAll',
    method: 'get'
  })
}

export function listSubRegion(query) {
  return request({
    url: '/region',
    method: 'get',
    params: query
  })
}


export function createRegion(data) {
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

export function deleteRegion(data) {
  return request({
    url: '/region',
    method: 'delete',
    data
  })
}