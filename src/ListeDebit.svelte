<script>

  export let pieces = []

  $: total_cube = pieces.map(p => p.piece.cubage()).reduce((a, b) => (a+b))

</script>

<table>
  <caption>Liste de débit</caption>
  <tr>
    <th>Pièce</th>
    <th>Qué</th>
    <th>L x l x e</th>
    <th>Arrasement</th>
    <th>Cubage</th>
  </tr>
  {#each pieces as piece}
  <tr>
    <td>{piece.nom}</td>
    <td>{piece.que || 1}</td>
    <td>{piece.piece.string_dimentions()}</td>
    <td>{piece.piece.arrasement || ''}</td>
    <td>plateau {piece.piece.epaisseur_plateau}, {piece.piece.cubage()}</td>
  </tr>
  {/each}
  <tr>
    <td>Total</td>
    <td></td>
    <td></td>
    <td></td>
    <td>{total_cube}</td>
  </tr>
</table>
