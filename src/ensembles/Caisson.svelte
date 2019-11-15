<script>
  import Piece from '../pieces/piece.js';
  import ListeDebit from '../ListeDebit.svelte'

  export let data = {}
  data = {
    opt: {
      type:  'contre-profil',
      largeur: 400,
      hauteur: 600,
      profondeur: 300,
      epaisseur: 18,
      largeur_montants: 50,
      hauteur_traverses: 50,
      profondeur_traverses: 50,
      profondeur_tenons: 30,
      profondeur_tenons_intermediaire: 15,
      profondeur_platebande: 10,
      jeu_rainure: 2,
      epaisseur_panneau: 10,
      ...data.opts
    },
    ...data
  }

  $: montants = new Piece(
    data.opt.hauteur,
    data.opt.largeur_montants,
    data.opt.epaisseur)

  $: traverses_cote = new Piece(
    data.opt.profondeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_tenons),
    data.opt.hauteur_traverses,
    data.opt.epaisseur)

  $: panneaux_cote = new Piece(
    data.opt.hauteur - 2 * (data.opt.largeur_montants - data.opt.profondeur_platebande + data.opt.jeu_rainure),
    data.opt.profondeur - 2 * (data.opt.hauteur_traverses - data.opt.profondeur_platebande + data.opt.jeu_rainure),
    data.opt.epaisseur_panneau)

  $: traverses_inter = new Piece(
    data.opt.largeur - 2 * (data.opt.epaisseur - data.opt.profondeur_tenons_intermediaire),
    data.opt.profondeur_traverses,
    data.opt.epaisseur)

  $: panneaux_haut_bas = new Piece(
    data.opt.largeur - 2 * (data.opt.epaisseur - data.opt.profondeur_platebande + data.opt.jeu_rainure),
    data.opt.profondeur - 2 * (data.opt.profondeur_traverses - data.opt.profondeur_platebande + data.opt.jeu_rainure),
    data.opt.epaisseur_panneau)

  $: panneau_fond = new Piece(
    data.opt.hauteur - 2 * (data.opt.epaisseur - data.opt.profondeur_platebande + data.opt.jeu_rainure),
    data.opt.largeur - 2 * (data.opt.epaisseur - data.opt.profondeur_platebande + data.opt.jeu_rainure),
    data.opt.epaisseur_panneau)

  $: pieces = [
      {
        nom: 'Montants',
        que: 4,
        piece: montants
      },
      {
        nom: 'Traverses coté',
        que: 4,
        piece: traverses_cote
      },
      {
        nom: 'Traverses intermédiaires',
        que: 4,
        piece: traverses_inter
      },
      {
        nom: 'Panneaux coté',
        que: 2,
        piece: panneaux_cote
      },
      {
        nom: 'Panneaux haut/bas',
        que: 2,
        piece: panneaux_haut_bas
      },
      {
        nom: 'Panneau fond',
        que: 1,
        piece: panneau_fond
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
</style>

<div class="main">

  <h1>Calcul d'un caisson</h1>
  <h2>{data.name}</h2>

  <form>
  <label><span>Largeur    : </span><input type=number bind:value={data.opt.largeur} min=0/> mm</label>
  <label><span>Hauteur    : </span><input type=number bind:value={data.opt.hauteur} min=0/> mm </label>
  <label><span>Profondeur : </span><input type=number bind:value={data.opt.profondeur} min=0/> mm </label>

  <hr/>

  <label><span>Épaisseur : </span><input type=number bind:value={data.opt.epaisseur} min=0/> mm </label>
  <label><span>Épaisseur panneau : </span><input type=number bind:value={data.opt.epaisseur_panneau} min=0/> mm </label>
  <label><span>Largeur montants : </span><input type=number bind:value={data.opt.largeur_montants} min=0/> mm</label>
  <label><span>Hauteur traverses : </span><input type=number bind:value={data.opt.hauteur_traverses} min=0/> mm</label>
  <label><span>Profondeur traverses : </span><input type=number bind:value={data.opt.profondeur_traverses} min=0/> mm</label>
  <label><span>Profondeur tenons : </span><input type=number bind:value={data.opt.profondeur_tenons} min=0/> mm</label>
  <label><span>Profondeur tenons intermédiaire : </span><input type=number bind:value={data.opt.profondeur_tenons_intermediaire} min=0/> mm</label>
  <label><span>Profondeur platebandes : </span><input type=number bind:value={data.opt.profondeur_platebande} min=0/> mm</label>
  </form>

  <hr class="clear"/>
  <ListeDebit pieces={pieces} />
</div>
