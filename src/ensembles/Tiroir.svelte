<script>
  import { onMount } from 'svelte';
  import { cleanObject, pipeline } from '../utils.js';
  import InputNumber from '../controls/InputNumber.svelte';
  import InputCheckbox from '../controls/InputCheckbox.svelte';
  import Component from '../Component.svelte';
  import Cote from '../draw/Cote.svelte';
  import Piece from '../pieces/piece.js';
  import Group from '../pieces/Group.js';
  import SVGPiece from '../pieces/SVGPiece.svelte';
  import SVGDrawing from '../pieces/SVGDrawing.svelte';
  import ListeDebit from '../ListeDebit.svelte'

  export let path
  export let initdata = {}

  let data = {...initdata}

  let defaults = {
    quantite: 1,
    largeur: 400,
    hauteur: 150,
    hauteur_tir_max: 150,
    profondeur: 500,
    epaisseur: 15,
    profondeur_rainure: 9,
    profondeur_queues_arrondes: 10,
    jeu_rainure: 1,
    jeu_lateral: 6,
    jeu_dessous: 28,
    jeu_dessus: 7,
    epaisseur_fond: 9,
    inclure_fond: true,
    ...initdata.defaults
  }

  let opt = { ...initdata.opt }
  let ui  = { ...(initdata.ui || initdata.opt) }
  let tir = {}

  $: tir = calculTiroir({
      ...defaults,
      ...cleanObject(ui)
    })

  $: opt = {
      ...defaults,
      ...tir,
      ...cleanObject(ui),
    }

  $: data.opt = opt
  $: data.ui  = ui
  let state = {}

  $: cote = new Piece()
    .add_name("Coté")
    .add_features('cote')
    .build(
      opt.profondeur_tir - 2 * (opt.epaisseur - opt.profondeur_queues_arrondes),
      opt.hauteur_tir,
      opt.epaisseur)
  $: cote_g = cote
    .add_name("gauche")
    .put(
      opt.jeu_lateral,
      opt.jeu_dessous,
      opt.epaisseur - opt.profondeur_queues_arrondes,
      'zyx')
  $: cote_d = cote
    .add_name("droit")
    .put(
      opt.jeu_lateral + opt.largeur_tir - opt.epaisseur,
      opt.jeu_dessous,
      opt.epaisseur - opt.profondeur_queues_arrondes,
      'zyx')

  $: face = new Piece()
    .add_name("Face")
    .add_features('cote')
    .build(opt.largeur_tir, opt.hauteur_tir, opt.epaisseur);
  $: face_av = face
    .add_name("avant")
    .put(
      opt.jeu_lateral,
      opt.jeu_dessous,
      0,
      'xyz')
  $: face_ar = face
    .add_name("arrière")
    .put(
      opt.jeu_lateral,
      opt.jeu_dessous,
      opt.profondeur_tir - opt.epaisseur,
      'xyz')

  $: fond = new Piece()
    .add_name("Fond tiroir")
    .add_features('panneau')
    .build(
      opt.largeur_tir - 2 * (opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure),
      opt.profondeur_tir - (opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure),
      opt.epaisseur_fond)
    .put(
      opt.jeu_lateral + opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure,
      opt.jeu_dessous,
      opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure,
      'xzy')

  $: pieces = [
    opt.inclure_fond ? fond : null,
    face_av, face_ar,
    cote_g, cote_d,
  ].filter(x => x != null).map(p => p.multiply_que(opt.quantite))

  $: pieces_group = new Group(pieces, `Tiroir ${data.name}`, 'Tiroir')
  $: state.pieces_group = pieces_group

  function calculTiroir(opt){
    let largeur_tir = opt.largeur - 2 * opt.jeu_lateral
    let profondeur_tir = opt.profondeur - (opt.profondeur % 50)
    let hauteur_tir = Math.min(opt.hauteur_tir_max, opt.hauteur - opt.jeu_dessous - opt.jeu_dessus)
    return {largeur_tir, profondeur_tir, hauteur_tir}
  }

</script>

<style>
  form > * {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    max-width: 30em;
  }
  form > * > *:first-child {
    flex-grow: 1;
  }
</style>

<Component bind:data={data} state={state} path={path} on:datachange>
  <div slot="plan">
    <SVGDrawing pieces={pieces_group} />
  </div>

  <div class="main" slot="dim">
    <form>
    <label><span>Quantité : </span><InputNumber min=1 bind:value={ui.quantite} def={defaults.quantite}/></label>
    <hr/>
    <label><span>Largeur logement   : </span><InputNumber min=0 bind:value={ui.largeur} def={defaults.largeur} force={defaults.force_largeur}/> mm</label>
    <label><span>Hauteur logement  : </span><InputNumber min=0 bind:value={ui.hauteur} def={defaults.hauteur} force={defaults.force_hauteur}/> mm</label>
    <label><span>Profondeur logement : </span><InputNumber min=0 bind:value={ui.profondeur} def={defaults.profondeur} force={defaults.force_profondeur}/> mm</label>
    <hr/>
    <label><span>Largeur   : </span><InputNumber min=0 bind:value={ui.largeur_tir} def={tir.largeur_tir}/> mm</label>
    <label><span>Profondeur : </span><InputNumber min=0 bind:value={ui.profondeur_tir} def={tir.profondeur_tir}/> mm</label>
    <label><span>Hauteur   : </span><InputNumber min=0 bind:value={ui.hauteur_tir} def={tir.hauteur_tir}/> mm</label>
    <label><span>Hauteur max : </span><InputNumber min=0 bind:value={ui.hauteur_tir_max} def={defaults.hauteur_tir_max}/> mm</label>
    <hr/>
    <label><span>Profondeur queues d'arrondes : </span><InputNumber min=0 bind:value={ui.profondeur_queues_arrondes} def={defaults.profondeur_queues_arrondes}/> mm</label>
    <label><span>Épaisseur : </span><InputNumber min=0 bind:value={ui.epaisseur} def={defaults.epaisseur} force={defaults.force_epaisseur}/> mm</label>
    <label><span>Épaisseur fond : </span><InputNumber min=0 bind:value={ui.epaisseur_fond} def={defaults.epaisseur_fond}/> mm</label>
    <label><span>Profondeur rainures : </span><InputNumber min=0 bind:value={ui.profondeur_rainure} def={defaults.profondeur_rainure}/> mm</label>
    <label><span>Jeu paneau / rainure : </span><InputNumber min=0 bind:value={ui.jeu_rainure} def={defaults.jeu_rainure}/> mm</label>
    <label><span>Inclure le fond</span><InputCheckbox bind:checked={ui.inclure_fond} def={defaults.inclure_fond} /></label>
    </form>
  </div>

  <div slot="tables">
    <ListeDebit pieces={pieces_group} />
  </div>
</Component>
