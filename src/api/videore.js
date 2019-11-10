import request from '@/utils/request'

export function listRTSPUrl(query) {
  return request({
    url: '/admin/video/live',
    method: 'get',
    params: query
  })
}
