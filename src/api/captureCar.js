import request from '@/utils/request'

export function listResult(query) {
  return request({
    url: '/captureCar',
    method: 'get',
    params: query
  })
}

export function deleteResult(data) {
  return request({
    url: '/captureCar',
    method: 'delete',
    data
  })
}
