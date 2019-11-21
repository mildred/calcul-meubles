<script>
  import Component from '../Component.svelte';
  import Piece from '../pieces/piece.js';
  import SVGPiece from '../pieces/SVGPiece.svelte';
  import ListeDebit from '../ListeDebit.svelte'

  export let path
  export let initdata = {}

  let data = {...initdata}

  let opt = {
    type:  'contre-profil',
    largeur: 400,
    hauteur: 600,
    profondeur: 300,
    epaisseur_montants: 24,
    largeur_montants: 50,
    largeur_traverses: 50,
    profondeur_tenons_cotes: 30,
    profondeur_tenons: 20,
    profondeur_rainure: 10,
    jeu_rainure: 1,
    epaisseur_panneau: 16,
    montants_inter: [
    ],
    colonnes: [
      {
      }
    ],
    ...data.opt
  }

  // Migrate
  if (opt.profondeur_tenons_intermediaire) {
    opt.profondeur_tenons_cotes = opt.profondeur_tenons
    opt.profondeur_tenons = opt.profondeur_tenons_intermediaire
    delete opt.profondeur_tenons_intermediaire
  }
  if (opt.hauteur_traverses) {
    opt.largeur_traverses = opt.hauteur_traverses
    delete opt.hauteur_traverses
  }

  $: data.opt = opt

  let zoom = 0.5;
  let num_colonnes = Math.max(opt.colonnes.length, 1)
  let largeur_colonnes = opt.colonnes.map(c => (c.largeur_definie ? c.largeur : null))

  $: updateSubdivisions(num_colonnes)
  $: calculLargeurs(largeur_colonnes)
  $: calculPortes(opt)

  function updateSubdivisions(num_colonnes){
    opt.colonnes       = opt.colonnes.slice(0, num_colonnes)
    opt.montants_inter = opt.montants_inter.slice(0, num_colonnes-1)
    largeur_colonnes   = largeur_colonnes.slice(0, num_colonnes)

    for(let i = 0; i<num_colonnes; i++) {
      largeur_colonnes[i] = largeur_colonnes[i] || null
      opt.colonnes[i] = {
        largeur: null,
        porte: {},
        ...opt.colonnes[i],
      }
      if (i<num_colonnes - 1) {
        opt.montants_inter[i] = {
          longueur_tenon: 20,
          ...opt.montants_inter[i],
        }
      }
    }
  }

  function calculLargeurs(largeurs){
    let cols = opt.colonnes.length
    let espace_a_repartir = opt.largeur - (cols+1) * opt.epaisseur_montants
    let largeurs_definies = largeurs.filter(x => (x && x != 0))
    let cols_a_calculer = largeurs.length - largeurs_definies.length
    let espace_reparti = largeurs_definies.reduce((a,b) => (a+b), 0)
    let espace_restant = espace_a_repartir - espace_reparti
    let espace_par_col = Math.floor(espace_restant / cols_a_calculer)

    for(let i = 0; i < cols; i++) {
      if(largeurs[i] && largeurs[i] != 0) {
        opt.colonnes[i].largeur_definie = true
        opt.colonnes[i].largeur = largeurs[i]
      } else if(cols_a_calculer == 1) {
        opt.colonnes[i].largeur_definie = false
        opt.colonnes[i].largeur = espace_restant
        cols_a_calculer = 0
        espace_restant = 0
      } else {
        opt.colonnes[i].largeur_definie = false
        opt.colonnes[i].largeur = espace_par_col
        espace_restant -= espace_par_col
        cols_a_calculer -= 1
      }
    }
  }

  function calculPortes(opt){
    //console.log(`Caisson(${path}) Recalcul des portes %o`, opt)
    if(!data.children) data.children = []
    for(let i = 0; i < opt.colonnes.length; i++) {
      let porte = opt.colonnes[i].porte || {}
      if(!porte || porte.type == 'aucune'){
        data.children[i] = {
          ...data.children[i],
          type: null,
        }
      } else {
        data.children[i] = {
          ...data.children[i],
          type: 'Porte',
          name: `${i+1}`,
          id:   i,
          defaults: {
            force_largeur: true,
            force_hauteur: true,
            largeur:
              (porte.type == 'total')    ? opt.colonnes[i].largeur + 2 * opt.epaisseur_montants :
              (porte.type == 'demi')     ? opt.colonnes[i].largeur + opt.epaisseur_montants :
              (porte.type == 'encastre') ? opt.colonnes[i].largeur :
              0,
            hauteur:
              (porte.type == 'total')    ? opt.hauteur :
              (porte.type == 'demi')     ? opt.hauteur - opt.epaisseur_montants :
              (porte.type == 'encastre') ? opt.hauteur - 2 * opt.epaisseur_montants :
              0,
              epaisseur: opt.epaisseur_montants,
              largeur_montants: opt.largeur_montants,
              largeur_traverses: opt.largeur_traverses,
              profondeur_tenons: opt.profondeur_tenons,
              profondeur_rainure: opt.profondeur_rainure,
              jeu_rainure: opt.jeu_rainure,
              epaisseur_panneau: opt.epaisseur_panneau,
          },
          forceopt: {
            largeur:
              (porte.type == 'total')    ? opt.colonnes[i].largeur + 2 * opt.epaisseur_montants :
              (porte.type == 'demi')     ? opt.colonnes[i].largeur + opt.epaisseur_montants :
              (porte.type == 'encastre') ? opt.colonnes[i].largeur :
              0,
            hauteur:
              (porte.type == 'total')    ? opt.hauteur :
              (porte.type == 'demi')     ? opt.hauteur - opt.epaisseur_montants :
              (porte.type == 'encastre') ? opt.hauteur - 2 * opt.epaisseur_montants :
              0,
          },
        }
      }
    }
  }

  $: montants = new Piece()
    .add_name("Montant")
    .build(
      opt.hauteur,
      opt.largeur_montants,
      opt.epaisseur_montants)

  $: montant_ar_g = montants
    .add_name("arrière-gauche")
    .put(0, 0, 0, 'yzx')

  $: montant_av_g = montants
    .add_name("avant-gauche")
    .put(opt.largeur - montants.epaisseur, 0, opt.profondeur - montants.largeur, 'yzx')

  $: montant_ar_d = montants
    .add_name("arrière-droit")
    .put(opt.largeur - montants.epaisseur, 0, 0, 'yzx')

  $: montant_av_d = montants
    .add_name("avant-droit")
    .put(0, 0, opt.profondeur - montants.largeur, 'yzx')

  $: traverses_cote = new Piece()
    .add_name("Traverse", "coté")
    .build(
      opt.profondeur - 2 * (opt.largeur_montants - opt.profondeur_tenons_cotes),
      opt.largeur_traverses,
      opt.epaisseur_montants)
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

  $: panneaux_cote = new Piece()
    .add_name("Panneau", "coté")
    .build(
      opt.hauteur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure),
      opt.profondeur - 2 * (opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure),
      opt.epaisseur_panneau)
    .put(null,
      opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure,
      opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure,
      'yzx')

  $: panneau_cote_g = panneaux_cote
    .add_name("gauche")

  $: panneau_cote_d = panneaux_cote
    .add_name("droite")
    .put(opt.largeur - montants.epaisseur)

  $: traverses = new Piece()
    .add_name("Traverse")
    .build(
      opt.largeur - 2 * (opt.epaisseur_montants - opt.profondeur_tenons),
      opt.largeur_traverses,
      opt.epaisseur_montants)
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

  $: panneaux_haut_bas = new Piece()
    .add_name("Panneau")
    .build(
      opt.largeur - 2 * (opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure),
      opt.profondeur - 2 * (opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure),
      opt.epaisseur_panneau)
    .put(
      opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure,
      null,
      opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure,
      'xzy')

  $: panneau_h = panneaux_haut_bas
    .add_name("haut")
    .put(null, 0)

  $: panneau_b = panneaux_haut_bas
    .add_name("bas")
    .put(null, opt.hauteur - panneaux_haut_bas.epaisseur)

  $: panneaux_dos = opt.colonnes.map((c, i) => (new Piece()
    .add_name("Panneau", "dos", `n°${i+1}`)
    .build(
      opt.hauteur - 2 * (opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure),
      c.largeur + opt.epaisseur_montants - opt.largeur_montants / 2
                + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
      opt.epaisseur_panneau)
    .put(
      opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure
        + opt.colonnes.slice(0, i).map(x => x.largeur).reduce((a, b) => a+b, 0)
        + i * opt.epaisseur_montants,
      opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure,
      0, 'yxz')))

  $: montants_inter = opt.montants_inter.map((m, i) => (new Piece()
    .add_name("Montant", "intermédiaire", `n°${i+1}`)
    .build(
      opt.hauteur - 2 * (opt.epaisseur_montants - m.longueur_tenon),
      opt.largeur_montants,
      opt.epaisseur_montants)
    .usine_tenons(m.longueur_tenon)
    .put(
      opt.epaisseur_montants
        + opt.colonnes.slice(0, i+1).map(x => x.largeur).reduce((a, b) => a+b, 0)
        + i * opt.epaisseur_montants,
      opt.epaisseur_montants - m.longueur_tenon,
      null,
      'yzx')))

  $: montants_inter_av = montants_inter.map((m, i) => (m
    .add_name("avant")
    .put(null, null, opt.profondeur - m.largeur)))

  $: montants_inter_ar = montants_inter.map((m, i) => (m
    .add_name("arrière")
    .put(null, null, 0)))

  $: traverses_inter = opt.montants_inter.map((m, i) => (new Piece()
    .add_name("Traverse", "intermédiaire", `n°${i+1}`)
    .build(
      opt.profondeur - 2 * (opt.largeur_montants - opt.profondeur_tenons_cotes),
      opt.largeur_traverses,
      opt.epaisseur_montants)
    .usine_tenons(opt.profondeur_tenons_cotes)
    .put(
      opt.epaisseur_montants
        + opt.colonnes.slice(0, i+1).map(x => x.largeur).reduce((a, b) => a+b, 0)
        + i * opt.epaisseur_montants,
      null,
      opt.largeur_montants - opt.profondeur_tenons_cotes,
      'zyx')))

  $: traverses_inter_h = traverses_inter.map((t, i) => (t
    .add_name("haut")
    .put(null, opt.epaisseur_montants)))

  $: traverses_inter_b = traverses_inter.map((t, i) => (t
    .add_name("bas")
    .put(null, opt.hauteur - opt.epaisseur_montants - t.largeur)))

  $: panneaux_inter = opt.montants_inter.map((m, i) => (new Piece()
    .add_name("Panneau", "intermédiaire", `n°${i+1}`)
    .build(
      opt.hauteur - 2 * (opt.epaisseur_montants + opt.largeur_traverses)
                  + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
      opt.profondeur - 2 * (opt.largeur_montants)
                     + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
      opt.epaisseur_panneau)
    .put(
      opt.epaisseur_montants
        + opt.colonnes.slice(0, i+1).map(x => x.largeur).reduce((a, b) => a+b, 0)
        + i * opt.epaisseur_montants,
      opt.epaisseur_montants + opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure,
      opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure,
      'yzx')))

  $: pieces = [
    montant_ar_g, montant_av_g, montant_ar_d, montant_av_d,
    traverse_cote_b_d, traverse_cote_b_g, traverse_cote_h_d, traverse_cote_h_g,
    panneau_cote_g, panneau_cote_d,
    traverse_av_h, traverse_av_b, traverse_ar_h, traverse_ar_b,
    panneau_h, panneau_b,
  ]
    .concat(panneaux_dos)
    .concat(panneaux_inter)
    .concat(montants_inter_ar)
    .concat(montants_inter_av)
    .concat(traverses_inter_h)
    .concat(traverses_inter_b)
    .filter(x => x)
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
</style>

