<script>
  import Porte from './ensembles/Porte.svelte';
  let components = { Porte }

  export let name = null
  export let path = '0'
  export let data = {}

  data = {
    children: [],
    type: 'Folder',
    id: 0,
    name: name,
    ...data
  }

  function add(type){
    let name = prompt("Nom du sous-ensemble :")
    let id = data.children.length
    data.children = [...data.children, {
      type: type,
      name: name || `${type}-${path}-${id}`,
      id:   id
    }]
  }

  function rename(){
    data.name = prompt(`Renommer "${data.name}" en :`)
  }

  function renameChild(i){
    let name = prompt(`Renommer "${data.children[i].name}" en :`)
    data.children[i].name = name
  }

  function deleteChild(i){
    if(!confirm(`Supprimer ${data.children[i].name} ?`)) return
    let children = [...data.children]
    children.splice(i, 1)
    data.children = children
  }
</script>

<style>
  .component:not(:target) {
    display: none;
  }
</style>

<div class="component" id="component-{path}">
  <h1>Sous-ensemble</h1>
  <h2>{data.name} <a href="@" on:click|preventDefault={rename}>✎</a></h2>

  <button on:click={e => add('Porte')}>Nouvelle porte</button>
  <button on:click={e => add('Folder')}>Nouveau sous-ensemble</button>

  <ul>
  {#each data.children as child, i}
    <li>
      <a href="#component-{path}-{child.id}">{child.name}</a>
      <a href="@" on:click|preventDefault={e => renameChild(i)}>✎</a>
      <a href="@" on:click|preventDefault={e => deleteChild(i)}>🗑</a>
    </li>
  {/each}
  </ul>
</div>

{#each data.children as child}
  {#if child.type == 'Folder'}
    <svelte:self bind:data={child} path="{path}-{child.id}" />
  {:else}
    <div class="component" id="component-{path}-{child.id}">
      <svelte:component this={components[child.type]} bind:data={child} />
    </div>
  {/if}
{/each}

