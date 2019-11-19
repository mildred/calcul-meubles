<script>
  import Component from '../Component.svelte';
  import Piece from '../pieces/piece.js';
  import ListeDebit from '../ListeDebit.svelte'

  export let path
  export let data = {}

  let opt = {
    type:  'contre-profil',
    largeur: 400,
    hauteur: 600,
    profondeur: 300,
    epaisseur_montants: 24,
    largeur_montants: 50,
    hauteur_traverses: 50,
    profondeur_traverses: 50,
    profondeur_tenons_cotes: 30,
    profondeur_tenons: 20,
    profondeur_rainure: 10,
    jeu_rainure: 1,
    epaisseur_panneau: 16,
    ...data.opt
  }

  // Migrate
  if (opt.profondeur_tenons_intermediaire) {
    opt.profondeur_tenons_cotes = opt.profondeur_tenons
    opt.profondeur_tenons = opt.profondeur_tenons_intermediaire
    delete opt.profondeur_tenons_intermediaire
  }

  $: data.opt = opt

  let zoom = 0.5;

  $: montants = new Piece(
    data.opt.hauteur,
    data.opt.largeur_montants,
    data.opt.epaisseur_montants)

  $: traverses_cote = new Piece(
    data.opt.profondeur - 2 * (data.opt.largeur_montants - data.opt.profondeur_tenons_cotes),
    data.opt.hauteur_traverses,
    data.opt.epaisseur_montants,
    data.opt.profondeur - 2 * (data.opt.largeur_montants))

  $: panneaux_cote = new Piece(
    data.opt.hauteur - 2 * (data.opt.largeur_montants - data.opt.profondeur_rainure + data.opt.jeu_rainure),
    data.opt.profondeur - 2 * (data.opt.hauteur_traverses - data.opt.profondeur_rainure + data.opt.jeu_rainure),
    data.opt.epaisseur_panneau)

  $: traverses = new Piece(
    data.opt.largeur - 2 * (data.opt.epaisseur_montants - data.opt.profondeur_tenons),
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
        nom: 'Traverses',
        que: 4,
        piece: traverses
      },
      {
        nom: 'Traverses coté',
        que: 4,
        piece: traverses_cote
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

    function addPorteRecouvrementTotal(){
      let name = "Porte recouvrement total"
      if(!data.children) data.children = []
      let id = data.children.length
      data.children = [...data.children, {
        type: 'Porte',
        name: name,
        id:   id,
        opt: {
          largeur: data.opt.largeur,
          hauteur: data.opt.hauteur,
        }
      }]
    }
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
  svg rect.outline {
    fill: rgb(255,255,255);
    fill-opacity: 0.5;
    stroke-width: 1;
    stroke:rgb(0,0,0);
  }
</style>

<Component bind:data={data} path={path}>
  <div class="main">

    <h1>Calcul d'un caisson</h1>
    <h2>{data.name}</h2>

    <div style="float: left">
    <p>Zoom : <input type=range bind:value={zoom} min=0 max=1 step=.05> {zoom*100} %</p>
    <svg
        width="{5 + zoom*data.opt.largeur + 5 + zoom*data.opt.profondeur + 5}"
        height="{5 + zoom*data.opt.hauteur + 5 + zoom*data.opt.profondeur + 5}">
      <g transform="translate(5, 5) scale({zoom} {zoom})">
        <rect class="outline"
          x="0"
          y="0"
          width="{montants.epaisseur}"
          height="{montants.longueur}" />
        <rect class="outline"
          x="{data.opt.largeur - montants.epaisseur}"
          y="0"
          width="{montants.epaisseur}"
          height="{montants.longueur}" />
        <rect class="outline"
          x="{montants.epaisseur - data.opt.profondeur_tenons}"
          y="0"
          width="{traverses.longueur}"
          height="{traverses.epaisseur}" />
        <rect class="outline"
          x="{montants.epaisseur - data.opt.profondeur_tenons}"
          y="{data.opt.hauteur - traverses.epaisseur}"
          width="{traverses.longueur}"
          height="{traverses.epaisseur}" />
      </g>
      <g transform="translate({5 + zoom*data.opt.largeur + 10}, 5) scale({zoom} {zoom})">
        <rect class="outline"
          x="0"
          y="0"
          width="{montants.largeur}"
          height="{montants.longueur}" />
        <rect class="outline"
          x="{data.opt.profondeur - montants.largeur}"
          y="0"
          width="{montants.largeur}"
          height="{montants.longueur}" />
        <rect class="outline"
          x="{montants.largeur - data.opt.profondeur_tenons_cotes}"
          y="0"
          width="{traverses_cote.longueur}"
          height="{traverses_cote.largeur}" />
        <rect class="outline"
          x="{montants.largeur - data.opt.profondeur_tenons_cotes}"
          y="{data.opt.hauteur - traverses_cote.largeur}"
          width="{traverses_cote.longueur}"
          height="{traverses_cote.largeur}" />
      </g>
      <g transform="translate(5, {5 + zoom*data.opt.hauteur + 5}) scale({zoom} {zoom})">
        <!-- traverses -->
        <rect class="outline"
          x="{montants.epaisseur - data.opt.profondeur_tenons}"
          y="0"
          width="{traverses.longueur}"
          height="{traverses.epaisseur}" />
        <rect class="outline"
          x="{montants.epaisseur - data.opt.profondeur_tenons}"
          y="{data.opt.profondeur - traverses.epaisseur}"
          width="{traverses.longueur}"
          height="{traverses.epaisseur}" />

        <!-- traverses cotés -->
        <rect class="outline"
          x="0"
          y="{montants.largeur - data.opt.profondeur_tenons_cotes}"
          width="{traverses_cote.epaisseur}"
          height="{traverses_cote.longueur}" />
        <rect class="outline"
          x="{data.opt.largeur - traverses_cote.epaisseur}"
          y="{montants.largeur - data.opt.profondeur_tenons_cotes}"
          width="{traverses_cote.epaisseur}"
          height="{traverses_cote.longueur}" />

        <!-- montants -->
        <rect class="outline"
          x="0"
          y="0"
          width="{montants.epaisseur}" height="{montants.largeur}" />
        <rect class="outline"
          x="{data.opt.largeur - montants.epaisseur}"
          y="0"
          width="{montants.epaisseur}" height="{montants.largeur}" />
        <rect class="outline"
          x="{data.opt.largeur - montants.epaisseur}"
          y="{data.opt.profondeur - montants.largeur}"
          width="{montants.epaisseur}" height="{montants.largeur}" />
        <rect class="outline"
          x="0"
          y="{data.opt.profondeur - montants.largeur}"
          width="{montants.epaisseur}" height="{montants.largeur}" />
      </g>
    </svg>
    </div>

    <form style="float: left">
    <label><span>Hauteur    : </span><input type=number bind:value={data.opt.hauteur} min=0/> mm </label>
    <label><span>Largeur    : </span><input type=number bind:value={data.opt.largeur} min=0/> mm</label>
    <label><span>Profondeur : </span><input type=number bind:value={data.opt.profondeur} min=0/> mm </label>

    <hr/>

    <label><span>Épaisseur montants et traverses : </span><input type=number bind:value={data.opt.epaisseur_montants} min=0/> mm </label>
    <label><span>Épaisseur panneau : </span><input type=number bind:value={data.opt.epaisseur_panneau} min=0/> mm </label>
    <label><span>Largeur montants : </span><input type=number bind:value={data.opt.largeur_montants} min=0/> mm</label>
    <label><span>Largeur traverses cotés : </span><input type=number bind:value={data.opt.hauteur_traverses} min=0/> mm</label>
    <label><span>Largeur traverses : </span><input type=number bind:value={data.opt.profondeur_traverses} min=0/> mm</label>
    <label><span>Profondeur tenons cotés : </span><input type=number bind:value={data.opt.profondeur_tenons_cotes} min=0/> mm</label>
    <label><span>Profondeur tenons : </span><input type=number bind:value={data.opt.profondeur_tenons} min=0/> mm</label>
    <label><span>Profondeur rainure : </span><input type=number bind:value={data.opt.profondeur_rainure} min=0/> mm</label>
    <label><span>Jeu panneau / rainure : </span><input type=number bind:value={data.opt.jeu_rainure} min=0/> mm</label>

    <button on:click={e => addPorteRecouvrementTotal()}>Nouvelle porte recouvrement total</button>
    </form>

    <hr class="clear"/>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
