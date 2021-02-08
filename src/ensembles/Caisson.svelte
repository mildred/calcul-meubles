<script>
  import { cleanObject, pipeline, nextId } from '../utils.js';
  import Component from '../Component.svelte';
  import ChildrenPositions from '../ChildrenPositions.svelte';
  import Piece from '../pieces/piece.js';
  import Group from '../pieces/Group.js';
  import SVGDrawing from '../pieces/SVGDrawing.svelte';
  import ListeDebit from '../ListeDebit.svelte'
  import InputCheckbox from '../controls/InputCheckbox.svelte';
  import InputNumber from '../controls/InputNumber.svelte';
  import InputSelect from '../controls/InputSelect.svelte';

  export let path
  export let initdata = {}

  let data = {...initdata}

  //
  // Defaults
  //

  let defaults = {
    type:  'contre-profil',
    largeur: 400,
    hauteur: 600,
    profondeur: 300,
    epaisseur_montants: 24,
    epaisseur_traverses: 24,
    largeur_montants: 50,
    largeur_traverses: 50,
    profondeur_tenons_cotes: 30,
    profondeur_tenons: 20,
    profondeur_rainure: 10,
    jeu_rainure: 1,
    epaisseur_panneau: 16,
    panneau_dessus: true,
    panneau_dessous: true,
    montants_inter_longueur_tenon: 20,
    montants: [
      {
      },
      {
      },
    ],
    colonnes: [
      {
        porte: {},
        casiers: [
          {
            tiroir: false,
            panneau_dessous: true,
            panneau_dos: true,
          },
        ],
      },
    ],
    ...initdata.defaults
  }

  //
  // Internal state (recomputed)
  //

  let state = {}

  let childrenState = []

  //
  // Option (internal state, saved)
  //

  let opt = { ...defaults, ...initdata.opt }

  // Migrate
  if (opt.profondeur_tenons_intermediaire) {
    opt.profondeur_tenons_cotes = opt.profondeur_tenons
    opt.profondeur_tenons = opt.profondeur_tenons_intermediaire
    delete opt.profondeur_tenons_intermediaire
  }
  if (opt.hauteur_traverses) {
    opt.largeur_traverses = opt.hauteur_traverse
    delete opt.hauteur_traverses
  }

  //
  // UI (visible state)
  //

  let ui  = {
    ...(initdata.ui || initdata.opt),
  }

  let num_colonnes = Math.max(opt.colonnes.length, 1)

  let largeur_colonnes = opt.colonnes.map(c => (c.largeur_definie ? c.largeur : null))
  $: largeur_colonnes = Array.from(Array(num_colonnes).keys())
    .map(i => largeur_colonnes[i] || null)

  let num_casiers_colonnes = opt.colonnes.map(c => (c.casiers || [{}]).length)
  $: num_casiers_colonnes = Array.from(Array(num_colonnes).keys())
    .map(i => num_casiers_colonnes[i] || 1)

  let hauteur_casiers_colonnes = opt.colonnes.map(c => (c.casiers || []).map(cas => cas.hauteur_definie ? cas.hauteur : null))
  $: hauteur_casiers_colonnes = Array.from(Array(num_colonnes).keys())
    .map(i => (hauteur_casiers_colonnes[i] || []).slice(0, num_casiers_colonnes[i]))

  let ui_colonnes = opt.colonnes
  $: ui_colonnes = Array.from(Array(num_colonnes).keys())
    .map(i => (ui_colonnes[i] || {}))
    .map((colonne, i) => {
      return {
        ...colonne,
        porte: {
          ...colonne.porte,
        },
        casiers: Array.from(Array(num_casiers_colonnes[i]).keys())
          .map(j => ({
            porte: {},
            ...(colonne.casiers || [])[j],
          }))
      }
    })

  let ui_montants = opt.montants
    .map(montant => ({...montant, panneaux_actifs: montant.panneaux.map(p => p.actif)}))

  console.log("ui_montants = %o", JSON.stringify(ui_montants, null, 2))

  $: console.log("ui_montants (reactif) = %o", JSON.stringify(ui_montants, null, 2))

  $: console.log("opt.montants (reactif) = %o", JSON.stringify(opt.montants, null, 2))

  $: ui_montants = pipeline(
      ui_montants.slice(0, ui_montants.length - 1),
      m => Array(num_colonnes).fill(1).map((_, i) => m[i] || {panneaux_actifs:[]}),
      m => m.concat([ui_montants[ui_montants.length-1]]))
    .map(montant => ({...montant, panneaux_actifs: [...(montant.panneaux_actifs||[])]}))

  let selection_casier_input = '0,0'
  $: [selection_casier_i, selection_casier_j] = selection_casier_input.split(',').map(n => parseInt(n))
  $: selection_casier = { i: selection_casier_i, j: selection_casier_j, key: selection_casier_input}

  //
  // Update opt from ui
  //

  $: opt = pipeline(
    {
      ...defaults,
      ...cleanObject({
        ...ui,
      }),
    },
    opt => updateSubdivisions(num_colonnes, opt),
    opt => calculLargeurColonnes(largeur_colonnes, opt),
    opt => calculColonnesCasiers(num_casiers_colonnes, hauteur_casiers_colonnes, ui_colonnes, opt),
    opt => calculSubdivisionMontants(opt, ui_montants))

  //
  // Update children then data from opt
  //

  let childrenPos = {}
  let children = data.children
  $: children = calculEnfants(opt, children)

  /*
  $: console.log('Caisson.initdata = ', initdata)
  $: console.log('Caisson.opt = ', opt)
  $: console.log('Caisson.ui = ', ui)
  $: console.log('Caisson.children = ', children)
  $: console.log('Caisson.childrenPos = ', childrenPos)
  $: console.log('Caisson.state = ', state)
  */

  $: data = {
    ...initdata,
    opt,
    ui,
    children,
    childrenPos,
  }

  //
  // Fonctions de calcul
  //

  function updateSubdivisions(num_colonnes, opt){
    let opt2 = {...opt}
    opt2.colonnes            = opt.colonnes.slice(0, num_colonnes)
    opt2.montants            = pipeline(
      opt.montants.slice(0, opt.montants.length-1),
      m => Array(num_colonnes).fill(1).map((_, i) => m[i]),
      m => m.concat([opt.montants[opt.montants.length-1]]))

    for(let i = 0; i<=num_colonnes; i++) {
      opt2.montants[i] = {
        ...opt2.montants[i],
      }
      if (i >= num_colonnes) break;

      opt2.colonnes[i] = {
        largeur: null,
        num_casiers: 1,
        casiers: [
          {
            tiroir: false,
            panneau_dessous: true,
            panneau_dos: true,
          }
        ],
        porte: {},
        ...opt2.colonnes[i],
      }
    }
    return opt2
  }


  function calculLargeurColonnes(largeurs, opt){
    let cols = opt.colonnes.length
    let espace_a_repartir = opt.largeur - (cols+1) * opt.epaisseur_montants
    let largeurs_definies = largeurs.filter(x => (x && x != 0))
    let cols_a_calculer = largeurs.length - largeurs_definies.length
    let espace_reparti = largeurs_definies.reduce((a,b) => (a+b), 0)
    let espace_restant = espace_a_repartir - espace_reparti
    let espace_par_col = Math.floor(espace_restant / cols_a_calculer)
    let colonnes = [...opt.colonnes]

    for(let i = 0; i < cols; i++) {
      if(largeurs[i] && largeurs[i] != 0) {
        colonnes[i].largeur_definie = true
        colonnes[i].largeur = largeurs[i]
      } else if(cols_a_calculer == 1) {
        colonnes[i].largeur_definie = false
        colonnes[i].largeur = espace_restant
        cols_a_calculer = 0
        espace_restant = 0
      } else {
        colonnes[i].largeur_definie = false
        colonnes[i].largeur = espace_par_col
        espace_restant -= espace_par_col
        cols_a_calculer -= 1
      }
    }

    return {
      ...opt,
      colonnes: colonnes,
    }
  }

  function calculColonnesCasiers(num_casiers_colonnes, hauteur_casiers_colonnes, ui_colonnes, opt){
    let cols = opt.colonnes.length
    let colonnes = []

    for(let i = 0; i < cols; i++) {
      let num = num_casiers_colonnes[i]
      let ui_colonne = ui_colonnes[i]
      let xpos = opt.epaisseur_montants * (i+1)
        + opt.colonnes.slice(0, i).reduce((n, c) => n + c.largeur, 0)
      colonnes[i] = pipeline(
        opt.colonnes[i] || {},
        col => ({
          ...col,
          xpos: xpos,
          porte: {
            ...col.porte,
            ...ui_colonne.porte,
          },
        }),
        col => {col.casiers = (col.casiers || []).slice(0, num); return col},
        col => calculCasiers(i, col, hauteur_casiers_colonnes[i], num, ui_colonne),
        col => ({...col, casiers: calculPositionCasiers(col.casiers, xpos)}))
    }

    return {
      ...opt,
      colonnes: colonnes,
    }
  }

  function calculCasiers(i, colonne, hauteurs, num, ui_colonne){
    let espace_a_repartir = opt.hauteur - (num+1) * opt.epaisseur_traverses
    let hauteurs_definies = hauteurs.filter(x => (x && x != 0))
    let casiers_a_calculer = num - hauteurs_definies.length
    let espace_reparti = hauteurs_definies.reduce((a,b) => (a+b), 0)
    let espace_restant = espace_a_repartir - espace_reparti
    let espace_par_casier = Math.floor(espace_restant / casiers_a_calculer)

    for(let j = 0; j < num; j++) {
      let ui_casier = ui_colonne.casiers[j]
      //console.log(`fusion casier ${i+1},${j+1}`, colonne.casiers[j], ui_casier)
      let casier = {
        hauteur: null,
        panneau_dessous: true,
        panneau_dos: true,
        tiroir: false,
        num_etageres: 0,
        ...colonne.casiers[j],
        ...cleanObject(ui_casier),
        porte: {
          double: false,
          facade: false,
          type: "",
          ...(colonne.casiers[j] || {}).porte,
          ...cleanObject(ui_casier.porte || {}),
        },
      }
      //console.log(`fusion casier ${i+1},${j+1} = `, casier)
      if(hauteurs[j] && hauteurs[j] != 0) {
        casier.hauteur_definie = true
        casier.hauteur = hauteurs[j]
      } else if(casiers_a_calculer == 1) {
        casier.hauteur_definie = false
        casier.hauteur = espace_restant
        casiers_a_calculer = 0
        espace_restant = 0
      } else {
        casier.hauteur_definie = false
        casier.hauteur = espace_par_casier
        espace_restant -= espace_par_casier
        casiers_a_calculer -= 1
      }
      colonne.casiers[j] = casier
    }

    return colonne
  }

  function calculPositionCasiers(casiers, xpos){
    for(let j = 0; j < casiers.length; j++) {
      const jj = casiers.length - j - 1
      casiers[j].xpos = xpos
      casiers[j].ypos = opt.epaisseur_traverses * (jj + 1)
        + casiers.slice(j+1).reduce((n,c) => n + c.hauteur, 0)
    }
    return casiers
  }

  function calculSubdivisionMontants(opt, ui_montants){
    let subdivisions_montants = Array.from(Array(opt.colonnes.length + 1).keys()).map((i) => {
      let ui_montant_panneaux_actifs = ((ui_montants[i] || {}).panneaux_actifs || [])
      let ui_montant = {
        ...ui_montants[i],
        panneaux_actifs: [...((ui_montants[i] || {}).panneaux_actifs || [])]
      }
      let casiers_g = (opt.colonnes[i-1] || {}).casiers || []
      let casiers_d = (opt.colonnes[i]   || {}).casiers || []
      let hauteurs_g = casiers_g.slice(0, -1).map((casier, j) => (
        {
          gauche: [j, j+1],
          [0]: casier.ypos - (casier.tiroir ? 0 : opt.epaisseur_traverses),
          'h': casier.tiroir ? opt.largeur_traverses : opt.epaisseur_traverses,
        }))
      let hauteurs_d = casiers_d.slice(0, -1).map((casier, j) => (
        {
          droite: [j, j+1],
          [0]: casier.ypos - (casier.tiroir ? 0 : opt.epaisseur_traverses),
          'h': casier.tiroir ? opt.largeur_traverses : opt.epaisseur_traverses,
        }))
      let hauteurs = hauteurs_g.concat(hauteurs_d)
        .sort((a,b) => (a[0] < b[0]) ? -1 : (a[0] > b[0]) ? 1 : 0)
        .map(h => ({...h, [1]: h[0] + h.h}))
      //console.log(`opt.montants[${i}] opt.colonnes[${i-1}] =`, opt.colonnes[i-1])
      //console.log(`opt.montants[${i}] opt.colonnes[${i}] =`, opt.colonnes[i])
      //console.log(`opt.montants[${i}] hauteurs_g =`, hauteurs_g)
      //console.log(`opt.montants[${i}] hauteurs_g =`, hauteurs_g.map(h => h[0]))
      //console.log(`opt.montants[${i}] hauteurs_d =`, hauteurs_d)
      //console.log(`opt.montants[${i}] hauteurs_d =`, hauteurs_d.map(h => h[0]))
      //console.log(`opt.montants[${i}] hauteurs =`, hauteurs)
      let traverses = hauteurs
        .reduce((hh, h1) => {
          if (hh.length == 0) return [{
            gauche: [0, 0],
            droite: [0, 0],
            ...h1
          }]
          let h0 = hh[hh.length-1]
          if (h1[1] - h0[0] <= opt.largeur_traverses) {
            hh[hh.length-1] = {
              ...h0,
              ...h1,
              [1]: h1[1],
            }
            return hh
          }
          return hh.concat([{
            gauche: [h0.gauche[1], h0.gauche[1]],
            droite: [h0.droite[1], h0.droite[1]],
            ...h1}
          ])
        }, [])
        .map(h => ({
          ...h,
          y1: h[0] + (h[1] - h[0]) / 2 - opt.largeur_traverses / 2,
          y2: h[0] + (h[1] - h[0]) / 2 + opt.largeur_traverses / 2,
        }))
      //console.log(`opt.montants[${i}].traverses =`, traverses)
      let ui_panneaux_actifs = Array.from(Array(traverses.length + 1).keys())
        .map(j => typeof(ui_montant.panneaux_actifs[j]) == 'boolean' ? ui_montant.panneaux_actifs[j] : null)
        .reduce((arr, x) => arr.concat([
          typeof(x) == 'boolean' ? x :
          arr.length == 0        ? true : arr[arr.length-1]]), [])
      let panneaux = Array.from(Array(traverses.length + 1).keys()).map(j => {
        let first = (j == 0)
        let last  = (j >= traverses.length)
        let cote  = (i == 0 || i == opt.colonnes.length)

        return {
          first:  first,
          last:   last,
          cote:   cote,
          y1:     first ? (opt.largeur_traverses + (cote ? 0 : opt.epaisseur_traverses))
                        : traverses[j-1].y2,
          y2:     last  ? (opt.hauteur - opt.largeur_traverses - (cote ? 0 : opt.epaisseur_traverses))
                        : traverses[j].y1,
          gauche: first ? 0 : traverses[j-1].gauche[1],
          droite: first ? 0 : traverses[j-1].droite[1],
          actif:  ui_panneaux_actifs[j],
        }
      })
      return {
        traverses: traverses,
        panneaux: panneaux,
      }
    })

    return {
      ...opt,
      montants : opt.montants.map((m, i) => (
        {
          ...m,
          ...subdivisions_montants[i],
        }
      ))
    }
  }

  function calculEnfants(opt, children){
    //console.log(`Caisson(${path}) Recalcul des enfants %o`, opt)
    children = [...(children || [])]

    // Migrate old portes
    for(let i = 0; i < children.length; i++){
      if(!children[i].source) children[i].source = ['Porte', 'colonne', i]
    }

    // Create new, remove old
    for(let i = 0; i < opt.colonnes.length; i++){
      const colonne = opt.colonnes[i]
      children = creePorteColonne(colonne, i, children)

      for(let j = 0; j < colonne.casiers.length; j++) {
        const casier = colonne.casiers[j]
        children = creePorteCasier(colonne, i, casier, j, children)
        children = creeTiroirCasier(colonne, i, casier, j, children)
        children = supprimeEtageres(colonne, i, casier, j, children)
        children = creeEtageres(colonne, i, casier, j, children)
      }
    }

    // Update values
    for(let i = 0; i < children.length; i++){
      let child = {
        name: `n°${i+1}`,
        ...children[i],
      }

      child = configurePorteColonne(child) || child
      child = configurePorteFacadeCasier(child) || child
      child = configureTiroir(child, children) || child
      child = configureEtagere(child) || child

      children[i] = child
    }

    return children

    function creePorteColonne(colonne, i, children){
      const child_idx = children.findIndex(c => c.source.join('-') == `Porte-colonne-${i}`)
      if (!colonne.porte.type) {
        // Pas de porte
        if (child_idx != -1) {
          if (confirm(`Caisson ${data.name}\nSupprimer la porte ${children[child_idx].name} ?`)) {
            children.splice(child_idx, 1)
          } else {
            children[child_idx].source.push('disabled')
          }
        }
        return children
      }
      if (child_idx != -1) return children; // Porte trouvée

      children = [...children, {
        source: ['Porte', 'colonne', i],
        name:   prompt("Quel nom donner à la porte ?", `colonne n°${i+1}`),
        type:   'Porte',
        id:     nextId(children),
      }]

      return children
    }

    function configurePorteColonne(child) {
      let source = [...child.source]
      let [i] = source.splice(2, 1)
      if(source.join('-') != 'Porte-colonne') return child

      const col = opt.colonnes[i];
      if(!col) return child;

      const total    = (col.porte.type == 'total')
      const demi     = (col.porte.type == 'demi')
      const encastre = (col.porte.type == 'encastre')

      const epaisseur_porte = (child.opt || {}).epaisseur || (child.opt || {}).epaisseur_montants

      return {
        ...child,
        type: 'Porte',
        defaults: {
          force_largeur: true,
          force_hauteur: true,
          encastree: encastre,
          largeur:
            total    ? col.largeur + 2 * opt.epaisseur_montants :
            demi     ? col.largeur + opt.epaisseur_montants :
            encastre ? col.largeur
                                           : 0,
          hauteur:
            total    ? opt.hauteur :
            demi     ? opt.hauteur - opt.epaisseur_traverses :
            encastre ? opt.hauteur - 2 * opt.epaisseur_traverses
                                           : 0,
        },
        defaultPosition: {
          x: col.ypos
             - (total ? opt.epaisseur_montants :
                demi  ? opt.epaisseur_montants / 2
                                            : 0),
          y: opt.epaisseur_traverses
             - (total ? opt.epaisseur_traverses :
                demi  ? opt.epaisseur_traverses / 2
                                            : 0),
          z: opt.profondeur
             - (encastre ? epaisseur_porte : 0),
        },
      }
    }

    function typePorte(casier){
      return casier.porte.facade ? 'Facade' : 'Porte'
    }

    function supprimeEtageres(colonne, i, casier, j, children){
      const num_etageres = casier.num_etageres

      for(let idx = children.length-1; idx >= 0; idx--){
        const child = children[idx]
        let source = [...child.source] // Etagere-col-i-cas-j-num-n
        let [num] = source.splice(6,1)
        if(source.join('-') != `Etagere-col-${i}-cas-${j}-num`) continue
        if(num < num_etageres) continue

        if (confirm(`Caisson ${data.name}\nSupprimer l'étagère ${child.name} ?`)) {
          children.splice(i, 1)
        } else {
          children[i].source.push('disabled')
        }
      }
      return children
    }

    function creeEtageres(colonne, i, casier, j, children){
      const num_etageres = casier.num_etageres
      let name = null

      for(let num = 0; num < num_etageres; num++){
        const src = `Etagere-col-${i}-cas-${j}-num-${num}`
        const child_idx = children.findIndex(c => c.source.join('-') == src)
        if(child_idx != -1) continue

        if(name == null) {
          name = `colonne n°${i+1}, casier n°${j+1}`
          name = prompt(`Quel nom donner aux étagères ?`, name) || name
        }

        children = [...children, {
          source: ['Etagere', 'col', i, 'cas', j, 'num', num],
          name:   `${name} #${num+1}`,
          type:   'Etagere',
          id:     nextId(children),
        }]
      }
      return children
    }

    function configureEtagere(child) {
      let source = [...child.source]
      let [num] = source.splice(6, 1)
      let [j] = source.splice(4, 1)
      let [i] = source.splice(2, 1)
      if(source.join('-') != 'Etagere-col-cas-num') return child

      const col = opt.colonnes[i]; if(!col) return child;
      const cas = col.casiers[j];  if(!cas)  return child;

      const step = cas.hauteur / (cas.num_etageres + 1)

      return {
        ...child,
        type: 'Etagere',
        defaults: {
          force_largeur:    true,
          force_profondeur: true,
          largeur:          col.largeur,
          profondeur:       opt.profondeur,
        },
        defaultPosition: {
          x: col.xpos,
          y: cas.ypos + (num+1) * step,
          z: 0,
        },
      }
    }

    function creePorteCasier(colonne, i, casier, j, children){
      const type = typePorte(casier)

      const variants =
        (!casier.porte.type) ? [
          ] :
        (casier.porte.double) ? [
          `${type}-col-${i}-cas-${j}-g`,
          `${type}-col-${i}-cas-${j}-d`]
        : [
          `${type}-col-${i}-cas-${j}`]

      const all_variants = [
        `Porte-col-${i}-cas-${j}`,
        `Porte-col-${i}-cas-${j}-g`,
        `Porte-col-${i}-cas-${j}-d`,
        `Facade-col-${i}-cas-${j}`,
        `Facade-col-${i}-cas-${j}-g`,
        `Facade-col-${i}-cas-${j}-d`,
      ]

      // Supprimer la facade si elle n'est pas du bon type
      for(let idx = children.length-1; idx >= 0; idx--){
        const source = children[idx].source.join('-')
        //console.log(source, variants, all_variants)
        console.log(source, children[idx].name)
        if (variants.includes(source) || !all_variants.includes(source)) break

        if (confirm(`Caisson ${data.name}\nSupprimer la ${children[idx].type}
        ${children[idx].name} ?`)) {
          children.splice(idx, 1)
        } else {
          children[idx].source.push('disabled')
        }
      }

      // pas de porte à créer
      if(!casier.porte.type) return children

      if(casier.porte.double) {
        const child_idx_g = children.findIndex(c => c.source.join('-') == variants[0])
        const child_idx_d = children.findIndex(c => c.source.join('-') == variants[1])
        let namePrefix = `colonne n°${i+1}, casier n°${j+1}`
        if (child_idx_g == -1 && child_idx_d == -1) {
          namePrefix = prompt(`Quel nom donner aux ${type.toLowerCase()}s ?`, namePrefix) || namePrefix
        }
        if (child_idx_g == -1) {
          children = [...children, {
            source: [type, 'col', i, 'cas', j, 'g'],
            name:   `${namePrefix} gauche`,
            type:   type,
            id:     nextId(children),
          }]
        }
        if (child_idx_d == -1) {
          children = [...children, {
            source: [type, 'col', i, 'cas', j, 'd'],
            name:   `${namePrefix} droite`,
            type:   type,
            id:     nextId(children),
          }]
        }
      } else {
        const child_idx = children.findIndex(c => c.source.join('-') == variants[0])
        if (child_idx == -1) {
          children = [...children, {
            source: [type, 'col', i, 'cas', j],
            name:   prompt(`Quel nom donner à la ${type.toLowerCase()} ?`, `colonne n°${i+1}, casier n°${j+1}`),
            type:   type,
            id:     nextId(children),
          }]
        }
      }

      return children;
    }

    function configurePorteFacadeCasier(child) {
      let source = [...child.source]
      let [side] = source.splice(5, 1)
      let [j]    = source.splice(4, 1)
      let [i]    = source.splice(2, 1)
      let [type] = source.splice(0, 1)
      if(source.join('-') != 'col-cas') return child
      if(type != 'Porte' && type != 'Facade') return child
      if(side && side != 'g' && side != 'd') return child

      const col = opt.colonnes[i]; if(!col) return child;
      const cas = col.casiers[j];  if(!cas) return child;

      const double   = !!side
      const total    = (cas.porte.type == 'total')
      const demi     = (cas.porte.type == 'demi')
      const encastre = (cas.porte.type == 'encastre')

      const epaisseur_porte = (child.opt || {}).epaisseur || (child.opt || {}).epaisseur_montants

      const defaults = {
        force_ferrage: true,
        ferrage:       cas.tiroir ? 'aucun' : 'charnieres',
        encastree:     encastre,
        force_largeur: true,
        force_hauteur: true,

        largeur: (1 / (double ? 2 : 1)) * (
          total    ? col.largeur + 2 * opt.epaisseur_montants :
          demi     ? col.largeur + opt.epaisseur_montants :
          encastre ? col.largeur
                                         : 0),
        hauteur:
          total    ? cas.hauteur + 2 * opt.epaisseur_traverses :
          demi     ? cas.hauteur + opt.epaisseur_traverses :
          encastre ? cas.hauteur
                                         : 0,
      }

      const defaultPosition = {
          x: cas.xpos
             + (side == 'd' ? defaults.largeur : 0)
             - (total ? opt.epaisseur_montants :
                demi  ? opt.epaisseur_montants / 2
                                            : 0),
          y: cas.ypos
             - (total ? opt.epaisseur_traverses :
                demi  ? opt.epaisseur_traverses / 2
                                            : 0),
          z: opt.profondeur
             - (encastre ? epaisseur_porte : 0),
        }

      return {
        ...child,
        type: type,
        defaults,
        defaultPosition,
      }
    }

    function creeTiroirCasier(colonne, i, casier, j, children){
      const child_idx = children.findIndex(c => c.source.join('-') == `Tiroir-col-${i}-cas-${j}`)

      // Supprimer le tiroir si il n'existe pas
      // Si il existe, return

      if (!casier.tiroir) {
        // Pas de tiroir
        if (child_idx != -1 && confirm(`Supprimer le tiroir ${children[child_idx].name} ?`)) {
          children.splice(child_idx, 1)
        }
        return children
      }
      if (child_idx != -1) return children; // Tiroir trouvé

      // Créer le tiroir si il n'est pas encore créé

      children = [...children, {
        source: ['Tiroir', 'col', i, 'cas', j],
        name:   prompt(`Quel nom donner au tiroir ?`, `colonne n°${i+1}, casier n°${j+1}`),
        type:   'Tiroir',
        id:     nextId(children),
      }]

      return children
    }

    function configureTiroir(child, children) {
      let source = [...child.source]
      let [j] = source.splice(4, 1)
      let [i] = source.splice(2, 1)
      if(source.join('-') != 'Tiroir-col-cas') return child

      const col = opt.colonnes[i]; if(!col) return child;
      const cas = col.casiers[j];  if(!cas) return child;

      const facade = children.find(c => c.source.join('-') == `${typePorte(cas)}-col-${i}-cas-${j}`) || {}
      const epaisseur_porte = facade ? ((facade.opt || {}).epaisseur || (facade.opt || {}).epaisseur_montants) : 0
      const retrait = (cas.porte.type == 'encastre') ? epaisseur_porte : 0

      return {
        ...child,
        type: 'Tiroir',
        defaults: {
          force_largeur: true,
          force_hauteur: true,
          largeur:       col.largeur,
          hauteur:       Math.min(150, cas.hauteur),
          profondeur:    opt.profondeur - retrait,
        },
        defaultPosition: {
          x: cas.xpos,
          y: cas.ypos,
          z: (cas.porte.type == 'encastre') ? epaisseur_porte : 0,
        },
      }
    }
  }

  //
  // Pièces
  //

  let montant = new Piece()
    .add_name("Montant")
    .add_features('montant')

  let traverse = new Piece()
    .add_name("Traverse")
    .add_features('traverse')

  let piece_panneau = new Piece()
    .add_name("Panneau")
    .add_features('panneau')

  $: montants_template = montant
    .build(
      opt.hauteur,
      opt.largeur_montants,
      opt.epaisseur_montants)

  $: montant_ar_g = montants_template
    .add_name("arrière-gauche")
    .put(0, 0, 0, 'yzx')

  $: montant_av_g = montants_template
    .add_name("avant-gauche")
    .put(opt.largeur - montants_template.epaisseur, 0, opt.profondeur - montants_template.largeur, 'yzx')

  $: montant_ar_d = montants_template
    .add_name("arrière-droit")
    .put(opt.largeur - montants_template.epaisseur, 0, 0, 'yzx')

  $: montant_av_d = montants_template
    .add_name("avant-droit")
    .put(0, 0, opt.profondeur - montants_template.largeur, 'yzx')

  $: traverses_cote = traverse
    .build(
      opt.profondeur - 2 * (opt.largeur_montants - opt.profondeur_tenons_cotes),
      opt.largeur_traverses,
      opt.epaisseur_traverses)
    .usine_tenons(opt.profondeur_tenons_cotes)
    .put(null, null, opt.largeur_montants - opt.profondeur_tenons_cotes, 'zyx')

  $: traverse_cote_h_g = traverses_cote
    .add_name("haut-gauche")
    .put(0, 0)

  $: traverse_cote_b_g = traverses_cote
    .add_name("bas-gauche")
    .put(0, opt.hauteur - traverses_cote.largeur)

  $: traverse_cote_h_d = traverses_cote
    .add_name("haut-droit")
    .put(opt.largeur - traverses_cote.epaisseur, 0)

  $: traverse_cote_b_d = traverses_cote
    .add_name("bas-droit")
    .put(opt.largeur - traverses_cote.epaisseur, opt.hauteur - traverses_cote.largeur)

  $: traverses = traverse
    .add_name("principale")
    .build(
      opt.largeur - 2 * (opt.epaisseur_montants - opt.profondeur_tenons),
      opt.largeur_traverses,
      opt.epaisseur_traverses)
    .usine_tenons(opt.profondeur_tenons)
    .put(opt.epaisseur_montants - opt.profondeur_tenons, null, null, 'xzy')

  $: traverse_ar_h = traverses
    .add_name("arrière-haut")
    .put(null, 0, 0)

  $: traverse_ar_b = traverses
    .add_name("arrière-bas")
    .put(null, opt.hauteur - traverses.epaisseur, 0)

  $: traverse_av_h = traverses
    .add_name("avant-haut")
    .put(null, 0, opt.profondeur - traverses.largeur)

  $: traverse_av_b = traverses
    .add_name("avant-bas")
    .put(null, opt.hauteur - traverses.epaisseur, opt.profondeur - traverses.largeur)

  $: panneaux_haut_bas = piece_panneau
    .build(
      opt.largeur - 2 * (opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure),
      opt.profondeur - 2 * (opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure),
      opt.epaisseur_panneau)
    .put(
      opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure,
      null,
      opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure,
      'xzy')

  $: panneau_h = !opt.panneau_dessus ? null : panneaux_haut_bas
    .add_name("haut")
    .put(null, 0)

  $: panneau_b = !opt.panneau_dessous ? null : panneaux_haut_bas
    .add_name("bas")
    .put(null, opt.hauteur - panneaux_haut_bas.epaisseur)

  $: panneaux_dos = opt.colonnes.map((col, i) => (col.casiers.map((casier, j) =>
    (casier.panneau_dos == false) ? null :
    (piece_panneau
      .add_name("dos", `colonne n°${i+1}`, `casier n°${j+1}`)
      .build(
        casier.hauteur + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
        col.largeur + opt.epaisseur_montants - opt.largeur_montants / 2
                    + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
        opt.epaisseur_panneau)
      .put(
        casier.xpos - opt.profondeur_rainure + opt.jeu_rainure,
        casier.ypos - opt.profondeur_rainure + opt.jeu_rainure,
        0, 'yxz')))))

  $: montants_cloisons = Array.from(Array(opt.colonnes.length - 1).keys()).map((i) => (montant
    .add_name(`cloison n°${i+1}`)
    .build(
      opt.hauteur - 2 * (opt.epaisseur_traverses - opt.montants_inter_longueur_tenon),
      opt.largeur_montants,
      opt.epaisseur_montants)
    .usine_tenons(opt.montants_inter_longueur_tenon)
    .put(
      opt.epaisseur_montants
        + opt.colonnes.slice(0, i+1).map(x => x.largeur).reduce((a, b) => a+b, 0)
        + i * opt.epaisseur_montants,
      opt.epaisseur_traverses - opt.montants_inter_longueur_tenon,
      null,
      'yzx')))

  $: montants_cloisons_av = montants_cloisons.map((m, i) => (m
    .add_name("avant")
    .put(null, null, opt.profondeur - m.largeur)))

  $: montants_cloisons_ar = montants_cloisons.map((m, i) => (m
    .add_name("arrière")
    .put(null, null, 0)))

  $: traverses_cote_inter_caissons =
    opt.montants.map((sub, i) => (
      sub.traverses.map((h, j) => (traverses_cote
        .add_name(
          (i == 0)                  ? "coté gauche" :
          (i < opt.colonnes.length) ? `cloison n°${i}` : "coté droit")
        .add_name(`traverse n°${j+1}`)
        .put(
          opt.epaisseur_montants * (i)
            + opt.colonnes.slice(0, i).reduce((n, c) => n+c.largeur, 0),
          h.y1)
      ))
    ))

  $: panneaux_cote_et_cloisons = opt.montants.map((sub, i) => (
    sub.panneaux.map((panneau, j) => !panneau.actif ? null : (
      piece_panneau
      .add_name(
        (i == 0)                   ? "coté gauche" :
        (i >= opt.colonnes.length) ? "coté droit"  : `cloison n°${i}`,
        `caisson n°${j+1}`)
      .build(
        panneau.y2 - panneau.y1 + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
        opt.profondeur - 2 * (opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure),
        opt.epaisseur_panneau)
      .put(
        opt.epaisseur_montants * (i)
          + opt.colonnes.slice(0, i).reduce((n, c) => n+c.largeur, 0),
        panneau.y1 - opt.profondeur_rainure + opt.jeu_rainure,
        opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure,
        'yzx')
    ))
  ))

  $: traverses_cloisons = Array.from(Array(opt.colonnes.length - 1).keys()).map((i) => (traverse
    .add_name(`cloison n°${i+1}`)
    .build(
      opt.profondeur - 2 * (opt.largeur_montants - opt.profondeur_tenons_cotes),
      opt.largeur_traverses,
      opt.epaisseur_traverses)
    .usine_tenons(opt.profondeur_tenons_cotes)
    .put(
      opt.epaisseur_montants
        + opt.colonnes.slice(0, i+1).map(x => x.largeur).reduce((a, b) => a+b, 0)
        + i * opt.epaisseur_montants,
      null,
      opt.largeur_montants - opt.profondeur_tenons_cotes,
      'zyx') ))

  $: traverses_cloisons_h = traverses_cloisons.map((t, i) => (t
    .add_name("haut")
    .put(null, opt.epaisseur_traverses)))

  $: traverses_cloisons_b = traverses_cloisons.map((t, i) => (t
    .add_name("bas")
    .put(null, opt.hauteur - opt.epaisseur_traverses - t.largeur)))

  $: traverses_inter2_av_ar = opt.colonnes.map((col, i) => (
    col.casiers.map((casier, j) => (j == col.casiers.length-1) ? null : (
      traverse
        .add_name("intermédiaire")
        .build(col.largeur, opt.largeur_traverses, opt.epaisseur_traverses)
        .ajout_tenons(opt.profondeur_tenons)
        .put(
          casier.xpos - opt.profondeur_tenons,
          casier.ypos - opt.epaisseur_traverses,
          null,
          'xzy')
    ))
  ))

  $: traverses_inter2_av = traverses_inter2_av_ar.map((col, i) => (
    col.map((tr, j) => (tr == null) ? null : (tr
      .add_name("avant", `cloison n°${i+1}`, `caisson n°${j}`)
      .put(null, null, opt.profondeur - opt.largeur_montants)
    ))
  ))

  $: traverses_inter2_ar = traverses_inter2_av_ar.map((col, i) => (
    col.map((tr, j) => (tr == null) ? null : (tr
      .add_name("arrière", `cloison n°${i+1}`, `caisson n°${j}`)
      .put(null, null, 0)
    ))
  ))

  $: panneau_inter2_dessous = opt.colonnes.map((col, i) => (
    col.casiers.map((casier, j) =>
      (j == col.casiers.length-1) ? null :
      (casier.panneau_dessous === false) ? null :
      (piece_panneau
        .add_name("dessous", `colonne n°${i+1}`, `casier n°${j+1}`)
        .build(
          col.largeur
            + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
          opt.profondeur
            - 2 * opt.largeur_traverses
            + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
          opt.epaisseur_panneau)
        .put(
          casier.xpos - opt.profondeur_rainure + opt.jeu_rainure,
          casier.ypos - opt.epaisseur_panneau,
          opt.largeur_traverses
            - opt.profondeur_rainure + opt.jeu_rainure,
          'xzy')
    ))
  ))

  let all_pieces = []
  let child_pieces = []

  $: pieces = [
    montant_ar_g, montant_av_g, montant_ar_d, montant_av_d,
    traverse_cote_b_d, traverse_cote_b_g, traverse_cote_h_d, traverse_cote_h_g,
    traverse_av_h, traverse_av_b, traverse_ar_h, traverse_ar_b,
    panneau_h, panneau_b,
  ]
    .concat(panneaux_dos.reduce((a,b) => a.concat(b), []))
    .concat(panneaux_cote_et_cloisons.reduce((a,b) => a.concat(b), []))
    .concat(montants_cloisons_ar)
    .concat(montants_cloisons_av)
    .concat(traverses_cloisons_h)
    .concat(traverses_cloisons_b)
    .concat(traverses_inter2_av.reduce((a,b) => a.concat(b), []))
    .concat(traverses_inter2_ar.reduce((a,b) => a.concat(b), []))
    .concat(traverses_cote_inter_caissons.reduce((a,b) => a.concat(b), []))
    .concat(panneau_inter2_dessous.reduce((a,b) => a.concat(b), []))
    .filter(x => x)

  $: all_pieces = pieces.concat(child_pieces)

  $: state.pieces = all_pieces
