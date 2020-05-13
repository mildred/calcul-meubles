<script>
  import { getContext, setContext, createEventDispatcher } from 'svelte';
  import { routeDeclare } from './route.js';

  const dispatch = createEventDispatcher();
  let components = getContext('App-components')

  export let data
  export let state = {}
  export let childrenState = []
  export let path = `${getContext('Component-path')}-${data.id}`

  setContext('Component-path', path)

  dispatch('datachange', {data, state})
  $: dispatch('datachange', {data, state})

  function renameChild(i){
    let name = prompt(`Renommer "${data.children[i].name}" en :`, data.children[i].name) || data.children[i].name
    data.children[i].name = name
  }

  function deleteChild(i){
    if(!confirm(`Supprimer ${data.children[i].name} ?`)) return
    let children = [...data.children]
    children.splice(i, 1)
    console.log("delete", i, data.children, children)
    data.children = children
  }

  function onDataChange(e, i){
    console.log(`${data.type}(${path}).datachange[${i}] = %o`, e.detail);
    data.children[i] = e.detail.data
    childrenState[i] = e.detail.state
  }

  routeDeclare(route => {
    if(route.component_selector) {
      return document.querySelectorAll(route.component_selector)
    }
  })
</script>

<style>
  .component:not(:target):not(.target) {
    display: none;
  }
  .debug{
    display: none;
  }
  .component {
    height: 100%;
  }
  :global(.component-hsplit) .component-grid {
    height: 100%;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto auto;
    grid-template-areas:
      "left main";
  }
  :global(.component-hsplit) .component-grid-left {
    border-right: solid 1px var(--border-color);
    grid-area: left;
    overflow: auto;
    resize: horizontal;
  }
  :global(.component-hsplit) .component-grid-main {
    grid-area: main;
    overflow: auto;
  }
</style>

<div class="component" id="component-{path}">
  <div class="component-grid">
    <div class="component-grid-left">
      <slot name="left"></slot>
    </div>
    <div class="component-grid-main">
      <slot></slot>

      <!-- data.children is empty if this is not there: -->
      <pre style="display: none">data.children = {JSON.stringify(data.children, null, 2)}</pre>

      {#if data.children && data.children.length}
      <ul>
      {#each data.children as child, i}
        {#if child.type}
        <li>
          <a href="#/component/{path}-{child.id}">{child.type} {child.name}</a>
          <a href="@" on:click|preventDefault={e => renameChild(i)}>✎</a>
          <a href="@" on:click|preventDefault={e => deleteChild(i)}>🗑</a>
        </li>
        {/if}
      {/each}
      </ul>
      {/if}

      <pre class="debug">{JSON.stringify(data, null, 2)}</pre>
    </div>
  </div>
</div>

{#if data.children && data.children.length}
{#each data.children as child, i}
  <svelte:component
    this={components[child.type]}
    initdata={child}
    on:datachange={e => onDataChange(e, i)}
    path="{path}-{child.id}" />
{/each}
{/if}
