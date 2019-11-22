import request from '@/utils/request'

export function listRTSPUrl(query) {
  return request({
    url: '/video/live',
    method: 'get',
    params: query
  })
}
export function listFilterM3U8(query) {
  return request({
    url: '/video/record',
    method: 'get',
    params: query
  })
}
