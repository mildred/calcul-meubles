<script>
  export let data = {};
  export let path = '0';

  let selected = false

  function onHashChange(){
    selected = (window.location.hash === `#component-${path}`)
  }

  window.addEventListener("hashchange", onHashChange, false);
  window.addEventListener("load", onHashChange, false);
</script>

<style>
  .selected {
    font-weight: bold;
  }
</style>

<a href="#component-{path}" class:selected={selected}>{data.type} {data.name}</a>
{#if data.children}
<ul>
  {#each data.children as child}
  {#if child.type}
  <li>
    <svelte:self path="{path}-{child.id}" data={child} />
  </li>
  {/if}
  {/each}
</ul>
{/if}
