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
    hauteur: 100,
    profondeur: 500,
    epaisseur: 18,
    profondeur_rainure: 10,
    jeu_rainure: 1,
    epaisseur_fond: 10,
    inclure_fond: true,
    ...initdata.defaults
  }

  let opt = { ...initdata.opt }
  let ui  = { ...(initdata.ui || initdata.opt) }

  $: opt = {
    ...defaults,
    ...cleanObject(ui)
  }

  $: data.opt = opt
  $: data.ui  = ui
  let state = {}

  $: cote = new Piece()
    .add_name("Coté")
    .build(opt.profondeur, opt.hauteur, opt.epaisseur)
  $: cote_g = cote
    .add_name("gauche")
    .put(0, 0, 0, 'zyx')
  $: cote_d = cote
    .add_name("droit")
    .put(opt.largeur - opt.epaisseur, 0, 0, 'zyx')

  $: face = new Piece()
    .add_name("Face")
    .build(opt.largeur, opt.hauteur, opt.epaisseur);
  $: face_av = face
    .add_name("avant")
    .put(0, 0, 0, 'xyz')
  $: face_ar = face
    .add_name("arrière")
    .put(0, 0, opt.profondeur - opt.epaisseur, 'xyz')

  $: fond = new Piece()
    .add_name("Fond tiroir")
    .build(
      opt.largeur - 2 * (opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure),
      opt.profondeur - 2 * (opt.epaisseur - opt.profondeur_rainure + opt.jeu_rainure),
      opt.epaisseur_fond)
    .put(
      opt.profondeur_rainure + opt.jeu_rainure,
      opt.profondeur_rainure + opt.jeu_rainure,
      0,
      'xzy')

  $: pieces = [
    opt.inclure_fond ? fond : null,
    face_av, face_ar,
    cote_g, cote_d,
  ].filter(x => x != null).map(p => p.multiply_que(opt.quantite))

  $: pieces_group = new Group(pieces, `Tiroir ${data.name}`, 'Tiroir')
  $: state.pieces_group = pieces_group

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
    <form style="float: left">
    <label><span>Quantité : </span><InputNumber min=1 bind:value={ui.quantite} def={defaults.quantite}/></label>
    <label><span>Largeur   : </span><InputNumber min=0 bind:value={ui.largeur} def={defaults.largeur} force={defaults.force_largeur}/> mm</label>
    <label><span>Hauteur   : </span><InputNumber min=0 bind:value={ui.hauteur} def={defaults.hauteur} force={defaults.force_hauteur}/> mm</label>
    <label><span>Profondeur : </span><InputNumber min=0 bind:value={ui.epaisseur} def={defaults.profondeur} force={defaults.force_profondeur}/> mm</label>
    <hr/>
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
