<script>
  export let piece;
  export let pos;

  let polyline

  $: [x, y, dx, dy] = piece.projection(pos)
  $: polyline = piece.projection_polyline(pos).map(co => co.join(',')).join(' ')
</script>
<style>
  rect.outline {
    fill: rgb(255,255,255);
    fill-opacity: 0.5;
    stroke-width: 1;
    stroke:rgb(0,0,0);
  }
</style>

<!--<rect class="outline" x={x} y={y} width={dx} height={dy} />-->
<polyline class="outline" points={polyline} fill=none stroke=black data-name={piece.name} />
