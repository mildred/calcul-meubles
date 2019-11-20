<script>

  export let pieces = []
  export let merge = true

  $: pieces2 = pieces
    .map((p) => (
      (!p.piece) ? p : p.piece.update_new({
        ...p.piece,
        names: p.nom ? p.nom.split(' ') : p.piece.names,
        que: p.que || p.piece.que || 1,
      })
    ))

  $: pieces3 = !merge ? pieces2 :
    Object.values(pieces2.reduce((map, p) => (map[p.signature()] = [...(map[p.signature()] || []), p], map), {}))
    .map(family => (
      family.reduce((a, b) => (a == null ? b : a.merge(b)), null)
    ))


  let cubeprice = 0
  let cubemargin = 100

  $: total_cube = pieces3.map(p => p.que * p.cubage(cubemargin/100)).reduce((a, b) => (a+b))
  $: total_prix = pieces3.map(p => p.que * p.prix(cubeprice, cubemargin/100)).reduce((a, b) => (a+b))

</script>

<style>
  table {
    border-collapse: collapse;
  }
  th {
    text-align: left;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 0.2em;
  }
  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  td:not(:first-child) {
    white-space: nowrap;
  }
  input[size='5'] {
    width: 6em;
  }
  input[size='3'] {
    width: 4em;
  }
</style>

<table>
  <caption>Liste de débit</caption>
  <tr>
    <th>Pièce</th>
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
    <td>{piece.name}</td>
    <td>{piece.que || 1}</td>
    <td>{piece.string_dimentions()}</td>
    <td>{piece.string_arrasement()}</td>
    <td>{piece.largeur * piece.longueur / 1e6}</td>
    <td>{piece.epaisseur_plateau}</td>
    <td>{piece.que * piece.cubage(cubemargin/100).toPrecision(9)}</td>
    <td>{piece.que * piece.prix(cubeprice, cubemargin/100).toPrecision(2)}</td>
  </tr>
  {/each}
  <tr>
    <td>Total</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td>{total_cube.toPrecision(9)}</td>
    <td>{total_prix.toPrecision(2)}</td>
  </tr>
</table>
