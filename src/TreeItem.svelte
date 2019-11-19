<script>
  export let data = {};
  export let path = '0';
</script>

<a href="#component-{path}">{data.type} {data.name}</a>
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
