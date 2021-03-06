import request from '@/utils/request'

export function listResult(query) {
  return request({
    url: '/cameraCatInfo',
    method: 'get',
    params: query
  })
}

export function deleteResult(data) {
  return request({
    url: '/cameraCatInfo',
    method: 'delete',
    data
  })
}

export function doDownload(query) {
  return request({
    url: '/cameraCatInfo/downloadVedio',
    method: 'get',
    params: query
  })
}
