import request from '@/utils/request'

export function listTargetFace(query) {
  return request({
    url: '/targetFace',
    method: 'get',
    params: query
  })
}

export function createTargetFace(data) {
  return request({
    url: '/targetFace',
    method: 'post',
    data
  })
}

export function readTargetFace(data) {
  return request({
    url: '/targetFace',
    method: 'get',
    data
  })
}

export function updateTargetFace(data) {
  return request({
    url: '/targetFace',
    method: 'put',
    data
  })
}

export function deleteTargetFace(data) {
  return request({
    url: '/targetFace',
    method: 'delete',
    data
  })
}
