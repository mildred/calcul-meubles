
export function cleanObject(src){
  return Object.keys(src)
    .filter(k => (src[k] != null))
    .reduce((m, k) => (m[k] = src[k], m), {})
}

export function pipeline(data, ...operations){
  let res = data
  for(let i = 0; i < operations.length; i++) {
    res = operations[i](res)
  }
  return res
}
