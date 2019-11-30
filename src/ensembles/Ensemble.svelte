<script>
  import SVGDrawing from '../pieces/SVGDrawing.svelte';
  import Group from '../pieces/Group.js';
  import { nextId } from '../utils.js';
  import Component from '../Component.svelte';
  import InputNumber from '../controls/InputNumber.svelte';

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
    .map((_,i) => ({x: 0, y: 0, z: 0, ...childrenPos[i]}))

  $: data.childrenPos = childrenPos
  $: data.children = children

  let pieces = []

  $: pieces = childrenState
    .map((c, i) => new Group(c.pieces, `${children[i].type} ${children[i].name}`))
    .map((g, i) => {
      let {x, y, z} = {
        x: 0, y: 0, z: 0,
        ...childrenPos[i],
      }
      return g.position(x, y, z)
    })

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

  <div>
    <SVGDrawing pieces={pieces} />
  </div>

  {#if children.length > 0 }
  <table>
    <tr>
      <th style="text-align: left">Positions des éléments</th>
      <th style="text-align: right">de la gauche</th>
      <th style="text-align: right">du bas</th>
      <th style="text-align: right">du mur</th>
      <td></td>
    </tr>
  {#each children as child, i}
    {#if child.type}
    <tr>
      <td>{child.type} {child.name}</td>
      <td><InputNumber bind:value={childrenPos[i].x} def={0} /></td>
      <td><InputNumber bind:value={childrenPos[i].y} def={0} /></td>
      <td><InputNumber bind:value={childrenPos[i].z} def={0} /></td>
      <td>mm</td>
    </tr>
    {/if}
  {/each}
  </table>
  {/if}

  <button on:click={e => add('Porte')}>Nouvelle porte</button>
  <button on:click={e => add('Caisson')}>Nouveau caisson</button>
  <button on:click={e => add('Etagere')}>Nouvelle étagère</button>
  <button on:click={e => add('Ensemble')}>Nouveau sous-ensemble</button>
</Component>


