<script>
  export let data = {};
  export let path = '0';
</script>

<a href="#component-{path}">{data.name}</a>
{#if data.children}
<ul>
  {#each data.children as child}
  <li>
    <svelte:self path="{path}-{child.id}" data={child} />
  </li>
  {/each}
</ul>
{/if}
