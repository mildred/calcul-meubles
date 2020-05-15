<script>
  import SVGDrawing from '../pieces/SVGDrawing.svelte';
  import Group from '../pieces/Group.js';
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

  let data = {}
  $: data = {
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

  function rename(){
    data.name = prompt(`Renommer "${data.name}" en :`, data.name) || data.name
  }

</script>

<Component bind:data={data} state={state} bind:children={children} bind:childrenState={childrenState} path={path} on:datachange>
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
  </div>

  <div slot="tables">
    <ListeDebit pieces={new Group(pieces, `Ensemble ${data.name}`, 'Ensemble')} />
  </div>

  <details>
    <summary>data</summary>
    <pre>data = {JSON.stringify(data, null, 2)}</pre>
    <pre>initdata = {JSON.stringify(initdata, null, 2)}</pre>
  </details>
</Component>


