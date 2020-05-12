
export function routeInfo(hash) {
  const path = hash.substr(2)
  const mcomp = path.match(/^component\/(.*)$/)
  return {
    component_id:       mcomp ? `component-${mcomp[1]}` : null,
    component_selector: mcomp ? `#component-${mcomp[1]}` : null,
    component_path:     mcomp ? mcomp[1] : null,
  }
}
