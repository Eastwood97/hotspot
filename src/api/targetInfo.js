import request from '@/utils/request'

export function listTargetInfo(query) {
  var param = request({
    url: '/hotcompare-result/hotcompareresult',
    method: 'get',
    params: query
  })
  return param
}
export function deleteTargetInfo(ids) {
  return request({
    url: '/hotcompare-result/hotcompareresult',
    method: 'delete',
    data: ids
  })
}
