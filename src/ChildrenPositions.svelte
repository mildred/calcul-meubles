<script>
  import { cleanObject } from './utils.js';
  import InputNumber from './controls/InputNumber.svelte';
  import InputCheckbox from './controls/InputCheckbox.svelte';
  import Group from './pieces/Group.js';

  export let children = []
  export let childrenState = []
  export let pieces = []
  export let pieces_drawings = []
  export let childrenPos
  export let defaultChildrenPos = []
  export let drawings = false

  //*
  $: console.log('ChildrenPositions children = ', children)
  $: console.log('ChildrenPositions childrenState = ', childrenState)
  $: console.log('ChildrenPositions pieces = ', pieces)
  $: console.log('ChildrenPositions pieces_drawings = ', pieces_drawings)
  $: console.log('ChildrenPositions childrenPos = ', JSON.stringify(childrenPos, null, 2))
  $: console.log('ChildrenPositions defaultChildrenPos = ', defaultChildrenPos)
  $: console.log('ChildrenPositions drawings = ', drawings)
  //*/

  $: childrenPos = resizeChildrenPos(children)

  function resizeChildrenPos(children) {
    return children
      .map((_,i) => cleanObject(childrenPos[i] || {}))
      .map(c => ({...c, show: (c.show === null || c.show === undefined) ? true : c.show}))
  }

  $: pieces0 = children
    .map((c, i) => {
      const state = childrenState[i] || {}
      return state.pieces_group || new Group(state.pieces || [], `${c.type} ${c.name}`, c.type)
    })
    .map((g, i) => {
      let {x, y, z} = {
        x: 0, y: 0, z: 0,
        ...(defaultChildrenPos[i] || {}),
        ...cleanObject(childrenPos[i] || {}),
      }
      return g.position(x, y, z)
    })

  $: pieces_drawings = pieces0
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

  $: pieces = pieces_drawings.reduce((res, d) => [...res, ...d], [])

</script>

{#if children.length > 0 }
<table>
  <tr>
    <th style="text-align: left" colspan="2">Éléments (activer)</th>
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
    <td><InputCheckbox tristate={false} bind:checked={childrenPos[i].show} /></td>
    <td>{child.type} {child.name}</td>
    <td style="text-align: right">{(pieces0[i]||{}).largeur}x{(pieces0[i]||{}).hauteur}x{(pieces0[i]||{}).profondeur}</td>
    {#if drawings}
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

