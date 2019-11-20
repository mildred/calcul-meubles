<script>

  export let pieces = []

  let cubeprice = 0
  let cubemargin = 100

  $: total_cube = pieces.map(p => p.que * p.piece.cubage(cubemargin/100)).reduce((a, b) => (a+b))
  $: total_prix = pieces.map(p => p.que * p.piece.prix(cubeprice, cubemargin/100)).reduce((a, b) => (a+b))

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
  td {
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
  {#each pieces as piece}
  <tr>
    <td>{piece.nom}</td>
    <td>{piece.que || 1}</td>
    <td>{piece.piece.string_dimentions()}</td>
    <td>{piece.piece.string_arrasement()}</td>
    <td>{piece.piece.largeur * piece.piece.longueur / 1e6}</td>
    <td>{piece.piece.epaisseur_plateau}</td>
    <td>{piece.que * piece.piece.cubage(cubemargin/100).toPrecision(9)}</td>
    <td>{piece.que * piece.piece.prix(cubeprice, cubemargin/100).toPrecision(2)}</td>
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
