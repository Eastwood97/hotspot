import request from '@/utils/request'

export function listTargetNum(query) {
  return request({
    url: '/targetNum',
    method: 'get',
    params: query
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
