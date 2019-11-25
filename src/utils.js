
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
