import request from '@/utils/request'

export function listResult(query) {
  return request({
    url: '/plateNumberCompare',
    method: 'get',
    params: query
  })
}

export function deleteResult(data) {
  return request({
    url: '/plateNumberCompare',
    method: 'delete',
    data
  })
}
