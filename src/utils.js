
export function cleanObject(src){
  return Object.keys(src)
    .filter(k => (src[k] != null))
    .reduce((m, k) => (m[k] = src[k], m), {})
}
