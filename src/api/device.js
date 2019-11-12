import request from '@/utils/request'

export function listDevice(query) {
  return request({
    url: '/device',
    method: 'get',
    params: query
  })
}

export function createDevice(data) {
  return request({
    url: '/device',
    method: 'post',
    data
  })
}

export function readDevice(data) {
  return request({
    url: '/device',
    method: 'get',
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
