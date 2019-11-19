<script>
  import Component from '../Component.svelte';
  import Piece from '../pieces/piece.js';
  import ListeDebit from '../ListeDebit.svelte'

  export let path
  export let initdata = {}

  let data = {...initdata}

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
    portes: [
      {
        type: 'aucune'
      }
    ],
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
    opt.hauteur,
    opt.largeur_montants,
    opt.epaisseur_montants)

  $: traverses_cote = new Piece(
    opt.profondeur - 2 * (opt.largeur_montants - opt.profondeur_tenons_cotes),
    opt.hauteur_traverses,
    opt.epaisseur_montants,
    opt.profondeur - 2 * (opt.largeur_montants))

  $: panneaux_cote = new Piece(
    opt.hauteur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure),
    opt.profondeur - 2 * (opt.hauteur_traverses - opt.profondeur_rainure + opt.jeu_rainure),
    opt.epaisseur_panneau)

  $: traverses = new Piece(
    opt.largeur - 2 * (opt.epaisseur_montants - opt.profondeur_tenons),
    opt.profondeur_traverses,
    opt.epaisseur_montants,
    opt.largeur - 2 * opt.epaisseur_montants)

  $: panneaux_haut_bas = new Piece(
    opt.largeur - 2 * (opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure),
    opt.profondeur - 2 * (opt.profondeur_traverses - opt.profondeur_rainure + opt.jeu_rainure),
    opt.epaisseur_panneau)

  $: panneau_dos = new Piece(
    opt.hauteur - 2 * (opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure),
    opt.largeur - 2 * (opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure),
    opt.epaisseur_panneau)

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

    $: calculPortes(opt.portes, opt)

    function calculPortes(portes, opt){
      console.log(`Caisson(${path}) Recalcul des portes %o %o %o`, portes, opt)
      if(!data.children) data.children = []
      for(let i = 0; i<portes.length; i++) {
        let type = portes[i].type
        if(type == 'aucune'){
          data.children[i] = {}
        } else {
          data.children[i] = {
            type: 'Porte',
            name: `${i+1}`,
            id:   i,
            ...data.children[i],
            forceopt: {
              largeur:
                (type == 'total') ? opt.largeur :
                (type == 'demi')  ? opt.largeur - opt.epaisseur_montants :
                0,
              hauteur:
                (type == 'total') ? opt.hauteur :
                (type == 'demi')  ? opt.hauteur - opt.epaisseur_montants :
                0,
            },
          }
        }
      }
    }

    function addPorteRecouvrementTotal(){
      let name = "Porte recouvrement total"
      if(!data.children) data.children = []
      let id = data.children.length
      data.children = [...data.children, {
        type: 'Porte',
        name: name,
        id:   id,
        opt: {
          largeur: opt.largeur,
          hauteur: opt.hauteur,
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

<Component bind:data={data} path={path} on:datachange>
  <div class="main">

    <h1>Calcul d'un caisson</h1>
    <h2>{data.name}</h2>

    <div style="float: left">
    <p>Zoom : <input type=range bind:value={zoom} min=0 max=1 step=.05> {zoom*100} %</p>
    <svg
        width="{5 + zoom*opt.largeur + 5 + zoom*opt.profondeur + 5}"
        height="{5 + zoom*opt.hauteur + 5 + zoom*opt.profondeur + 5}">
      <g transform="translate(5, 5) scale({zoom} {zoom})">
        <rect class="outline"
          x="0"
          y="0"
          width="{montants.epaisseur}"
          height="{montants.longueur}" />
        <rect class="outline"
          x="{opt.largeur - montants.epaisseur}"
          y="0"
          width="{montants.epaisseur}"
          height="{montants.longueur}" />
        <rect class="outline"
          x="{montants.epaisseur - opt.profondeur_tenons}"
          y="0"
          width="{traverses.longueur}"
          height="{traverses.epaisseur}" />
        <rect class="outline"
          x="{montants.epaisseur - opt.profondeur_tenons}"
          y="{opt.hauteur - traverses.epaisseur}"
          width="{traverses.longueur}"
          height="{traverses.epaisseur}" />
      </g>
      <g transform="translate({5 + zoom*opt.largeur + 10}, 5) scale({zoom} {zoom})">
        <rect class="outline"
          x="0"
          y="0"
          width="{montants.largeur}"
          height="{montants.longueur}" />
        <rect class="outline"
          x="{opt.profondeur - montants.largeur}"
          y="0"
          width="{montants.largeur}"
          height="{montants.longueur}" />
        <rect class="outline"
          x="{montants.largeur - opt.profondeur_tenons_cotes}"
          y="0"
          width="{traverses_cote.longueur}"
          height="{traverses_cote.largeur}" />
        <rect class="outline"
          x="{montants.largeur - opt.profondeur_tenons_cotes}"
          y="{opt.hauteur - traverses_cote.largeur}"
          width="{traverses_cote.longueur}"
          height="{traverses_cote.largeur}" />
      </g>
      <g transform="translate(5, {5 + zoom*opt.hauteur + 5}) scale({zoom} {zoom})">
        <!-- traverses -->
        <rect class="outline"
          x="{montants.epaisseur - opt.profondeur_tenons}"
          y="0"
          width="{traverses.longueur}"
          height="{traverses.epaisseur}" />
        <rect class="outline"
          x="{montants.epaisseur - opt.profondeur_tenons}"
          y="{opt.profondeur - traverses.epaisseur}"
          width="{traverses.longueur}"
          height="{traverses.epaisseur}" />

        <!-- traverses cotés -->
        <rect class="outline"
          x="0"
          y="{montants.largeur - opt.profondeur_tenons_cotes}"
          width="{traverses_cote.epaisseur}"
          height="{traverses_cote.longueur}" />
        <rect class="outline"
          x="{opt.largeur - traverses_cote.epaisseur}"
          y="{montants.largeur - opt.profondeur_tenons_cotes}"
          width="{traverses_cote.epaisseur}"
          height="{traverses_cote.longueur}" />

        <!-- montants -->
        <rect class="outline"
          x="0"
          y="0"
          width="{montants.epaisseur}" height="{montants.largeur}" />
        <rect class="outline"
          x="{opt.largeur - montants.epaisseur}"
          y="0"
          width="{montants.epaisseur}" height="{montants.largeur}" />
        <rect class="outline"
          x="{opt.largeur - montants.epaisseur}"
          y="{opt.profondeur - montants.largeur}"
          width="{montants.epaisseur}" height="{montants.largeur}" />
        <rect class="outline"
          x="0"
          y="{opt.profondeur - montants.largeur}"
          width="{montants.epaisseur}" height="{montants.largeur}" />
      </g>
    </svg>
    </div>

    <form style="float: left">
    <label><span>Hauteur    : </span><input type=number bind:value={opt.hauteur} min=0/> mm </label>
    <label><span>Largeur    : </span><input type=number bind:value={opt.largeur} min=0/> mm</label>
    <label><span>Profondeur : </span><input type=number bind:value={opt.profondeur} min=0/> mm </label>

    <hr/>

    <label><span>Épaisseur montants et traverses : </span><input type=number bind:value={opt.epaisseur_montants} min=0/> mm </label>
    <label><span>Épaisseur panneau : </span><input type=number bind:value={opt.epaisseur_panneau} min=0/> mm </label>
    <label><span>Largeur montants : </span><input type=number bind:value={opt.largeur_montants} min=0/> mm</label>
    <label><span>Largeur traverses cotés : </span><input type=number bind:value={opt.hauteur_traverses} min=0/> mm</label>
    <label><span>Largeur traverses : </span><input type=number bind:value={opt.profondeur_traverses} min=0/> mm</label>
    <label><span>Profondeur tenons cotés : </span><input type=number bind:value={opt.profondeur_tenons_cotes} min=0/> mm</label>
    <label><span>Profondeur tenons : </span><input type=number bind:value={opt.profondeur_tenons} min=0/> mm</label>
    <label><span>Profondeur rainure : </span><input type=number bind:value={opt.profondeur_rainure} min=0/> mm</label>
    <label><span>Jeu panneau / rainure : </span><input type=number bind:value={opt.jeu_rainure} min=0/> mm</label>

    <label>
      <span>Type de porte : </span>
      <select bind:value={opt.portes[0].type}>
        <option value="aucune">Aucune</option>
        <option value="total">Recouvrement total</option>
        <option value="demi">Recouvrement à moitié</option>
      </select>
    </label>
    </form>

    <hr class="clear"/>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
