<script>
  import { cleanObject } from './utils.js';
  import InputNumber from './controls/InputNumber.svelte';
  import InputCheckbox from './controls/InputCheckbox.svelte';
  import Group from './pieces/Group.js';

  export let children = []
  export let childrenState = []
  export let pieces = []
  export let pieces_drawings = []
  export let childrenPos = []
  export let defaultChildrenPos = []
  export let drawings = false

  $: childrenPos = children
    .map((_,i) => cleanObject(childrenPos[i] || {}))

  $: pieces = children
    .map((c, i) => new Group((childrenState[i] || {}).pieces || [], `${c.type} ${c.name}`, c.type))
    .map((g, i) => {
      let {x, y, z} = {
        x: 0, y: 0, z: 0,
        ...(defaultChildrenPos[i] || {}),
        ...cleanObject(childrenPos[i] || {}),
      }
      return g.position(x, y, z)
    })

  $: pieces_drawings = pieces
    .reduce((res, p, i) => {
      let pos = {
        d: 1,
        show: true,
        ...(defaultChildrenPos[i] || {}),
        ...cleanObject(childrenPos[i] || {})
      }
      let d = pos.d || 1;
      if(pos.show) res[d-1] = [...(res[d-1] || []), p];
      return res;
    }, [])

</script>

{#if children.length > 0 }
<table>
  <tr>
    <th style="text-align: left">Éléments</th>
    <th style="text-align: right">dimensions (L&nbsp;x&nbsp;h&nbsp;x&nbsp;p)</th>
    {#if drawings}
    <th style="text-align: right" colspan="2">n° dessin</th>
    {/if}
    <th style="text-align: right">de la gauche</th>
    <th style="text-align: right">du bas</th>
    <th style="text-align: right">du mur</th>
    <td></td>
  </tr>
{#each children as child, i}
  {#if child.type}
  <tr>
    <td>{child.type} {child.name}</td>
    <td style="text-align: right">{(pieces[i]||{}).largeur}x{(pieces[i]||{}).hauteur}x{(pieces[i]||{}).profondeur}</td>
    {#if drawings}
    <td><InputCheckbox tristate={false} bind:checked={childrenPos[i].show} /></td>
    <td><InputNumber bind:value={childrenPos[i].d} def={(defaultChildrenPos[i]||{}).d || 1} min={1} /></td>
    {/if}
    <td><InputNumber bind:value={childrenPos[i].x} def={(defaultChildrenPos[i]||{}).x || 0} /></td>
    <td><InputNumber bind:value={childrenPos[i].y} def={(defaultChildrenPos[i]||{}).y || 0} /></td>
    <td><InputNumber bind:value={childrenPos[i].z} def={(defaultChildrenPos[i]||{}).z || 0} /></td>
    <td>mm</td>
  </tr>
  {/if}
{/each}
</table>
{/if}

