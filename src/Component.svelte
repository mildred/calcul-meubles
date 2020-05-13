<script>
  import { getContext, setContext, createEventDispatcher } from 'svelte';
  import { routeDeclare } from './route.js';

  const dispatch = createEventDispatcher();
  let components = getContext('App-components')
  let layout = 'all';
  getContext('settings').subscribe(settings => {
    layout = settings.component_layout
  })

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

  // manually set target class because when svelte modified an element class
  // list, it removes any manually set classes with the classList API.
  let target = false
  routeDeclare(route => {
    target = (route.component_path == path)
  })

  function setLayout(e, name){
    if(e) e.preventDefault()
    layout = name
    getContext('settings').update(settings => ({
      ...settings,
      component_layout: layout,
    }))
  }

</script>

<style>
  .debug{
    display: none;
  }
  .component {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
  }

  .component-grid {
    flex: 1 1 auto;
    height: 100%;
    overflow: auto;
  }

  ul.tabs {
    flex: 0 0 auto;
    margin: 0;
    background-color: var(--light-bg-color);
    border-bottom: solid 1px var(--border-color);
  }
  ul.tabs > li:last-child {
    border-right: solid 1px var(--border-color);
  }
  ul.tabs > li {
    border-top: solid 1px var(--border-color);
    border-left: solid 1px var(--border-color);
    margin: 0;
    padding: 0;
    margin-top: 2px;
    display: inline;
  }
  ul.tabs > li > a {
    padding: 0 1em;
  }
  ul.tabs > li > a.active {
    background-color: white;
  }

  :global(.layout-plan) .component-grid > :not(.component-grid-plan) {
    display: none;
  }

  :global(.layout-dim) .component-grid > :not(.component-grid-dim) {
    display: none;
  }

  :global(.layout-tables) .component-grid > :not(.component-grid-tables) {
    display: none;
  }

  :global(.layout-children) .component-grid > :not(.component-grid-plan):not(.component-grid-children) {
    display: none;
  }

  :global(.layout-plan-dim) .component-grid > * {
    display: none;
  }
  :global(.layout-plan-dim) .component-grid > .component-grid-plan {
    order: 1;
    flex: 0 0 auto;
    display: unset;
    border-right: solid 1px var(--border-color);
    overflow: auto;
    resize: horizontal;
  }
  :global(.layout-plan-dim) .component-grid > .component-grid-dim {
    order: 2;
    flex: 1 1 auto;
    display: unset;
    overflow: auto;
  }
  :global(.layout-plan-dim) .component-grid {
    display: flex;
    flex-flow: row nowrap;
  }

  @media print {
    .component, .component-grid, .component-grid > * {
      display: block !important;
      overflow: visible !important;
    }
  }
</style>

<div class="routable component layout-{layout}" class:target={target} id="component-{path}">
  <ul class="tabs">
    <li><a href="@" on:click={e => setLayout(e, 'all')}      class:active={layout=='all'}>Tout</a></li>
    <li><a href="@" on:click={e => setLayout(e, 'plan')}     class:active={layout=='plan'}>Plan</a></li>
    <li><a href="@" on:click={e => setLayout(e, 'plan-dim')} class:active={layout=='plan-dim'}>Plan + Dimensions</a></li>
    <li><a href="@" on:click={e => setLayout(e, 'dim')}      class:active={layout=='dim'}>Dimensions</a></li>
    <li><a href="@" on:click={e => setLayout(e, 'tables')}   class:active={layout=='tables'}>Tableaux</a></li>
    <li><a href="@" on:click={e => setLayout(e, 'children')} class:active={layout=='children'}>Sous-éléments</a></li>
  </ul>
  <div class="component-grid">
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
