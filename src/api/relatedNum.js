import request from '@/utils/request'

export function listResult(query) {
  return request({
    url: '/relatedNumResult',
    method: 'get',
    params: query
  })
}

export function deleteResult(data) {
  return request({
    url: '/relatedNumResult',
    method: 'delete',
    data
  })
}