<Component bind:data={data} path={path} on:datachange>
  <div class="main">

    <h1>Calcul d'un caisson</h1>
    <h2>Caisson {data.name}</h2>

    <div style="float: left">
    <p>Zoom : <input type=range bind:value={zoom} min=0 max=1 step=.05> {zoom*100} %</p>
    <svg
        width="{5 + zoom*opt.largeur + 5 + zoom*opt.profondeur + 5}"
        height="{5 + zoom*opt.hauteur + 5 + zoom*opt.profondeur + 5}">
      <g transform="translate(5, 5) scale({zoom} {zoom})">
        {#each pieces as piece}
          <SVGPiece piece={piece} pos="xy" />
        {/each}
      </g>
      <g transform="translate({5 + zoom*opt.largeur + 10}, 5) scale({zoom} {zoom})">
        {#each pieces as piece}
          <SVGPiece piece={piece} pos="zy" />
        {/each}
      </g>
      <g transform="translate(5, {5 + zoom*(opt.hauteur) + 5}) scale({zoom} {zoom})">
        {#each pieces as piece}
          <SVGPiece piece={piece} pos="xz" />
        {/each}
      </g>
    </svg>
    </div>

    <form style="float: left">
    <label><span>Hauteur    : </span><input type=number bind:value={opt.hauteur} min=0/> mm </label>
    <label><span>Largeur    : </span><input type=number bind:value={opt.largeur} min=0/> mm</label>
    <label><span>Profondeur : </span><input type=number bind:value={opt.profondeur} min=0/> mm </label>
    <label><span>Colonnes   : </span><input type=number bind:value={num_colonnes} min=1/></label>

    <p>
      <span>Largeur intérieure des colonnes :</span>
      {#each opt.colonnes as colonne, i}
      <input type=number min=0
        placeholder={colonne.largeur}
        bind:value={largeur_colonnes[i]}
        style="width: 5em" />
      {/each}
      mm
    </p>
    {#if largeur_colonnes.filter(x => (x && x != 0)).length == largeur_colonnes.length}
    <p>Attention : trop de largeurs sont définies en même temps</p>
    {/if}

    <hr/>

    <label><span>Épaisseur montants et traverses : </span><input type=number bind:value={opt.epaisseur_montants} min=0/> mm</label>
    <label><span>Largeur montants : </span><input type=number bind:value={opt.largeur_montants} min=0/> mm</label>
    <label><span>Largeur traverses : </span><input type=number bind:value={opt.largeur_traverses} min=0/> mm</label>
    <label><span>Profondeur tenons cotés : </span><input type=number bind:value={opt.profondeur_tenons_cotes} min=0/> mm</label>
    <label><span>Profondeur tenons : </span><input type=number bind:value={opt.profondeur_tenons} min=0/> mm</label>

    <hr/>

    <label><span>Épaisseur panneau : </span><input type=number bind:value={opt.epaisseur_panneau} min=0/> mm </label>
    <label><span>Profondeur rainure : </span><input type=number bind:value={opt.profondeur_rainure} min=0/> mm</label>
    <label><span>Jeu panneau / rainure : </span><input type=number bind:value={opt.jeu_rainure} min=0/> mm</label>

    <p>Montants intermédiaires :</p>
    <table>
      <tr>
        <th></th>
        <th>Longueur tenon montant</th>
      </tr>
      {#each opt.montants_inter as montant_inter, i}
      <tr>
        <td>Montant intermédiaire {i+1}</td>
        <td>
          <input type=number bind:value={opt.montants_inter[i].longueur_tenon} min=0/> mm
        </td>
      </tr>
      {/each}
    </table>

    <p>Portes :</p>
    <table>
      <tr>
        <th></th>
        <th>Type</th>
      </tr>
      {#each opt.colonnes as colonne, i}
      <tr>
        <td>Porte {i+1}</td>
        <td>
          <select bind:value={colonne.porte.type}>
            <option value="aucune">Aucune</option>
            <option value="total">Recouvrement total</option>
            <option value="demi">Recouvrement à moitié</option>
            <option value="encastre">Encastré</option>
          </select>
        </td>
      </tr>
      {/each}
    </table>

    </form>

    <hr class="clear"/>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
