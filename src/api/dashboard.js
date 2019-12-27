import request from '@/utils/request'

export function info(query) {
  return request({
    url: '/hotcompare-result/countlist',
    method: 'get',
    params: query
  })
}
