<script>
  import { onMount } from 'svelte';
  import Component from '../Component.svelte';
  import Cote from '../draw/Cote.svelte';
  import Piece from '../pieces/piece.js';
  import SVGPiece from '../pieces/SVGPiece.svelte';
  import ListeDebit from '../ListeDebit.svelte'

  export let path
  export let initdata = {}

  let data = {...initdata}

  export let opt = {
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
    ...data.opt,
  }

  $: data.opt = opt
  $: opt = {...opt, ...initdata.forceopt}

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
      <select bind:value={opt.type}>
        <option value="tenon-mortaise">tenon et mortaise</option>
        <option value="contre-profil">contre profil</option>
      </select>
    </label>
    <label><span>Largeur : </span><input type=number bind:value={opt.largeur} min=0/> mm</label>
    <label><span>Hauteur : </span><input type=number bind:value={opt.hauteur} min=0/> mm </label>
    <label><span>Épaisseur : </span><input type=number bind:value={opt.epaisseur} min=0/> mm </label>
    <label><span>Épaisseur panneau : </span><input type=number bind:value={opt.epaisseur_panneau} min=0/> mm </label>
    <label><span>Largeur montants : </span><input type=number bind:value={opt.largeur_montants} min=0/> mm</label>
    <label><span>Hauteur traverses : </span><input type=number bind:value={opt.largeur_traverses} min=0/> mm</label>
    <label><span>Profondeur rainure : </span><input type=number bind:value={opt.profondeur_rainure} min=0/> mm</label>
    <label><span>Jeu panneau / rainure : </span><input type=number bind:value={opt.jeu_rainure} min=0/> mm</label>
    {#if opt.type == 'tenon-mortaise' }
    <label><span>Profondeur tenons : </span><input type=number bind:value={opt.profondeur_tenons} min=0/> mm</label>
    {:else if opt.type == 'contre-profil' }
    <label><span>Profondeur profil : </span><input type=number bind:value={opt.profondeur_rainure} min=0/> mm</label>
    {/if}
    <label><input type="checkbox" bind:checked={opt.inclure_panneau} /> Inclure le paneau</label>
    </form>

    <hr class="clear"/>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
