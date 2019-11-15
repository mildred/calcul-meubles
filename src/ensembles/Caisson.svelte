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
      profondeur: 300,
      epaisseur_montants: 24,
      largeur_montants: 50,
      hauteur_traverses: 50,
      profondeur_traverses: 50,
      profondeur_tenons: 30,
      profondeur_tenons_intermediaire: 20,
      profondeur_rainure: 10,
      jeu_rainure: 1,
      epaisseur_panneau: 16,
      ...data.opts
    },
    ...data
  }

  $: montants = new Piece(
    data.opt.hauteur,
    data.opt.largeur_montants,
    data.opt.epaisseur_montants)

  $: traverses_cote = new Piece(
    data.opt.profondeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_tenons),
    data.opt.hauteur_traverses,
    data.opt.epaisseur_montants,
    data.opt.profondeur - 2 * (data.opt.largeur_montants))

  $: panneaux_cote = new Piece(
    data.opt.hauteur - 2 * (data.opt.largeur_montants - data.opt.profondeur_rainure + data.opt.jeu_rainure),
    data.opt.profondeur - 2 * (data.opt.hauteur_traverses - data.opt.profondeur_rainure + data.opt.jeu_rainure),
    data.opt.epaisseur_panneau)

  $: traverses_inter = new Piece(
    data.opt.largeur - 2 * (data.opt.epaisseur_montants - data.opt.profondeur_tenons_intermediaire),
    data.opt.profondeur_traverses,
    data.opt.epaisseur_montants,
    data.opt.largeur - 2 * data.opt.epaisseur_montants)

  $: panneaux_haut_bas = new Piece(
    data.opt.largeur - 2 * (data.opt.epaisseur_montants - data.opt.profondeur_rainure + data.opt.jeu_rainure),
    data.opt.profondeur - 2 * (data.opt.profondeur_traverses - data.opt.profondeur_rainure + data.opt.jeu_rainure),
    data.opt.epaisseur_panneau)

  $: panneau_dos = new Piece(
    data.opt.hauteur - 2 * (data.opt.epaisseur_montants - data.opt.profondeur_rainure + data.opt.jeu_rainure),
    data.opt.largeur - 2 * (data.opt.epaisseur_montants - data.opt.profondeur_rainure + data.opt.jeu_rainure),
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
        nom: 'Panneaux dessus/dessous',
        que: 2,
        piece: panneaux_haut_bas
      },
      {
        nom: 'Panneau dos',
        que: 1,
        piece: panneau_dos
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

<Component data={data} path={path}>
  <div class="main">

    <h1>Calcul d'un caisson</h1>
    <h2>{data.name}</h2>

    <form>
    <label><span>Hauteur    : </span><input type=number bind:value={data.opt.hauteur} min=0/> mm </label>
    <label><span>Largeur    : </span><input type=number bind:value={data.opt.largeur} min=0/> mm</label>
    <label><span>Profondeur : </span><input type=number bind:value={data.opt.profondeur} min=0/> mm </label>

    <hr/>

    <label><span>Épaisseur montants et traverses : </span><input type=number bind:value={data.opt.epaisseur_montants} min=0/> mm </label>
    <label><span>Épaisseur panneau : </span><input type=number bind:value={data.opt.epaisseur_panneau} min=0/> mm </label>
    <label><span>Largeur montants : </span><input type=number bind:value={data.opt.largeur_montants} min=0/> mm</label>
    <label><span>Largeur traverses cotés : </span><input type=number bind:value={data.opt.hauteur_traverses} min=0/> mm</label>
    <label><span>Largeur traverses : </span><input type=number bind:value={data.opt.profondeur_traverses} min=0/> mm</label>
    <label><span>Profondeur tenons : </span><input type=number bind:value={data.opt.profondeur_tenons} min=0/> mm</label>
    <label><span>Profondeur tenons intermédiaire : </span><input type=number bind:value={data.opt.profondeur_tenons_intermediaire} min=0/> mm</label>
    <label><span>Profondeur rainure : </span><input type=number bind:value={data.opt.profondeur_rainure} min=0/> mm</label>
    <label><span>Jeu panneau / rainure : </span><input type=number bind:value={data.opt.jeu_rainure} min=0/> mm</label>
    </form>

    <hr class="clear"/>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
