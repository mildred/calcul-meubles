<script>

  export let pieces = []

</script>

<table>
  <caption>Liste de débit</caption>
  <tr>
    <th>Pièce</th>
    <th>Qué</th>
    <th>L x l x e</th>
  </tr>
  {#each pieces as piece}
  <tr>
    <td>{piece.nom}</td>
    <td>{piece.que || 1}</td>
    <td>{piece.piece.string_dimentions()}</td>
  </tr>
  {/each}
</table>
