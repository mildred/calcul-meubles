
export function routeInfo(hash) {
  const path = hash.substr(2)
  const mcomp = path.match(/^component\/(.*)$/)
  const msettings = path.match(/^settings$/)
  return {
    component_id:       mcomp ? `component-${mcomp[1]}` : null,
    component_selector: mcomp ? `#component-${mcomp[1]}` : null,
    component_path:     mcomp ? mcomp[1] : null,
    settings:           !!msettings,
    root:               path == '',
  }
}

// Take a callback. The callback is given as argument the routeInfo and should
// return a list of elements that are target for the current route or none if
// there is no target.
export function routeDeclare(cb) {
  let previousTargets = []

  function onHashChange(){
    if(previousTargets) for(let t of previousTargets) if(t) {
      console.log('route away', t)
      t.classList.remove('target')
    }
    previousTargets = cb(routeInfo(window.location.hash))
    if(previousTargets) for(let t of previousTargets) if(t) {
      console.log('route to', t, t.classList)
      t.classList.add('target')
      console.log('route to', t, t.classList)
    }
  }

  window.addEventListener("hashchange", onHashChange, false);
  window.addEventListener("load", onHashChange, false);
}
