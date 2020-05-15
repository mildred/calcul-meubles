export function calculEstimations(settings, pieceg) {
  let constants = {}
  let components = pieceg.flat_groups('', false)
    .map(group => calculShallowGroupEstimations(settings, group, constants))
  let total = components.reduce((tot, poste) => tot + poste.total, 0)
  return {components, total}
}

export function calculShallowGroupEstimations(settings, group, constants) {
  let type = group.component_type
  let postes = (settings.postes_estimations || [])
    .filter(estim => estim.components[type])
    .map(estim => ({
      ...estim,
      type,
      ...calculEstimation(estim, group, constants, type),
    }))
    .map(estim => ({
      computed: estim.value * estim.base_value,
      ...estim
    }))
    .filter(estim => estim.computed != 0)
  let total = postes.reduce((tot, poste) => tot + poste.computed, 0)
  return {type, name: group.name, postes, total}
}

export function calculEstimation(estim, pieceg, constants, type){
  switch(estim.indice) {
    case 'm2_ep0_20':
      return {
        base_value: pieceg.pieces
          .filter(p => p.epaisseur <= 20)
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_ep20_plus':
      return {
        base_value: pieceg.pieces
          .filter(p => p.epaisseur > 20)
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_panneau':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('panneau'))
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_panneau_seul':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('panneau-seul'))
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_panneau_tous':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('panneau') || p.features.includes('panneau-seul'))
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_trav_mont_ncp':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('traverse') || p.features.includes('montant'))
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_trav_mont_cp':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('traverse-cp') || p.features.includes('montant-cp'))
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_trav_mont':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('traverse') || p.features.includes('montant') || p.features.includes('traverse-cp') || p.features.includes('montant-cp'))
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_cote':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('cote'))
          .reduce((s,p) => s + p.surface, 0),
        base_unit: "m²",
      }
    case 'm2_plateau':
      return {
        base_value: pieceg.surface(),
        base_unit: "m²",
      }
    case 'nb_ep0_20':
      return {
        base_value: pieceg.pieces.filter(p => p.epaisseur <= 20).length,
        base_unit: "pièces",
      }
    case 'nb_ep20_plus':
      return {
        base_value: pieceg.pieces.filter(p => p.epaisseur > 20).length,
        base_unit: "pièces",
      }
    case 'nb_panneau':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('panneau'))
          .length,
        base_unit: "panneaux",
      }
    case 'nb_panneau_seul':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('panneau-seul'))
          .length,
        base_unit: "panneaux",
      }
    case 'nb_panneau_tous':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('panneau') || p.features.includes('panneau-seul'))
          .length,
        base_unit: "panneaux",
      }
    case 'nb_trav_mont_ncp':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('traverse') || p.features.includes('montant'))
          .length,
        base_unit: "pièces",
      }
    case 'nb_trav_mont_cp':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('traverse-cp') || p.features.includes('montant-cp'))
          .length,
        base_unit: "pièces",
      }
    case 'nb_trav_mont':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('traverse') || p.features.includes('montant') || p.features.includes('traverse-cp') || p.features.includes('montant-cp'))
          .length,
        base_unit: "pièces",
      }
    case 'nb_cote':
      return {
        base_value: pieceg.pieces
          .filter(p => p.features.includes('cote'))
          .length,
        base_unit: "côté",
      }
    case 'nb_plateau':
      return {
        base_value: pieceg.pieces.length,
        base_unit: "pièces",
      }
    case 'tenon':
      return {
        base_value: pieceg.nombre_tenons,
        base_unit: "tenons",
      }
    case 'constant':
      let cst_key = `${type}/${estim.name}`
      let val = constants[cst_key] ? 0 : 1
      constants[cst_key] = true
      return {
        base_value: val,
        base_unit: "fois",
      }
    case 'per_component':
      return {
        base_value: 1,
        base_unit: type,
      }
    case 'per_ferrage_charniere':
      return {
        base_value: pieceg.features.includes('ferrage-charniere') ? 1 : 0,
        base_unit: type,
      }
    default:
      return {
        base_value: 0,
        base_unit: '',
      }
  }
}
