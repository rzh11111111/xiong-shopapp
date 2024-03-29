const session = {}

session.install = (Vue) => {
  Vue.prototype.$getSessionStorageByName = session.$getSessionStorageByName
  Vue.prototype.$setSessionStorageByName = session.$setSessionStorageByName
  Vue.prototype.$removeSessionStorageByName = session.$removeSessionStorageByName
}

session.$getSessionStorageByName = (name) => {
  if (!sessionStorage || !sessionStorage.getItem) {
    throw Error('浏览器不支持sessionStorage')
  }
  let s = name ? sessionStorage.getItem(name) : sessionStorage
  try {
    return JSON.parse(s)
  } catch (e) {
    return s
  }
}

session.$setSessionStorageByName = (name, value) => {
  if (!sessionStorage || !sessionStorage.setItem) {
    throw Error('浏览器不支持sessionStorage')
  }
  sessionStorage.setItem(name, typeof value === 'object' ? JSON.stringify(value) : value)
}
session.$removeSessionStorageByName = (name) => {
  if (!sessionStorage || !sessionStorage.setItem) {
    throw Error('浏览器不支持sessionStorage')
  }
  sessionStorage.removeItem(name)
}
export default session
