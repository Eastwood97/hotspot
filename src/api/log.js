import request from '@/utils/request'

export function listLog(param) {
  return request({
    url: '/hotspotLogResult/hotspotLog',
    method: 'get',
    params: param
  })
}
export function deleteLog(data) {
  return request({
    url: '/hotspotLogResult/hotspotLog',
    method: 'delete',
    data: data
  })
}
