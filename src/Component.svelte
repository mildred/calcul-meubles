<script>
  import { getContext, setContext, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let components = getContext('App-components')

  export let data
  export let path = `${getContext('Component-path')}-${data.id}`

  setContext('Component-path', path)

  $: dispatch('datachange', data)

  function renameChild(i){
    let name = prompt(`Renommer "${data.children[i].name}" en :`, data.children[i].name) || data.children[i].name
    data.children[i].name = name
  }

  function deleteChild(i){
    if(!confirm(`Supprimer ${data.children[i].name} ?`)) return
    let children = [...data.children]
    children.splice(i, 1)
    data.children = children
  }

  function onHashChange(){
    let hash = window.location.hash.replace(/^#/, '')
    console.log(`hash change ${window.location.hash}`, document.querySelectorAll('.target'),
    document.querySelectorAll(':target'), document.querySelectorAll(window.location.hash))
    Array.from(document.querySelectorAll('.target')).map(x => x.classList.remove('target'))
    Array.from(document.querySelectorAll(':target')).map(x => x.classList.add('target'))
    Array.from(document.querySelectorAll(window.location.hash)).map(x => x.classList.add('target'))
  }

  window.addEventListener("hashchange", onHashChange, false);
  window.addEventListener("load", onHashChange, false);
</script>

<style>
  .component:not(:target):not(.target) {
    display: none;
  }
  .debug{
    display: none;
  }
</style>

<div class="component" id="component-{path}">
  <slot></slot>

  {#if data.children && data.children.length}
  <ul>
  {#each data.children as child, i}
    {#if child.type}
    <li>
      <a href="#component-{path}-{child.id}">{child.type} {child.name}</a>
      <a href="@" on:click|preventDefault={e => renameChild(i)}>✎</a>
      <a href="@" on:click|preventDefault={e => deleteChild(i)}>🗑</a>
    </li>
    {/if}
  {/each}
  </ul>
  {/if}

  <pre class="debug">{JSON.stringify(data, null, 2)}</pre>
</div>

{#if data.children && data.children.length}
{#each data.children as child, i}
  <svelte:component
    this={components[child.type]}
    initdata={child}
    on:datachange={(e) => {console.log(`${data.type}(${path}).datachange[${i}] = %o`, e.detail); data.children[i] = e.detail}}
    path="{path}-{child.id}" />
{/each}
{/if}
