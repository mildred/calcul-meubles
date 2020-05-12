<script>
  import SVGDrawing from '../pieces/SVGDrawing.svelte';
  import Group from '../pieces/Group.js';
  import { nextId } from '../utils.js';
  import Component from '../Component.svelte';
  import InputNumber from '../controls/InputNumber.svelte';
  import InputCheckbox from '../controls/InputCheckbox.svelte';

  export let name = null
  export let path = '0'
  export let initdata = {}
  export let state = {}
  let childrenState = []

  let data = {
    children: [],
    childrenPos: [],
    type: 'Ensemble',
    id: 0,
    name: name,
    ...initdata
  }

  let childrenPos = data.childrenPos
  let children = data.children

  $: childrenPos = children
    .map((_,i) => ({x: 0, y: 0, z: 0, d: 1, show: true, ...childrenPos[i]}))

  $: data.childrenPos = childrenPos
  $: data.children = children

  let pieces = []

  let zoom = 0.5;

  $: pieces = childrenState
    .map((c, i) => new Group(c.pieces, `${children[i].type} ${children[i].name}`))
    .map((g, i) => {
      let {x, y, z} = {
        x: 0, y: 0, z: 0,
        ...childrenPos[i],
      }
      return g.position(x, y, z)
    })

  $: pieces_drawings = pieces
    .reduce((res, p, i) => {
      let pos = {d: 1, show: true, ...childrenPos[i]}
      let d = pos.d || 1;
      if(pos.show) res[d-1] = [...(res[d-1] || []), p];
      return res;
    }, [])

  //$: console.log(pieces_drawings)

  function add(type){
    let id = nextId(children)
    let name = prompt("Nom du sous-ensemble :", `${path}-${id}`) || `${path}-${id}`
    children = [...children, {
      type: type,
      name: name,
      id:   id
    }]
  }

  function rename(){
    data.name = prompt(`Renommer "${data.name}" en :`, data.name) || data.name
  }

</script>

<Component bind:data={data} state={state} bind:childrenState={childrenState} path={path} on:datachange>
  <h1>Sous-ensemble</h1>
  <h2>{data.name} <a href="@" on:click|preventDefault={rename}>✎</a></h2>

  {#each pieces_drawings as pieces_d, i}
    <div data-count={pieces.length}>
      <p>Dessin {i+1}</p>
      <SVGDrawing bind:zoom={zoom} pieces={pieces_d || []} />
    </div>
  {/each}

  {#if children.length > 0 }
  <table>
    <tr>
      <th style="text-align: left">Éléments</th>
      <th style="text-align: right">dimensions (L&nbsp;x&nbsp;h&nbsp;x&nbsp;p)</th>
      <th style="text-align: right">de la gauche</th>
      <th style="text-align: right">du bas</th>
      <th style="text-align: right">du mur</th>
      <th style="text-align: right">n° dessin</th>
      <td></td>
    </tr>
  {#each children as child, i}
    {#if child.type}
    <tr>
      <td>{child.type} {child.name}</td>
      <td style="text-align: right">{(pieces[i]||{}).largeur}x{(pieces[i]||{}).hauteur}x{(pieces[i]||{}).profondeur}</td>
      <td><InputNumber bind:value={childrenPos[i].x} def={0} /></td>
      <td><InputNumber bind:value={childrenPos[i].y} def={0} /></td>
      <td><InputNumber bind:value={childrenPos[i].z} def={0} /></td>
      <td><InputCheckbox tristate={false} bind:checked={childrenPos[i].show} /><InputNumber bind:value={childrenPos[i].d} def={1} min={1} /></td>
      <td>mm</td>
    </tr>
    {/if}
  {/each}
  </table>
  {/if}

  <button on:click={e => add('Porte')}>Nouvelle porte</button>
  <button on:click={e => add('Caisson')}>Nouveau caisson</button>
  <button on:click={e => add('Etagere')}>Nouvelle étagère</button>
  <button on:click={e => add('Facade')}>Nouvelle façade</button>
  <button on:click={e => add('Ensemble')}>Nouveau sous-ensemble</button>
</Component>


