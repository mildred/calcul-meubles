<script>
  import Component from '../Component.svelte';
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
      hauteur_traverses: 50,
      profondeur_tenons: 30,
      profondeur_platebande: 10,
      profondeur_profil: 15,
      jeu_rainure: 2,
      epaisseur_panneau: 10,
      ...data.opts
    },
    ...data
  }

  $: montant = new Piece(data.opt.hauteur, data.opt.largeur_montants, data.opt.epaisseur)
  $: traverse =
    (data.opt.type == 'contre-profil')  ? new Piece(data.opt.largeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_profil), data.opt.hauteur_traverses, data.opt.epaisseur):
    (data.opt.type == 'tenon-mortaise') ? new Piece(data.opt.largeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_tenons), data.opt.hauteur_traverses, data.opt.epaisseur):
    null;
  $: panneau =
    (data.opt.type == 'contre-profil')  ? new Piece(
      data.opt.largeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_platebande + data.opt.jeu_rainure),
      data.opt.hauteur - 2 * (data.opt.hauteur_traverses - data.opt.profondeur_platebande + data.opt.jeu_rainure),
      data.opt.epaisseur_panneau):
    (data.opt.type == 'tenon-mortaise') ? new Piece(
      data.opt.largeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_platebande + data.opt.jeu_rainure),
      data.opt.hauteur - 2 * (data.opt.hauteur_traverses - data.opt.profondeur_platebande + data.opt.jeu_rainure),
      data.opt.epaisseur_panneau):
    null;

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

    <img src="porte.svg" style="float: left" />

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
    <label><span>Hauteur traverses : </span><input type=number bind:value={data.opt.hauteur_traverses} min=0/> mm</label>
    {#if data.opt.type == 'tenon-mortaise' }
    <label><span>Profondeur tenons : </span><input type=number bind:value={data.opt.profondeur_tenons} min=0/> mm</label>
    <label><span>Profondeur platebandes : </span><input type=number bind:value={data.opt.profondeur_platebande} min=0/> mm</label>
    {:else if data.opt.type == 'contre-profil' }
    <label><span>Profondeur profil : </span><input type=number bind:value={data.opt.profondeur_platebande} min=0/> mm</label>
    {/if}
    </form>

    <hr class="clear"/>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
