import request from '@/utils/request'

export function listTargetNum(query) {
  return request({
    url: '/targetNum',
    method: 'get',
    params: query
  })
}

export function listAll() {
  return request({
    url: '/targetNum',
    method: 'get'
  })
}

export function createTargetNum(data) {
  return request({
    url: '/targetNum',
    method: 'post',
    data
  })
}

export function readTargetNum(data) {
  return request({
    url: '/targetNum',
    method: 'get',
    data
  })
}

export function updateTargetNum(data) {
  return request({
    url: '/targetNum',
    method: 'put',
    data
  })
}

export function deleteTargetNum(data) {
  return request({
    url: '/targetNum',
    method: 'delete',
    data
  })
}
export function fetchExport() {
  return request({
    url: '/targetNum/exportTarget',
    method: 'get',

    responseType: 'arraybuffer', // 这个一定要有
    xsrfHeaderName: 'Authorization'
  })
}
