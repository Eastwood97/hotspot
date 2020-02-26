import request from '@/utils/request'

export function listResult(query) {
  return request({
    url: '/relatedNumResult',
    method: 'get',
    params: query
  })
}
