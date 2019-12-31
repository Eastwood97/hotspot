import request from '@/utils/request'

export function searchArea_device({ id }) {
  const param = {
    id: id
  }
  return request({
    url: '/fenxi/devicemessage',
    method: 'get',
    params: param
  })
}

export function searchAreaList() {
  return request({
    url: '/fenxi/device',
    method: 'get'
  })
}
export function searchTraffic(data) {
  return request({
    url: '/fenxi/traffic',
    method: 'post',
    data
  })
}
export function searchCountry(data) {
  return request({
    url: '/fenxi/CountryCount',
    method: 'post',
    data
  })
}
