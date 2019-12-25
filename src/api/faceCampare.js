import request from '@/utils/request'

export function listResult(query) {
  return request({
    url: '/faceCampareResult',
    method: 'get',
    params: query
  })
}

export function deleteResult(data) {
  return request({
    url: '/faceCampareResult',
    method: 'delete',
    data
  })
}
