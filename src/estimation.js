export function calculEstimations(settings, pieces) {
  let constants = {}
  let components = pieces.flat_groups('', false)
    .map(group => calculShallowGroupEstimations(settings, group, constants))
  let total = components.reduce((tot, poste) => tot + poste.total, 0)
  return {components, total}
}

export function calculShallowGroupEstimations(settings, group, constants) {
  let type = group.component_type
  let postes = Object.entries((settings.estimations || {})[type] || {})
    .map(estim => ({...estim[1], name: estim[0], type: type}))
    .map(estim => ({
      ...estim,
      ...calculEstimation(estim, group, constants),
    }))
    .map(estim => ({
      computed: estim.value * estim.base_value,
      ...estim
    }))
    .filter(estim => estim.computed != 0)
  let total = postes.reduce((tot, poste) => tot + poste.computed, 0)
  return {type, name: group.name, postes, total}
}

export function calculEstimation(estim, pieces, constants){
  switch(estim.indice) {
    case 'm2_ep0_20':
      return {
        base_value: pieces.pieces
          .filter(p => p.epaisseur <= 20)
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_ep20_plus':
      return {
        base_value: pieces.pieces
          .filter(p => p.epaisseur > 20)
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_plateau':
      return {
        base_value: pieces.surface(),
        base_unit: "m²",
      }
    case 'nb_ep0_20':
      return {
        base_value: pieces.pieces.filter(p => p.epaisseur <= 20).length,
        base_unit: "pièces",
      }
    case 'nb_ep20_plus':
      return {
        base_value: pieces.pieces.filter(p => p.epaisseur > 20).length,
        base_unit: "pièces",
      }
    case 'nb_plateau':
      return {
        base_value: pieces.pieces.length,
        base_unit: "pièces",
      }
    case 'tenon':
      return {
        base_value: pieces.nombre_tenons,
        base_unit: "tenons",
      }
    case 'constant':
      let cst_key = `${estim.type}/${estim.name}`
      let val = constants[cst_key] ? 0 : 1
      constants[cst_key] = true
      return {
        base_value: val,
        base_unit: "fois",
      }
    case 'per_component':
      return {
        base_value: 1,
        base_unit: estim.type,
      }
    default:
      return {
        base_value: 0,
        base_unit: '',
      }
  }
}
