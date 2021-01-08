<script>
  import SVGItem from '../pieces/SVGItem.svelte';
  import JSCADView from '../pieces/JSCADView.svelte';

  export let pieces;
  export let zoom = 0.25;
  export let name = pieces.name || "Dessin"

  let mode = '2d'

  function setMode(m) {
    mode = m
  }

  $: pieces_list = (pieces instanceof Array) ? pieces : pieces.individual()

  let svgElement;

  $: [xmax, ymax, zmax] = pieces_list
    .map(p => p.bounding_box())
    .map(b => [b.xmax, b.ymax, b.zmax])
    .reduce((b0, b1) => [Math.max(b0[0], b1[0]), Math.max(b0[1], b1[1]), Math.max(b0[2], b1[2])], [0, 0, 0])

  function save(){
    let markup = svgElement.outerHTML
    // TODO: detect filename
    let filename = (prompt("Nom du fichier :", name) || "dessin") + ".svg"

    let file = new window.File([markup], filename, {
      type: 'image/svg+xml'
    })
    let url = URL.createObjectURL(file);

    try {
      let a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      a.setAttribute('download', filename);

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      URL.revokeObjectURL(url)
    }
  }
</script>

<h3>{name}</h3>

{#if mode == '3d'}
<p>
  <a href="javascript:void(0)" on:click={e => setMode('2d')}>2D</a>
</p>
<JSCADView item={pieces_list} />
{/if}

{#if mode == '2d'}
<p>
  <a href="javascript:void(0)" on:click={e => setMode('3d')}>3D</a><br/>
  Zoom : <input type=range bind:value={zoom} min=0 max=1 step=.05> {zoom*100} %
  <br/>
  <a href="javascript:void(0)" on:click={save}>Enregistrer image</a>
</p>
<svg
    bind:this={svgElement}
    data-count={pieces_list.length}
    width="{5 + zoom*xmax + 5 + zoom*zmax + 5}"
    height="{5 + zoom*ymax + 5 + zoom*zmax + 5}">
  <g transform="translate(5, {5 + zoom*ymax}) scale({zoom} {zoom})">
    {#each pieces_list as piece}
      <SVGItem item={piece} pos="xy" />
    {/each}
  </g>
  <g transform="translate({5 + zoom*xmax + 10}, {5 + zoom*ymax}) scale({zoom} {zoom})">
    {#each pieces_list as piece}
      <SVGItem item={piece} pos="zy" />
    {/each}
  </g>
  <g transform="translate(5, {5 + zoom*(ymax) + 5}) scale({zoom} {zoom})">
    {#each pieces_list as piece}
      <SVGItem item={piece} pos="xZ" />
    {/each}
  </g>
</svg>
{/if}