</script>

<style>
  form > label {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    max-width: 30em;
  }
  form > label > *:first-child {
    flex-grow: 1;
  }
  hr.clear {
    clear: both;
    border: none;
  }
  td {
    vertical-align: top;
  }
  table.panneaux .center {
    text-align: center
  }
  table.panneaux .vertical {
    //transform: rotate(-90deg);
    //transform-origin: left;
    //text-orientation: mixed;
    writing-mode: sideways-lr;
    min-width: 1em;
  }

  .meuble {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 0.5em;
  }
  .meuble .colonne {
    display: flex;
    flex-direction: column;
    width: 2em;
  }
  .meuble .colonne .casier {
    border: 1px solid #eee;
    text-align: center;
  }
  .meuble .colonne .casier input[type=radio] {
    margin: 0.5em;
  }

  .meuble .casier.panneau-haut           { border-top: 3px solid black; }
  .meuble .casier.panneau-bas            { border-bottom: 3px solid black; }
  .meuble .casier.panneau-gauche-partiel { border-left: 3px dotted black; }
  .meuble .casier.panneau-droit-partiel  { border-right: 3px dotted black; }
  .meuble .casier.panneau-gauche         { border-left: 3px solid black; }
  .meuble .casier.panneau-droit          { border-right: 3px solid black; }
  .meuble .casier.panneau-dos            { background-color: #ddd; }

  .prefs-casier {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  .prefs-casier > * {
    margin: 0.5em;
  }
</style>

<Component bind:data={data} path={path} state={state} bind:childrenState={childrenState} bind:children={children} on:datachange>
  <div slot="plan">
    <SVGDrawing pieces={all_pieces} name={`Caisson ${data.name}`} />
  </div>

  <div class="main" slot="dim">

    <h3>Mesures</h3>

    <form>
    <label><span>Hauteur    : </span><InputNumber min=0 bind:value={ui.hauteur} def={defaults.hauteur} /> mm </label>
    <label><span>Largeur    : </span><InputNumber min=0 bind:value={ui.largeur} def={defaults.largeur}/> mm</label>
    <label><span>Profondeur : </span><InputNumber min=0 bind:value={ui.profondeur} def={defaults.profondeur}/> mm </label>
    <label><span>Colonnes   : </span><input type=number bind:value={num_colonnes} min=1/></label>

    <table>
      <tr>
        <td></td>
        {#each opt.colonnes as colonne, i}
          <th>Colonne n°{i+1}</th>
        {/each}
      </tr>
      <tr>
        <td>Largeur intérieure&nbsp;:&nbsp;</td>
        {#each opt.colonnes as colonne, i}
        <td>
          <input type=number min=0
            placeholder={colonne.largeur}
            bind:value={largeur_colonnes[i]}
            style="width: 5em" />
        </td>
        {/each}
        <td>mm</td>
      </tr>
      <tr>
        <td>Casiers&nbsp;:&nbsp;</td>
        {#each opt.colonnes as colonne, i}
        <td>
          <input type=number min=1
            bind:value={num_casiers_colonnes[i]}
            style="width: 5em" />
        </td>
        {/each}
        <td></td>
      </tr>
      <tr>
        <td>Hauteur intérieure&nbsp;:&nbsp;</td>
        {#each opt.colonnes as colonne, i}
        <td>
          {#each colonne.casiers as casier, j}
            {#if j > 0}
            <br/>
            {/if}
            <input type=number min=1
              placeholder={colonne.casiers[j].hauteur}
              bind:value={hauteur_casiers_colonnes[i][j]}
              style="width: 5em" />
          {/each}
        </td>
        {/each}
        <td></td>
      </tr>
    </table>

    {#if largeur_colonnes.filter(x => (x && x != 0)).length == largeur_colonnes.length}
    <p>Attention : trop de largeurs sont définies en même temps</p>
    {/if}

    <hr/>

    <div class="prefs-casier">
      <div class="meuble"
        class:panneau-haut={opt.panneau_dessus}
        class:panneau-bas={opt.panneau_dessous}>
        {#each opt.colonnes as colonne, i}
        <div class="colonne colonne-{i}">
          <!--<div>Colonne n°{i}</div>-->
          {#each colonne.casiers as casier, j}
          <label
            class="casier casier-{i}-{j}"
            class:panneau-haut={  j == 0 ? opt.panneau_dessus :
                                  opt.colonnes[i].casiers[j-1].panneau_dessous}
            class:panneau-bas={   j < ui_colonnes[i].casiers.length-1 ?
                                  opt.colonnes[i].casiers[j].panneau_dessous :
                                  opt.panneau_dessous}
            class:panneau-gauche={opt.montants[i].panneaux
                                  .map((p,k) => p.droite != j || opt.montants[i].panneaux[k].actif)
                                  .reduce((b, p) => b && p, true)}
            class:panneau-droit={ opt.montants[i+1].panneaux
                                  .map((p,k) => p.gauche != j || opt.montants[i+1].panneaux[k].actif)
                                  .reduce((b, p) => b && p, true)}
            class:panneau-gauche-partiel={
                                  opt.montants[i].panneaux
                                  .map((p,k) => p.droite == j && opt.montants[i].panneaux[k].actif)
                                  .reduce((b, p) => b || p, false)}
            class:panneau-droit-partiel={
                                  opt.montants[i+1].panneaux
                                  .map((p,k) => p.gauche == j && opt.montants[i+1].panneaux[k].actif)
                                  .reduce((b, p) => b || p, false)}
            class:panneau-dos={opt.colonnes[i].casiers[j].panneau_dos}
            class:tiroir={opt.colonnes[i].casiers[j].tiroir}
            style="flex-grow: {casier.hauteur}">
            <!-- Casier n°{j} -->
            <input type="radio" name="selection-casier" value={`${i},${j}`} bind:group={selection_casier_input} />
          </label>
          {/each}
        </div>
        {/each}
      </div>

      <div>
        {#each [selection_casier] as sel (sel.key)}
        <p><strong>Colonne n°{selection_casier_i+1}</strong></p>
        <fieldset>
          <legend>Porte colonne n°{selection_casier_i+1}</legend>
          <label>
            <span>Type :&nbsp;</span>
            <InputSelect init={opt.colonnes[selection_casier_i].porte.type} bind:value={ui_colonnes[selection_casier_i].porte.type}>
              <option value="">Aucune</option>
              <option value="total">Recouvrement total</option>
              <option value="demi">Recouvrement à moitié</option>
              <option value="encastre">Encastré</option>
            </InputSelect>
          </label>
          <label style="display: none"><InputCheckbox tristate={false}
            def={opt.colonnes[selection_casier_i].porte.double}
            bind:checked={ui_colonnes[selection_casier_i].porte.double}
            /> porte double</label>
        </fieldset>
        {/each}
      </div>

      <div>
        {#each [selection_casier] as sel (sel.key)}
        <p><strong>Casier n° {selection_casier_j+1}</strong></p>
        <fieldset>
          <legend>Porte col°{selection_casier_i+1} cas°{selection_casier_j+1}</legend>
          <label>
            <span>Type :&nbsp;</span>
            <InputSelect
              init={opt.colonnes[selection_casier_i].casiers[selection_casier_j].porte.type}
              bind:value={ui_colonnes[selection_casier_i].casiers[selection_casier_j].porte.type}>
              <option value="">Aucune</option>
              <option value="total">Recouvrement total</option>
              <option value="demi">Recouvrement à moitié</option>
              <option value="encastre">Encastré</option>
            </InputSelect>
            <label><InputCheckbox tristate={false}
              def={opt.colonnes[selection_casier_i].casiers[selection_casier_j].porte.double}
              bind:checked={ui_colonnes[selection_casier_i].casiers[selection_casier_j].porte.double}
              /> porte double</label>
            <label><InputCheckbox tristate={false}
              def={opt.colonnes[selection_casier_i].casiers[selection_casier_j].porte.facade}
              bind:checked={ui_colonnes[selection_casier_i].casiers[selection_casier_j].porte.facade}
              /> façade seulement</label>
          </label>
        </fieldset>
        <fieldset>
          <legend>Étagère col°{selection_casier_i+1} cas°{selection_casier_j+1}</legend>
          <label>
            <span>Nombre d'étagères</span>
            <InputNumber
              def={opt.colonnes[selection_casier_i].casiers[selection_casier_j].num_etageres}
              bind:value={ui_colonnes[selection_casier_i].casiers[selection_casier_j].num_etageres}
              />
          </label>
        </fieldset>
        <fieldset>
          <legend>Tiroir col°{selection_casier_i+1} cas°{selection_casier_j+1}</legend>
          <label><InputCheckbox tristate={false}
            def={opt.colonnes[selection_casier_i].casiers[selection_casier_j].tiroir}
            bind:checked={ui_colonnes[selection_casier_i].casiers[selection_casier_j].tiroir}
            /> tiroir</label>
        </fieldset>
        <fieldset>
          <legend>Panneaux col°{selection_casier_i+1} cas°{selection_casier_j+1}</legend>
          {#if selection_casier_j == 0}
          <label><InputCheckbox tristate={false}
            def={opt.panneau_dessus}
            bind:checked={ui.panneau_dessus}
            /> panneau dessus (tout le meuble)</label>
          {:else}
          <label><InputCheckbox tristate={false}
            def={opt.colonnes[selection_casier_i].casiers[selection_casier_j-1].panneau_dessous}
            bind:checked={ui_colonnes[selection_casier_i].casiers[selection_casier_j-1].panneau_dessous}
            /> panneau dessus</label>
          {/if}
          <label><InputCheckbox tristate={false}
            def={opt.colonnes[selection_casier_i].casiers[selection_casier_j].panneau_dos}
            bind:checked={ui_colonnes[selection_casier_i].casiers[selection_casier_j].panneau_dos}
            /> panneau dos</label>
          {#if selection_casier_j < ui_colonnes[selection_casier_i].casiers.length-1}
          <label><InputCheckbox tristate={false}
            def={opt.colonnes[selection_casier_i].casiers[selection_casier_j].panneau_dessous}
            bind:checked={ui_colonnes[selection_casier_i].casiers[selection_casier_j].panneau_dessous}
            /> panneau dessous</label>
          {:else}
          <label><InputCheckbox tristate={false}
            def={opt.panneau_dessous}
            bind:checked={ui.panneau_dessous}
            /> panneau dessous (tout le meuble)</label>
          {/if}
          {#each opt.montants[selection_casier_i].panneaux as panneau, k}
            {#if panneau.droite == selection_casier_j}
              <label><InputCheckbox tristate={false}
                def={opt.montants[selection_casier_i].panneaux[k].actif}
                bind:checked={ui_montants[selection_casier_i].panneaux_actifs[k]}
                /> panneau gauche (n°{k+1})</label>
            {/if}
          {/each}
          {#each opt.montants[selection_casier_i+1].panneaux as panneau, k}
            {#if panneau.gauche == selection_casier_j}
              <label><InputCheckbox tristate={false}
                def={opt.montants[selection_casier_i+1].panneaux[k].actif}
                bind:checked={ui_montants[selection_casier_i+1].panneaux_actifs[k]}
                /> panneau droite (n°{k+1})</label>
            {/if}
          {/each}
        </fieldset>
        {/each}
      </div>
    </div>

    <hr/>

    <label><span>Épaisseur montants : </span><InputNumber def={opt.epaisseur_montants} bind:value={ui.epaisseur_montants} min=0/> mm</label>
    <label><span>Épaisseur traverses : </span><InputNumber def={opt.epaisseur_traverses} bind:value={ui.epaisseur_traverses} min=0/> mm</label>
    <label><span>Largeur montants : </span><InputNumber def={opt.largeur_montants} bind:value={ui.largeur_montants} min=0/> mm</label>
    <label><span>Largeur traverses : </span><InputNumber def={opt.largeur_traverses} bind:value={ui.largeur_traverses} min=0/> mm</label>
    <label><span>Profondeur tenons cotés : </span><InputNumber def={opt.profondeur_tenons_cotes} bind:value={ui.profondeur_tenons_cotes} min=0/> mm</label>
    <label><span>Profondeur tenons : </span><InputNumber def={opt.profondeur_tenons} bind:value={ui.profondeur_tenons} min=0/> mm</label>

    <hr/>

    <label><span>Épaisseur panneau : </span><InputNumber def={opt.epaisseur_panneau} bind:value={ui.epaisseur_panneau} min=0/> mm </label>
    <label><span>Profondeur rainure : </span><InputNumber def={opt.profondeur_rainure} bind:value={ui.profondeur_rainure} min=0/> mm</label>
    <label><span>Jeu panneau / rainure : </span><InputNumber def={opt.jeu_rainure} bind:value={ui.jeu_rainure} min=0/> mm</label>
    <label><span>Longueur tenons cloisons : </span> <InputNumber def={opt.montants_inter_longueur_tenon} bind:value={ui.montants_inter_longueur_tenon} min=0/> mm</label>

    </form>
  </div>

  <div slot="children">
    <ChildrenPositions
      children={children}
      childrenState={childrenState}
      defaultChildrenPos={children.map(c => c.defaultPosition)}
      bind:childrenPos={childrenPos}
      bind:pieces={child_pieces} />
  </div>

  <div slot="tables">
    <ListeDebit pieces={new Group(all_pieces, `Caisson ${data.name}`, 'Caisson')} />
  </div>

  <!--
  <div slot="debug">
    opt = <pre>${JSON.stringify(opt, null, 2)}</pre>
  </div>
  -->
</Component>
