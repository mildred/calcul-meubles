<script>
  export let dim = []
  export let zoom = 1
  export let suffix = ''
  export let pos = 'top'
  export let x = 0
  export let y = 0

  $: rotate =
    (pos == 'left') ? 'rotate(-90)' :
    ''
  $: reverse =
    (pos == 'left') ? -1 :
    1
  $: dim2 = dim
    .map(x => ({
      row: 0,
      text: '',
      text_suffix: suffix,
      ...x,
      zstart: zoom * x.start * reverse,
      zlength: zoom * x.length * reverse
    }))
</script>

<g transform="translate({x}, {y}) {rotate}">
{#each dim2 as d}
<circle
  cx="{d.zstart}"              cy="{20*d.row + 15}"
  r="2"
  stroke="black"
  stroke-width="1"
  fill="white" />
<circle
  cx="{d.zstart+d.zlength}"   cy="{20*d.row + 15}"
  r="2"
  stroke="black"
  stroke-width="1"
  fill="white" />
<text
  x="{d.zstart+d.zlength/2}"  y="{20*d.row + 13}"
  text-anchor="middle"
  font-size="10pt"
  >{d.text}{d.length}{d.text_suffix}</text>
<line
  x1="{d.zstart-5*reverse}"            y1="{20*d.row + 15}"
  x2="{d.zstart+d.zlength+5*reverse}" y2="{20*d.row + 15}"
  style="stroke-width:1;stroke:rgb(0,0,0)"/>
<line
  x1="{d.zstart}"              y1="{20*d.row + 10}"
  x2="{d.zstart}"              y2="{20*d.row + 19}"
  style="stroke-width:1;stroke:rgb(0,0,0)"/>
<line
  x1="{d.zstart+d.zlength}"   y1="{20*d.row + 10}"
  x2="{d.zstart+d.zlength}"   y2="{20*d.row + 19}"
  style="stroke-width:1;stroke:rgb(0,0,0)"/>
{/each}
</g>
