<script>
  import SVGPiece from '../pieces/SVGPiece.svelte';

  export let item;
  export let pos;
</script>

{#if item.type == 'Piece' }
  <SVGPiece piece={item} pos={pos} />
{:else if item.type == 'Group' }
  <g transform="translate({item.projection_position(pos)[0]}, {item.projection_position(pos)[1]})" data-name={item.name}>
  {#each item.pieces as p}
    <svelte:self item={p} pos={pos} />
  {/each}
  </g>
{:else}
  { console.warn("Unknown item.type for", item) }
{/if}
