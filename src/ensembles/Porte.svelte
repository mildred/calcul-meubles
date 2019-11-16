<script>
  import Component from '../Component.svelte';
  import Cote from '../draw/Cote.svelte';
  import Piece from '../pieces/piece.js';
  import ListeDebit from '../ListeDebit.svelte'

  export let path
  export let data = {}
  data = {
    opt: {
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
      ...data.opts
    },
    ...data
  }

  let zoom = 0.5

  $: montant = new Piece(data.opt.hauteur, data.opt.largeur_montants, data.opt.epaisseur)
  $: traverse =
    (data.opt.type == 'contre-profil')  ? new Piece(data.opt.largeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_profil), data.opt.largeur_traverses, data.opt.epaisseur):
    (data.opt.type == 'tenon-mortaise') ? new Piece(data.opt.largeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_tenons), data.opt.largeur_traverses, data.opt.epaisseur):
    null;
  $: panneau =
    (data.opt.type == 'contre-profil')  ? new Piece(
      data.opt.largeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_rainure + data.opt.jeu_rainure),
      data.opt.hauteur - 2 * (data.opt.largeur_traverses - data.opt.profondeur_rainure + data.opt.jeu_rainure),
      data.opt.epaisseur_panneau):
    (data.opt.type == 'tenon-mortaise') ? new Piece(
      data.opt.largeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_rainure + data.opt.jeu_rainure),
      data.opt.hauteur - 2 * (data.opt.largeur_traverses - data.opt.profondeur_rainure + data.opt.jeu_rainure),
      data.opt.epaisseur_panneau):
    null;

  $: traverse_xpos =
    (data.opt.type == 'contre-profil')  ? data.opt.largeur_montants - data.opt.profondeur_profil:
    (data.opt.type == 'tenon-mortaise') ? data.opt.largeur_montants - data.opt.profondeur_tenons:
    0;

  $: pieces = [
      {
        nom: 'Montants',
        que: 2,
        piece: montant
      },
      {
        nom: 'Traverses',
        que: 2,
        piece: traverse
      },
      {
        nom: 'Panneau',
        que: 1,
        piece: panneau
      }
    ]
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

<Component data={data} path={path}>
  <div class="main">

    <h1>Calcul d'une porte</h1>
    <h2>{data.name}</h2>

    <div style="float: left">
    <!--<img src="porte.svg" />-->
    <p>Zoom : <input type=range bind:value={zoom} min=0 max=1 step=.05> {zoom*100} %</p>
    <svg
        width="{zoom*data.opt.largeur + 25}"
        height="{zoom*data.opt.hauteur + 65}">
      <g transform="translate(20, 0)">
        <Cote zoom={zoom} dim={[
            {
              text: "largeur: ",
              start: 0,
              length: data.opt.largeur,
              row: 2,
            },
            {
              text: "lon. traverse: ",
              start: traverse_xpos,
              length: traverse.longueur,
              row: 1,
            },
            {
              start: 0,
              length: montant.largeur,
              row: 0,
            },
            {
              start: data.opt.largeur-montant.largeur,
              length: montant.largeur,
              row: 0,
            }
          ]} />
      </g>
      <g transform="translate(0, 60)">
        <Cote zoom={zoom} pos=left dim={[
            {
              text: "hauteur: ",
              start: 0,
              length: data.opt.hauteur,
              row: 0,
            }
          ]} />
      </g>
      <g transform="translate(20, 60) scale({zoom} {zoom})">
        <rect
          x="{(montant.largeur - data.opt.profondeur_rainure + data.opt.jeu_rainure)}"
          y="{(traverse.largeur - data.opt.profondeur_rainure + data.opt.jeu_rainure)}"
          width="{panneau.longueur}"
          height="{panneau.largeur}"
          style="fill:rgb(255,255,255);fill-opacity:0.5;stroke-width:1;stroke:rgb(0,0,0)"/>
        <rect
          x="{traverse_xpos}"
          y="0"
          width="{traverse.longueur}"
          height="{traverse.largeur}"
          style="fill:rgb(255,255,255);fill-opacity:0.5;stroke-width:1;stroke:rgb(0,0,0)"/>
        <rect
          x="{traverse_xpos}"
          y="{(data.opt.hauteur-montant.largeur)}"
          width="{traverse.longueur}"
          height="{traverse.largeur}"
          style="fill:rgb(255,255,255);fill-opacity:0.5;stroke-width:1;stroke:rgb(0,0,0)"/>
        <rect
          x="0"
          y="0"
          width="{montant.largeur}"
          height="{montant.longueur}"
          style="fill:rgb(255,255,255);fill-opacity:0.5;stroke-width:1;stroke:rgb(0,0,0)"/>
        <rect
          x="{(data.opt.largeur-montant.largeur)}"
          y="0"
          width="{montant.largeur}"
          height="{montant.longueur}"
          style="fill:rgb(255,255,255);fill-opacity:0.5;stroke-width:1;stroke:rgb(0,0,0)"/>
      </g>
    </svg>
    </div>

    <form>
    <label>
      <span>Type : </span>
      <select bind:value={data.opt.type}>
        <option value="tenon-mortaise">tenon et mortaise</option>
        <option value="contre-profil">contre profil</option>
      </select>
    </label>
    <label><span>Largeur : </span><input type=number bind:value={data.opt.largeur} min=0/> mm</label>
    <label><span>Hauteur : </span><input type=number bind:value={data.opt.hauteur} min=0/> mm </label>
    <label><span>Épaisseur : </span><input type=number bind:value={data.opt.epaisseur} min=0/> mm </label>
    <label><span>Épaisseur panneau : </span><input type=number bind:value={data.opt.epaisseur_panneau} min=0/> mm </label>
    <label><span>Largeur montants : </span><input type=number bind:value={data.opt.largeur_montants} min=0/> mm</label>
    <label><span>Hauteur traverses : </span><input type=number bind:value={data.opt.largeur_traverses} min=0/> mm</label>
    <label><span>Profondeur rainure : </span><input type=number bind:value={data.opt.profondeur_rainure} min=0/> mm</label>
    <label><span>Jeu panneau / rainure : </span><input type=number bind:value={data.opt.jeu_rainure} min=0/> mm</label>
    {#if data.opt.type == 'tenon-mortaise' }
    <label><span>Profondeur tenons : </span><input type=number bind:value={data.opt.profondeur_tenons} min=0/> mm</label>
    {:else if data.opt.type == 'contre-profil' }
    <label><span>Profondeur profil : </span><input type=number bind:value={data.opt.profondeur_rainure} min=0/> mm</label>
    {/if}
    </form>

    <hr class="clear"/>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
