<script>
/*
data flow:

- root component pass data to child initdata
- in child:  data = {...initdata, opt, ui, children}
- child comp pass data to Component
- when child data changes, Component fires datachange to root
- child Component pass data.children[i] to grandchild initdata
- when data changes in grandchild comp, child Component set it to children
- children is passed from Component to child element
- child element recomputes data
- child Component pass updated data to parent

*/

  import { getContext, setContext, createEventDispatcher } from 'svelte';
  import { routeDeclare } from './route.js';
  import { nextId } from './utils.js';

  const dispatch = createEventDispatcher();
  let components = getContext('App-components')

  export let data
  export let state = {}
  export let childrenState = []
  export let children = data.children || []
  export let path = `${getContext('Component-path')}-${data.id}`
  export let multi_drawings = false

  /*
  $: console.log(`Component ${data.type}(${path}) data =`, data)
  $: console.log(`Component ${data.type}(${path}) state =`, state)
  $: console.log(`Component ${data.type}(${path}) childrenState =`, childrenState)
  $: console.log(`Component ${data.type}(${path}) children =`, children)
  $: console.log(`Component ${data.type}(${path}) path =`, path)
  */

  setContext('Component-path', path)

  dispatch('datachange', {data, state})
  //$: dispatch('datachange', {data})
  //$: dispatch('datachange', {state})
  //$: console.log(`${data.type}(${path}) datachange!`), dispatch('datachange', {state, data})
  $: dispatchDatachange(state, data)

  function dispatchDatachange(state, data){
    //console.log(`${data.type}(${path}) datachange!`)
    dispatch('datachange', {state, data})
  }

  function renameChild(i){
    let name = prompt(`Renommer "${children[i].name}" en :`, children[i].name) || children[i].name
    children[i].name = name
  }

  function deleteChild(i){
    if(!confirm(`Supprimer ${children[i].name} (#${i}) ?`)) return
    let children2 = [...children]
    children2.splice(i, 1)
    console.log("delete", i, children, children2)
    children = children2
  }

  function onDataChange(e, i){
    //console.log(`${data.type}(${path}).children[${i}] datachange{${Object.keys(e.detail).join()}} = %o`, e.detail);
    if(e.detail.data)  children[i] = e.detail.data
    if(e.detail.state) childrenState[i] = e.detail.state
  }

  // manually set target class because when svelte modified an element class
  // list, it removes any manually set classes with the classList API.
  let target = false
  routeDeclare(route => {
    target = (route.component_path == path)
  })

  function addChild(type){
    let id = nextId(children)
    let name = prompt("Nom du sous-ensemble :", `${path}-${id}`) || `${path}-${id}`
    children = [...children, {
      type: type,
      name: name,
      id:   id
    }]
  }

</script>

<style>
  .debug{
    display: none;
  }
  .component.target, .component:target {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
  }

  .component-grid {
    flex: 1 1 auto;
    height: 100%;
    overflow: auto;
  }

  @media print {
    .component, .component-grid, .component-grid > * {
      display: block !important;
      overflow: visible !important;
    }
  }
</style>

<div class="routable component" class:target={target} id="component-{path}">
  <div class="component-grid">
    <div>
      <button on:click={e => addChild('Porte')}>Nouvelle porte</button>
      <button on:click={e => addChild('Caisson')}>Nouveau caisson</button>
      <button on:click={e => addChild('Etagere')}>Nouvelle étagère</button>
      <button on:click={e => addChild('Plinthe')}>Nouvelle plinthe</button>
      <button on:click={e => addChild('Facade')}>Nouvelle façade</button>
      <button on:click={e => addChild('Tiroir')}>Nouveau tiroir</button>
      <button on:click={e => addChild('Ensemble')}>Nouveau sous-ensemble</button>
    </div>

    <div class="component-grid-plan">
      <slot name="plan"></slot>
    </div>
    <div class="component-grid-dim">
      <slot name="dim"></slot>
    </div>
    <div class="component-grid-main">
      <slot></slot>
    </div>
    <div class="component-grid-tables">
      <slot name="tables"></slot>
    </div>

    <div class="component-grid-children">
      <slot name="children"></slot>

      {#if data.children && data.children.length}
      <table>
      {#each data.children as child, i}
        {#if child.type}
        <tr>
          <td>
            <a href="#/component/{path}-{child.id}">{child.type} {child.name}</a>
            <a href="@" on:click|preventDefault={e => renameChild(i)}>✎</a>
            <a href="@" on:click|preventDefault={e => deleteChild(i)}>🗑</a>
            {#if (child.source||[]).length > 0}
              <em>(automatique : {child.source.join("-")})</em>
            {/if}
          </td>
        </tr>
        {/if}
      {/each}
      </table>
      {/if}

      <button on:click={e => addChild('Porte')}>Nouvelle porte</button>
      <button on:click={e => addChild('Caisson')}>Nouveau caisson</button>
      <button on:click={e => addChild('Etagere')}>Nouvelle étagère</button>
      <button on:click={e => addChild('Plinthe')}>Nouvelle plinthe</button>
      <button on:click={e => addChild('Facade')}>Nouvelle façade</button>
      <button on:click={e => addChild('Tiroir')}>Nouveau tiroir</button>
      <button on:click={e => addChild('Ensemble')}>Nouveau sous-ensemble</button>
    </div>

    <div class="component-grid-debug">
      <slot name="debug"></slot>
    </div>
  </div>
  <details>
    <summary>debug</summary>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </details>
</div>


{#if data.children && data.children.length}
{#each data.children as child, i (child.id)}
  <svelte:component
    this={components[child.type]}
    initdata={child}
    on:datachange={e => onDataChange(e, i)}
    path="{path}-{child.id}" />
{/each}
{/if}
