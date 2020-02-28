import request from '@/utils/request'

export function listTargetCar(query) {
  return request({
    url: '/targetCar',
    method: 'get',
    params: query
  })
}

export function listAll() {
  return request({
    url: '/targetCar',
    method: 'get'
  })
}

export function createTargetCar(data) {
  return request({
    url: '/targetCar',
    method: 'post',
    data
  })
}

export function readTargetCar(data) {
  return request({
    url: '/targetCar',
    method: 'get',
    data
  })
}

export function updateTargetCar(data) {
  return request({
    url: '/targetCar',
    method: 'put',
    data
  })
}

export function deleteTargetCar(data) {
  return request({
    url: '/targetCar',
    method: 'delete',
    data
  })
}
export function fetchExport() {
  return request({
    url: '/targetCar/exportTarget',
    method: 'get',

    responseType: 'arraybuffer', // 这个一定要有
    xsrfHeaderName: 'Authorization'
  })
}
