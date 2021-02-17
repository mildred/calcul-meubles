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
    longueur: 400,
    hauteur: 300,
    epaisseur: 17,
    ...initdata.defaults
  }

  let opt = { ...initdata.opt }
  let ui  = { ...(initdata.ui || initdata.opt) }
  let state = {}

  $: opt      = {...defaults, ...cleanObject(ui)}
  $: data.opt = opt
  $: data.ui  = ui

  let zoom = 0.5

  $: plinthe = new Piece()
    .add_name("Plinthe")
    .build(opt.longueur, opt.hauteur, opt.epaisseur)
    .put(0, 0, 0, 'xyz')
    .add_features('panneau-seul')

  $: pieces = [plinthe]

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
    <SVGDrawing pieces={pieces} name={`Plinthe ${data.name}`} />
  </div>

  <div class="main" slot="dim">
    <form>
    <label><span>Longueur   : </span><InputNumber min=0 bind:value={ui.longueur} def={defaults.longueur} force={defaults.force_longueur}/> mm</label>
    <label><span>Profondeur : </span><InputNumber min=0 bind:value={ui.hauteur} def={defaults.hauteur} force={defaults.force_hauteur}/> mm</label>
    <label><span>Épaisseur  : </span><InputNumber min=0 bind:value={ui.epaisseur} def={defaults.epaisseur} force={defaults.force_epaisseur}/> mm</label>
  </div>

  <div slot="tables">
    <ListeDebit pieces={new Group(pieces, `Plinthe ${data.name}`, 'Plinthe')} />
  </div>
</Component>
