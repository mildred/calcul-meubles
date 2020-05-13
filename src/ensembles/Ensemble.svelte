<script>
  import SVGDrawing from '../pieces/SVGDrawing.svelte';
  import Group from '../pieces/Group.js';
  import { nextId } from '../utils.js';
  import Component from '../Component.svelte';
  import ChildrenPositions from '../ChildrenPositions.svelte';
  import ListeDebit from '../ListeDebit.svelte'
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

  $: data.childrenPos = childrenPos
  $: data.children = children

  let pieces = []
  let pieces_drawings = []

  let zoom = 0.5;

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
  <div slot="plan">
    <h2>{data.name} <a href="@" on:click|preventDefault={rename}>✎</a></h2>
    {#each pieces_drawings as pieces_d, i}
      <div data-count={pieces.length}>
        <SVGDrawing bind:zoom={zoom} pieces={pieces_d || []} name={`Dessin ${i+1}`} />
      </div>
    {/each}
  </div>

  <div slot="children">
    <ChildrenPositions
      children={children}
      childrenState={childrenState}
      bind:childrenPos={childrenPos}
      bind:pieces={pieces}
      bind:pieces_drawings={pieces_drawings}
      drawings={true} />

    <button on:click={e => add('Porte')}>Nouvelle porte</button>
    <button on:click={e => add('Caisson')}>Nouveau caisson</button>
    <button on:click={e => add('Etagere')}>Nouvelle étagère</button>
    <button on:click={e => add('Facade')}>Nouvelle façade</button>
    <button on:click={e => add('Tiroir')}>Nouveau tiroir</button>
    <button on:click={e => add('Ensemble')}>Nouveau sous-ensemble</button>
  </div>

  <div slot="tables">
    <ListeDebit pieces={new Group(pieces, `Ensemble ${data.name}`, 'Ensemble')} />
  </div>
</Component>


