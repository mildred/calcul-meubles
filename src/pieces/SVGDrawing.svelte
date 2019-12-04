<script>
  import SVGItem from '../pieces/SVGItem.svelte';

  export let pieces;
  export let zoom = 0.5;

  $: [xmax, ymax, zmax] = pieces
    .map(p => p.bounding_box())
    .map(b => [b.xmax, b.ymax, b.zmax])
    .reduce((b0, b1) => [Math.max(b0[0], b1[0]), Math.max(b0[1], b1[1]), Math.max(b0[2], b1[2])], [0, 0, 0])
</script>

<p>Zoom : <input type=range bind:value={zoom} min=0 max=1 step=.05> {zoom*100} %</p>
<svg
    data-count={pieces.length}
    width="{5 + zoom*xmax + 5 + zoom*zmax + 5}"
    height="{5 + zoom*ymax + 5 + zoom*zmax + 5}">
  <g transform="translate(5, {5 + zoom*ymax}) scale({zoom} {zoom})">
    {#each pieces as piece}
      <SVGItem item={piece} pos="xy" />
    {/each}
  </g>
  <g transform="translate({5 + zoom*xmax + 10}, {5 + zoom*ymax}) scale({zoom} {zoom})">
    {#each pieces as piece}
      <SVGItem item={piece} pos="zy" />
    {/each}
  </g>
  <g transform="translate(5, {5 + zoom*(ymax+zmax) + 5}) scale({zoom} {zoom})">
    {#each pieces as piece}
      <SVGItem item={piece} pos="xz" />
    {/each}
  </g>
</svg>
