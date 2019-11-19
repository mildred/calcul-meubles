<script>

  export let pieces = []

  let cubeprice = 0

  $: total_cube = pieces.map(p => p.que * p.piece.cubage()).reduce((a, b) => (a+b))
  $: total_prix = pieces.map(p => p.que * p.piece.prix(cubeprice)).reduce((a, b) => (a+b))

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
    <th>Cubage</th>
    <th>Prix au m³<br/><input type=number bind:value={cubeprice} size=5 step=10/></th>
  </tr>
  {#each pieces as piece}
  <tr>
    <td>{piece.nom}</td>
    <td>{piece.que || 1}</td>
    <td>{piece.piece.string_dimentions()}</td>
    <td>{piece.piece.arrasement || ''}</td>
    <td>{piece.piece.largeur * piece.piece.longueur / 1e6}</td>
    <td>{piece.piece.epaisseur_plateau}</td>
    <td>{piece.que * piece.piece.cubage().toPrecision(9)}</td>
    <td>{piece.que * piece.piece.prix(cubeprice).toPrecision(2)}</td>
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
