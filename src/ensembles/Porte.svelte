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
    type:  'contre-profil',
    largeur: 400,
    hauteur: 600,
    epaisseur: 18,
    largeur_montants: 50,
    largeur_traverses: 50,
    profondeur_tenons: 30,
    profondeur_rainure: 10,
    profondeur_profil: 15,
    jeu_rainure: 1,
    epaisseur_panneau: 10,
    inclure_panneau: true,
    ...initdata.defaults
  }

  let opt = { ...initdata.opt }
  let ui  = { ...(initdata.ui || initdata.opt) }

  $: opt      = {...defaults, ...cleanObject(ui)}
  $: data.opt = opt
  $: data.ui  = ui

  let zoom = 0.5

  $: montant = new Piece()
    .add_name("Montant")
    .build(opt.hauteur, opt.largeur_montants, opt.epaisseur)
  $: montant_g = montant
    .add_name("gauche")
    .put(0, 0, 0, 'yxz')
  $: montant_d = montant
    .add_name("droit")
    .put(opt.largeur - opt.largeur_montants, 0, 0, 'yxz')

  $: traverse =
    (opt.type == 'contre-profil')  ? new Piece()
      .add_name("Traverse")
      .build(
        opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_profil),
        opt.largeur_traverses,
        opt.epaisseur):
    (opt.type == 'tenon-mortaise') ? new Piece()
      .add_name("Traverse")
      .build(
        opt.largeur - 2 * opt.largeur_montants,
        opt.largeur_traverses,
        opt.epaisseur)
      .ajout_tenons(opt.profondeur_tenons):
    new Piece();
  $: traverse_xpos =
    (opt.type == 'contre-profil')  ? opt.largeur_montants - opt.profondeur_profil:
    (opt.type == 'tenon-mortaise') ? opt.largeur_montants - opt.profondeur_tenons:
    0;
  $: traverse_h = traverse
    .add_name("haut")
    .put(traverse_xpos, 0, 0, 'xyz')
  $: traverse_b = traverse
    .add_name("bas")
    .put(traverse_xpos, opt.hauteur-traverse.largeur, 0, 'xyz')
  $: panneau = (
    (opt.type == 'contre-profil')  ? new Piece()
      .build(
        opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure),
        opt.hauteur - 2 * (opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure),
        opt.epaisseur_panneau):
    (opt.type == 'tenon-mortaise') ? new Piece()
      .build(
        opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure),
        opt.hauteur - 2 * (opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure),
        opt.epaisseur_panneau):
    new Piece())
    .add_name("Panneau")
    .put(
      montant.largeur - opt.profondeur_rainure + opt.jeu_rainure,
      traverse.largeur - opt.profondeur_rainure + opt.jeu_rainure,
      0,
      'xyz')

  $: pieces = [
    opt.inclure_panneau ? panneau : null,
    traverse_h, traverse_b,
    montant_g, montant_d,
  ].filter(x => x != null)

  $: nombre_tenons = pieces.reduce((n, p) => n + p.nombre_tenons, 0)
  $: nombre_pieces = pieces.length
  $: pieces_par_epaisseur = pieces
    .reduce((h, p) => ({...h, [p.epaisseur]: [...(h[p.epaisseur]||[]), p]}), {})
  $: stats_epaisseur = Object.keys(pieces_par_epaisseur)
    .map((epaisseur) => ({
      epaisseur: epaisseur,
      nombre: pieces_par_epaisseur[epaisseur].length,
      surface: pieces_par_epaisseur[epaisseur].reduce((s,p) => s + p.surface(), 0)
    }))
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

    <h1>Calcul d'une porte</h1>
    <h2>Porte {data.name}</h2>

    <div style="float: left">
    <!--<img src="porte.svg" />-->
    <p>Zoom : <input type=range bind:value={zoom} min=0 max=1 step=.05> {zoom*100} %</p>
    <svg
        width="{zoom*opt.largeur + 25}"
        height="{zoom*opt.hauteur + 65}">
      <Cote zoom={zoom} x=20 y=0 dim={[
          {
            text: "largeur: ",
            start: 0,
            length: opt.largeur,
            row: 2,
          },
          {
            text: "lon. traverse: ",
            start: traverse_h.x,
            length: traverse_h.longueur,
            row: 1,
          },
          {
            start: montant_g.x,
            length: montant_g.largeur,
            row: 0,
          },
          {
            start: montant_d.x,
            length: montant_d.largeur,
            row: 0,
          }
        ]} />
      <Cote zoom={zoom} x=0 y=60 pos=left dim={[
          {
            text: "hauteur: ",
            start: 0,
            length: opt.hauteur,
            row: 0,
          }
        ]} />
      <g transform="translate(20, 60) scale({zoom} {zoom})">
        {#each pieces as piece}
          <SVGPiece piece={piece} pos="avant" />
        {/each}
      </g>
    </svg>
    </div>

    <form style="float: left">
    <label>
      <span>Type : </span>
      <select bind:value={ui.type}>
        <option value="tenon-mortaise">tenon et mortaise</option>
        <option value="contre-profil">contre profil</option>
      </select>
    </label>
    <label><span>Largeur   : </span><InputNumber min=0 bind:value={ui.largeur} def={defaults.largeur} force={defaults.force_largeur}/> mm</label>
    <label><span>Hauteur   : </span><InputNumber min=0 bind:value={ui.hauteur} def={defaults.hauteur} force={defaults.force_hauteur}/> mm</label>
    <label><span>Épaisseur : </span><InputNumber min=0 bind:value={ui.epaisseur} def={defaults.epaisseur} force={defaults.force_epaisseur}/> mm</label>
    <hr/>
    <label><span>Largeur traverses : </span><InputNumber min=0 bind:value={ui.largeur_montants} def={defaults.largeur_montants}/> mm</label>
    <label><span>Épaisseur panneau : </span><InputNumber min=0 bind:value={ui.largeur_traverses} def={defaults.largeur_traverses}/> mm</label>
    <hr/>
    <label><span>Largeur montants : </span><InputNumber min=0 bind:value={ui.epaisseur_panneau} def={defaults.epaisseur_panneau}/> mm</label>
    <label><span>Profondeur rainures : </span><InputNumber min=0 bind:value={ui.profondeur_rainure} def={defaults.profondeur_rainure}/> mm</label>
    <label><span>Jeu paneau / rainure : </span><InputNumber min=0 bind:value={ui.jeu_rainure} def={defaults.jeu_rainure}/> mm</label>
    {#if opt.type == 'tenon-mortaise' }
    <label><span>Profondeur tenons : </span><InputNumber min=0 bind:value={ui.profondeur_tenons} def={defaults.profondeur_tenons}/> mm</label>
    {:else if opt.type == 'contre-profil' }
    <label><span>Profondeur profil : </span><InputNumber min=0 bind:value={ui.profondeur_profil} def={defaults.profondeur_profil}/> mm</label>
    {/if}
    <label><span>Inclure le paneau</span><InputCheckbox bind:checked={ui.inclure_panneau} def={defaults.inclure_panneau} /></label>
    </form>

    <hr class="clear"/>
    <dl>
      <dt>Nombre de tenons</dt>
      <dd>{nombre_tenons}</dd>
      <dt>Nombre de pièces</dt>
      <dd>{nombre_pieces}</dd>
      {#each stats_epaisseur as p}
      <dt>Nombre de pièces e={p.epaisseur}</dt>
      <dd>{p.nombre}</dd>
      <dt>Surface des pièces e={p.epaisseur}</dt>
      <dd>{p.surface}</dd>
      {/each}
    </dl>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
