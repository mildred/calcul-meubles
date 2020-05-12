<script>
  import { onMount } from 'svelte';
  import { cleanObject } from '../utils.js';
  import InputNumber from '../controls/InputNumber.svelte';
  import InputCheckbox from '../controls/InputCheckbox.svelte';
  import Component from '../Component.svelte';
  import Cote from '../draw/Cote.svelte';
  import Piece from '../pieces/piece.js';
  import SVGPiece from '../pieces/SVGPiece.svelte';
  import ListeDebit from '../ListeDebit.svelte'

  export let path
  export let initdata = {}

  let data = {...initdata}

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

  $: pieces = [facade]
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

<Component bind:data={data} path={path} on:datachange>
  <div class="main">

    <h1>Calcul d'une façade</h1>
    <h2>Façade {data.name}</h2>

    <div style="float: left">
    <p>Zoom : <input type=range bind:value={zoom} min=0 max=1 step=.05> {zoom*100} %</p>
    <svg
        width="{5 + zoom*opt.largeur + 5 + zoom*opt.hauteur + 5}"
        height="{5 + zoom*opt.epaisseur + 5 + zoom*opt.hauteur + 5}">
      <g transform="translate(5, {5 + zoom*opt.hauteur}) scale({zoom} {zoom})">
        {#each pieces as piece}
          <SVGPiece piece={piece} pos="xy" />
        {/each}
      </g>
      <g transform="translate({5 + zoom*opt.largeur + 10}, {5 + zoom*opt.hauteur}) scale({zoom} {zoom})">
        {#each pieces as piece}
          <SVGPiece piece={piece} pos="zy" />
        {/each}
      </g>
      <g transform="translate(5, {5 + zoom*opt.hauteur + zoom*(opt.epaisseur) + 5}) scale({zoom} {zoom})">
        {#each pieces as piece}
          <SVGPiece piece={piece} pos="xz" />
        {/each}
      </g>
    </svg>
    </div>

    <form style="float: left">
    <label><span>Largeur    : </span><InputNumber min=0 bind:value={ui.largeur} def={defaults.largeur} force={defaults.force_largeur}/> mm</label>
    <label><span>Hauteur    : </span><InputNumber min=0 bind:value={ui.hauteur} def={defaults.hauteur} force={defaults.force_hauteur}/> mm</label>
    <label><span>Épaisseur  : </span><InputNumber min=0 bind:value={ui.epaisseur} def={defaults.epaisseur} force={defaults.force_epaisseur}/> mm</label>

    <hr class="clear"/>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
