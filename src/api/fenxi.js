import request from '@/utils/request'

export function searchArea_device({ id }) {
  const param = {
    regionId: id
  }
  return request({
    url: '/device/getDevId',
    method: 'get',
    params: param
  })
}

export function searchAreaList() {
  return request({
    url: '/region/getAll',
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
export function searchguishu(param) {
  return request({
    url: '/fenxi/getGuiShuiDiList',
    method: 'get',
    params: param
  })
}

