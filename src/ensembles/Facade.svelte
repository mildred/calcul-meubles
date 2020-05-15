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
  let state = {}

  let defaults = {
    largeur: 400,
    hauteur: 150,
    epaisseur: 18,
    ...initdata.defaults
  }

  let opt = { ...initdata.opt }
  let ui  = { ...(initdata.ui || initdata.opt) }

  $: opt      = {...defaults, ...cleanObject(ui)}
  $: data.opt = opt
  $: data.ui  = ui

  let zoom = 0.5

  $: facade = new Piece()
    .add_name("Façade")
    .build(opt.largeur, opt.hauteur, opt.epaisseur)
    .put(0, 0, 0, 'xyz')
    .add_features('plateau')

  $: pieces = [facade]

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
    <SVGDrawing pieces={pieces} name={`Façade ${data.name}`} />
  </div>

  <div class="main" slot="dim">
    <form>
    <label><span>Largeur    : </span><InputNumber min=0 bind:value={ui.largeur} def={defaults.largeur} force={defaults.force_largeur}/> mm</label>
    <label><span>Hauteur    : </span><InputNumber min=0 bind:value={ui.hauteur} def={defaults.hauteur} force={defaults.force_hauteur}/> mm</label>
    <label><span>Épaisseur  : </span><InputNumber min=0 bind:value={ui.epaisseur} def={defaults.epaisseur} force={defaults.force_epaisseur}/> mm</label>
  </div>

  <div slot="tables">
    <ListeDebit pieces={new Group(pieces, `Façade ${data.name}`, 'Facade')} />
  </div>
</Component>
