
export function cleanObject(src){
  return Object.keys(src)
    .filter(k => (src[k] !== null && src[k] !== undefined))
    .reduce((m, k) => (m[k] = src[k], m), {})
}

export function pipeline(data, ...operations){
  let res = data
  for(let i = 0; i < operations.length; i++) {
    res = operations[i](res)
  }
  return res
}

export function nextId(list) {
  return list.reduce((id, item) => Math.max(id, item.id+1), list.length)
}

export function reduceToObject(id, idval) {
  return (obj, item) => {
    if(!obj) obj = {}
    obj[item[id || 0]] = (id == null || idval) ? item[idval || 1] : item
    return obj
  }
}
export function arrayToObject(array, id, idval) {
  array.reduce(reduceToObject(array, id, idval), {})
}
