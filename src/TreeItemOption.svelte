<script>
  import { routeInfo } from './route.js';

  export let data = {};
  export let path = '0';
  export let prefix = '';
  export let indent = "\u2003"; // &emsp;

  let selected = false

  function onHashChange(){
    const route = routeInfo(window.location.hash)
    selected = (route.component_selector === `#component-${path}`)
  }

  window.addEventListener("hashchange", onHashChange, false);
  window.addEventListener("load", onHashChange, false);
</script>

<option value="#/component/{path}" class:selected={selected} selected={selected ? 'selected' :
''}>{prefix}{data.type} {data.name}</option>
{#if data.children}
  {#each data.children as child}
  {#if child.type}
    <svelte:self path="{path}-{child.id}" data={child} prefix={prefix + indent} indent={indent}/>
  {/if}
  {/each}
{/if}
