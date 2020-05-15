<script>
  import { getContext } from 'svelte';
  import { reduceToObject } from './utils.js';
  import Group from './pieces/Group.js';
  import Estimation from './Estimation.svelte'

  export let pieces = []
  export let merge = true
  export let estimations

  let separer = true
  let totaux = true
  let par_epaiss = false

  // Pièces, tableau non fusionné
  $: pieces2 = pieces.pieces
    .reduce((res, p) => res.concat(p.individual()), [])
    .map((p) => (
      (!p.piece) ? p : p.piece.update_new({
        ...p.piece,
        names: p.nom ? p.nom.split(' ') : p.piece.names,
        que: quantite * (p.que || p.piece.que || 1),
      })
    ))

  // Pièces, tableau fusionné si merge == true
  $: pieces3 = !merge ? pieces2 :
    Object.values(pieces2.reduce((map, p) => (map[p.signature()] = [...(map[p.signature()] || []), p], map), {}))
    .map(family => (
      family.reduce((a, b) => (a == null ? b : a.merge(b)), null)
    ))


  let cubeprice
  let cubemargin
  getContext('settings').subscribe(settings => {
    cubeprice = settings.cubeprice
    cubemargin = settings.cubemargin
  })

  $: total_cube = pieces3.map(p => p.que * p.cubage(cubemargin/100)).reduce((a, b) => (a+b), 0)
  $: total_prix = pieces3.map(p => p.que * p.prix(cubeprice, cubemargin/100)).reduce((a, b) => (a+b), 0)

  let statistics = []
  $: statistics = calculStatistics(pieces, totaux)
  $: statistics_epaisseurs = Object.keys(statistics
    .reduce((h,x) => {x.epaisseurs.forEach(ep => h[ep.epaisseur] = true); return h}, {}))

  function calculStatistics(total_group, totaux){
    return total_group
      .flat_groups('', totaux)
      .map(group => {
        const pieces_par_epaisseur = group.pieces
          .reduce((h, p) => ({...h, [p.epaisseur]: [...(h[p.epaisseur]||[]), p]}), {})
        const stats_epaisseur = Object.keys(pieces_par_epaisseur)
          .map((epaisseur) => ({
            epaisseur: epaisseur,
            nb_pieces: pieces_par_epaisseur[epaisseur].length,
            surface: pieces_par_epaisseur[epaisseur].reduce((s,p) => s + p.surface(), 0)
          }))
        const {xmin, xmax, ymin, ymax, zmin, zmax} = group.bounding_box()
        return {
          name:        group.name,
          dimension_x: xmax - xmin,
          dimension_y: ymax - ymin,
          dimension_z: zmax - zmin,
          nb_tenons:   group.pieces.reduce((n, p) => n + p.nombre_tenons, 0),
          nb_pieces:   group.pieces.length,
          surface:     group.surface(),
          epaisseurs:  stats_epaisseur,
        }
      })
      .filter(stat => stat.nb_pieces > 0)
  }

</script>

<style>
  input[size='5'] {
    width: 6em;
  }
  input[size='3'] {
    width: 4em;
  }
</style>

<table class="large styled">
  <caption>Statistiques pour {pieces.name} (afficher <label style="display: inline"><input bind:checked={totaux} type=checkbox /> totaux</label>, <label style="display: inline"><input bind:checked={par_epaiss} type=checkbox /> par épaisseur</label>)</caption>
  <tr>
    <th rowspan={par_epaiss ? 2 : 1}>Ensemble</th>
    <th rowspan={par_epaiss ? 2 : 1}>Dimensions</th>
    <th rowspan={par_epaiss ? 2 : 1}>Nombre de pièces</th>
    <th rowspan={par_epaiss ? 2 : 1}>Nombre de tenons</th>
    <th rowspan={par_epaiss ? 2 : 1}>Surface des pièces</th>
    {#if par_epaiss}
      {#each statistics_epaisseurs as ep}
        <th colspan=2>Pièces ép={ep}</th>
      {/each}
    {/if}
  </tr>
  {#if par_epaiss}
  <tr>
    {#each statistics_epaisseurs as ep}
      <th>Nbre</th>
      <th>m²</th>
    {/each}
  </tr>
  {/if}
  {#each statistics as stat}
    <tr>
      <td>{stat.name}</td>
      <td>{stat.dimension_x} x {stat.dimension_y} x {stat.dimension_z}</td>
      <td>{stat.nb_pieces}</td>
      <td>{stat.nb_tenons}</td>
      <td>{stat.surface.toFixed(6)}</td>
      {#if par_epaiss}
      {#each statistics_epaisseurs as ep}
        <td>{(stat.epaisseurs.find(e => e.epaisseur == ep)||{}).nb_pieces || 0}</td>
        <td>{((stat.epaisseurs.find(e => e.epaisseur == ep)||{}).surface || 0).toFixed(6)}</td>
      {/each}
      {/if}
    </tr>
  {/each}
</table>

<hr/>

<Estimation pieces={pieces} bind:estimations={estimations} />

<hr/>

<table class="large styled">
  <caption>Liste de débit</caption>
  <tr>
    <th>Pièce (<label style="display: inline"><input bind:checked={separer} type=checkbox /> séparer</label>)</th>
    <th>Qué</th>
    <th>L x l x e</th>
    <th>Arrasement</th>
    <th>Surface (m²)</th>
    <th>epaisseur plateau (mm)</th>
    <th>Cubage<br/>(x<input type=number bind:value={cubemargin} size=3 min=100 step=5/>%)</th>
    <th>Prix au m³<br/><input type=number bind:value={cubeprice} size=5 step=10/></th>
  </tr>
  {#each pieces3 as piece}
  <tr>
    <td>
      {#if separer}
        {#each piece.name_list as name, i}
          {#if i != 0}<br/>{/if}
          {name}
        {/each}
      {:else}
        {piece.name}
      {/if}
    </td>
    <td>{piece.que || 1}</td>
    <td>{piece.string_dimentions()}</td>
    <td>{piece.string_arrasement()}</td>
    <td>{piece.largeur * piece.longueur / 1e6}</td>
    <td>{piece.epaisseur_plateau}</td>
    <td>{piece.que * piece.cubage(cubemargin/100).toFixed(9)}</td>
    <td>{piece.que * piece.prix(cubeprice, cubemargin/100).toFixed(2)}</td>
  </tr>
  {/each}
  <tr>
    <td>Total</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td>{total_cube.toFixed(9)}</td>
    <td>{total_prix.toFixed(2)}</td>
  </tr>
</table>
