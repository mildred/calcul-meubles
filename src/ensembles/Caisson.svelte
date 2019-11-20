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
    divisions: 1,
    profondeur: 300,
    epaisseur_montants: 24,
    largeur_montants: 50,
    largeur_traverses: 50,
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
    subdivisions: [
      {
      }
    ],
    montants_inter: [
    ],
    ...data.opt
  }

  // Migrate
  if (opt.profondeur_tenons_intermediaire) {
    opt.profondeur_tenons_cotes = opt.profondeur_tenons
    opt.profondeur_tenons = opt.profondeur_tenons_intermediaire
    delete opt.profondeur_tenons_intermediaire
  }
  if (opt.hauteur_traverses) {
    opt.largeur_traverses = opt.hauteur_traverses
    delete opt.hauteur_traverses
  }

  $: data.opt = opt

  let zoom = 0.5;

  $: montants = new Piece(
    opt.hauteur,
    opt.largeur_montants,
    opt.epaisseur_montants)

  $: traverses_cote = new Piece(
    opt.profondeur - 2 * (opt.largeur_montants - opt.profondeur_tenons_cotes),
    opt.largeur_traverses,
    opt.epaisseur_montants,
    opt.profondeur - 2 * (opt.largeur_montants))

  $: panneaux_cote = new Piece(
    opt.hauteur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure),
    opt.profondeur - 2 * (opt.largeur_traverses - opt.profondeur_rainure + opt.jeu_rainure),
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

  $: panneaux_dos = opt.subdivisions.map((s) => (new Piece(
    opt.hauteur - 2 * (opt.epaisseur_montants - opt.profondeur_rainure + opt.jeu_rainure),
    s.largeur + opt.epaisseur_montants - opt.largeur_montants / 2
              + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
    opt.epaisseur_panneau)))

  $: montants_inter = opt.montants_inter.map((m) => (new Piece(
    opt.hauteur - 2 * (opt.epaisseur_montants - m.longueur_tenon),
    opt.largeur_montants,
    opt.epaisseur_montants,
    opt.hauteur - 2 * opt.epaisseur_montants)))

  $: traverses_inter = opt.montants_inter.map((m) => (new Piece(
    opt.profondeur - 2 * (opt.largeur_montants - opt.profondeur_tenons_cotes),
    opt.largeur_traverses,
    opt.epaisseur_montants,
    opt.profondeur - 2 * opt.largeur_montants)))

  $: panneaux_inter = opt.montants_inter.map((m) => (new Piece(
    opt.hauteur - 2 * (opt.epaisseur_montants + opt.largeur_traverses)
                + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
    opt.profondeur - 2 * (opt.largeur_montants)
                   + 2 * (opt.profondeur_rainure - opt.jeu_rainure),
    opt.epaisseur_panneau)))

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
    ].concat(panneaux_dos.map((p, i) => (
      {
        nom: `Panneau dos n°${i+1}`,
        que: 1,
        piece: p,
      }
    ))).concat(montants_inter.map((m, i) => (
      {
        nom: `Montant intermédiaire face/dos n°${i+1}`,
        que: 2,
        piece: m,
      }
    ))).concat(traverses_inter.map((t, i) => (
      {
        nom: `Traverse intermédiaire dessus/dessous n°${i+1}`,
        que: 2,
        piece: t,
      }
    ))).concat(panneaux_inter.map((p, i) => (
      {
        nom: `Panneau intermédiaire n°${i+1}`,
        que: 1,
        piece: p,
      }
    )))

    $: {
      updateSubdivisions(opt)
      calculPortes(opt.portes, opt)
    }

    function calculLargeurSubdivisions(fixe){
      fixe = fixe || []
      let subdivisions = opt.subdivisions.filter((s, i) => (i < opt.divisions))
      let espace_a_repartir = opt.largeur - (opt.divisions+1) * opt.epaisseur_montants

      let espace_defini = subdivisions
        .map((s) => (s.largeur))
        .reduce((a,b) => (a+b), 0)
      console.log("calculLargeurSubdivisions(%o) defini = %o, a_repartir = %o", fixe, espace_defini, espace_a_repartir)
      if(espace_defini == espace_a_repartir) return;

      let subdivision_fixes = subdivisions.filter((s, i) => (fixe.includes(i)))
      if (subdivision_fixes.length >= opt.divisions)
        subdivision_fixes = []

      espace_a_repartir = espace_a_repartir - subdivision_fixes
        .map((s) => (s.largeur))
        .reduce((a,b) => (a+b), 0)

      let espace_reparti = Math.floor(espace_a_repartir / (opt.divisions - subdivision_fixes.length))

      for(let i = 0; i<opt.divisions; i++) {
        if(fixe.includes(i)) continue;
        espace_a_repartir = espace_a_repartir - espace_reparti
        if (espace_a_repartir < espace_reparti) {
          subdivisions[i].largeur = espace_reparti + espace_a_repartir
        } else {
          subdivisions[i].largeur = espace_reparti
        }
      }
    }

    function onChangeLargeurSubdivision(e){
      let i = parseInt(e.target.dataset.idx)
      console.log('onChangeLargeurSubdivision(i=%d)', i)
      opt.subdivisions[i].largeur = parseInt(e.target.value)
      if(i == opt.divisions - 1)
        return calculLargeurSubdivisions(Array.from(new Array(i+1).keys()).slice(1))
      else
        return calculLargeurSubdivisions(Array.from(new Array(i+1).keys()))
    }

    function updateSubdivisions(opt){
      opt.portes         = opt.portes.slice(0, opt.divisions)
      opt.subdivisions   = opt.subdivisions.slice(0, opt.divisions)
      opt.montants_inter = opt.montants_inter.slice(0, opt.divisions-1)

      for(let i = 0; i<opt.divisions; i++) {
        opt.portes[i] = {
          type: 'aucune',
          ...opt.portes[i],
        }
        opt.subdivisions[i] = {
          ...opt.subdivisions[i],
        }
      }
      for(let i = 0; i<opt.divisions - 1; i++) {
        opt.montants_inter[i] = {
          longueur_tenon: 20,
          ...opt.montants_inter[i],
        }
      }

      let subdivisions_fixes = opt.subdivisions
        .map((s, i) => s.largeur ? i : null)
        .filter((i) => i !== null)
      if(subdivisions_fixes.length < opt.subdivisions.length)
        calculLargeurSubdivisions(subdivisions_fixes)
    }

    function calculPortes(portes, opt){
      console.log(`Caisson(${path}) Recalcul des portes %o %o`, portes, opt)
      if(!data.children) data.children = []
      for(let i = 0; i<Math.max(portes.length, opt.divisions); i++) {
        let porte = portes[i]
        if(i >= opt.divisions || !porte || porte.type == 'aucune'){
          data.children[i] = {
            ...data.children[i],
            type: null,
          }
        } else {
          data.children[i] = {
            ...data.children[i],
            type: 'Porte',
            name: `${i+1}`,
            id:   i,
            forceopt: {
              largeur:
                (porte.type == 'total') ? opt.largeur :
                (porte.type == 'demi')  ? opt.largeur - opt.epaisseur_montants :
                0,
              hauteur:
                (porte.type == 'total') ? opt.hauteur :
                (porte.type == 'demi')  ? opt.hauteur - opt.epaisseur_montants :
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
  form > label {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    max-width: 30em;
  }
  form > label > *:first-child {
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
        {#each montants_inter as montant_inter, i}
          <rect class="outline"
            x="{opt.epaisseur_montants * (i+1) + opt.subdivisions.slice(0, i+1).map(s => s.largeur).reduce((a,b) => (a+b), 0)}"
            y="{traverses.epaisseur - montant_inter.longueur_tenon}"
            width="{montant_inter.epaisseur}"
            height="{montant_inter.longueur}" />
        {/each}
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
    <label><span>Divisions  : </span><input type=number bind:value={opt.divisions} min=1/></label>

    {#if opt.divisions > 1}
    <p>
      Répartition en largeur :
      {#each opt.subdivisions as subdivision, i}
      {#if i < opt.divisions}
      <input type=number min=0 style="width: 5em"
        data-idx={i} bind:value={subdivision.largeur}
        on:change={onChangeLargeurSubdivision}
        />
      {/if}
      {/each}
      mm
    </p>
    {/if}

    <hr/>

    <label><span>Épaisseur montants et traverses : </span><input type=number bind:value={opt.epaisseur_montants} min=0/> mm </label>
    <label><span>Épaisseur panneau : </span><input type=number bind:value={opt.epaisseur_panneau} min=0/> mm </label>
    <label><span>Largeur montants : </span><input type=number bind:value={opt.largeur_montants} min=0/> mm</label>
    <label><span>Largeur traverses cotés : </span><input type=number bind:value={opt.largeur_traverses} min=0/> mm</label>
    <label><span>Largeur traverses : </span><input type=number bind:value={opt.profondeur_traverses} min=0/> mm</label>
    <label><span>Profondeur tenons cotés : </span><input type=number bind:value={opt.profondeur_tenons_cotes} min=0/> mm</label>
    <label><span>Profondeur tenons : </span><input type=number bind:value={opt.profondeur_tenons} min=0/> mm</label>
    <label><span>Profondeur rainure : </span><input type=number bind:value={opt.profondeur_rainure} min=0/> mm</label>
    <label><span>Jeu panneau / rainure : </span><input type=number bind:value={opt.jeu_rainure} min=0/> mm</label>

    <p>Montants intermédiaires :</p>
    <table>
      <tr>
        <th></th>
        <th>Longueur tenon montant</th>
      </tr>
      {#each opt.montants_inter as montant_inter, i}
      {#if i < opt.divisions - 1}
      <tr>
        <td>Montant intermédiaire {i+1}</td>
        <td>
          <input type=number bind:value={opt.montants_inter[i].longueur_tenon} min=0/> mm
        </td>
      </tr>
      {/if}
      {/each}
    </table>

    <p>Portes :</p>
    <table>
      <tr>
        <th></th>
        <th>Type</th>
      </tr>
      {#each opt.portes as porte, i}
      {#if i < opt.divisions}
      <tr>
        <td>Porte {i+1}</td>
        <td>
          <select bind:value={opt.portes[i].type}>
            <option value="aucune">Aucune</option>
            <option value="total">Recouvrement total</option>
            <option value="demi">Recouvrement à moitié</option>
          </select>
        </td>
      </tr>
      {/if}
      {/each}
    </table>

    </form>

    <hr class="clear"/>
    <ListeDebit pieces={pieces} />
  </div>
</Component>
