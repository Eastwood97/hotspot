import request from '@/utils/request'

export function getHotnumInfo(param) {
  console.log(param)
  return request({
    url: '/hot-numinfo/hotnuminfo',
    method: 'get',
    params: param
  })
}
export function deleteHotnumInfo(ids) {
  console.log(ids)
  return request({
    url: '/hot-numinfo/hotnuminfo',
    method: 'delete',
    data: ids
  })
}
