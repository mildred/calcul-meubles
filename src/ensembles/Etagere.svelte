<script>
  import { onMount } from 'svelte';
  import { cleanObject } from '../utils.js';
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
    largeur: 400,
    profondeur: 300,
    epaisseur: 18,
    ...initdata.defaults
  }

  let opt = { ...initdata.opt }
  let ui  = { ...(initdata.ui || initdata.opt) }
  let state = {}

  $: opt      = {...defaults, ...cleanObject(ui)}
  $: data.opt = opt
  $: data.ui  = ui

  let zoom = 0.5

  $: etagere = new Piece()
    .add_name("Étagère")
    .build(opt.largeur, opt.profondeur, opt.epaisseur)
    .put(0, 0, 0, 'xzy')

  $: pieces = [etagere]

  $: state.pieces = pieces
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
  hr.clear {
    clear: both;
    border: none;
  }
  table {
    clear: both;
  }
</style>

<Component bind:data={data} path={path} state={state} on:datachange>
  <div slot="plan">
    <SVGDrawing pieces={pieces} name={`Étagère ${data.name}`} />
  </div>

  <div class="main" slot="dim">
    <form>
    <label><span>Largeur    : </span><InputNumber min=0 bind:value={ui.largeur} def={defaults.largeur} force={defaults.force_largeur}/> mm</label>
    <label><span>Profondeur : </span><InputNumber min=0 bind:value={ui.profondeur} def={defaults.profondeur} force={defaults.force_profondeur}/> mm</label>
    <label><span>Épaisseur  : </span><InputNumber min=0 bind:value={ui.epaisseur} def={defaults.epaisseur} force={defaults.force_epaisseur}/> mm</label>
  </div>

  <div slot="tables">
    <ListeDebit pieces={new Group(pieces, `Étagère ${data.name}`, 'Etagere')} />
  </div>
</Component>
