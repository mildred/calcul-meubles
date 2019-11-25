<script>
  import { nextId } from '../utils.js';
  import Component from '../Component.svelte';

  export let name = null
  export let path = '0'
  export let initdata = {}

  let data = {
    children: [],
    type: 'Ensemble',
    id: 0,
    name: name,
    ...initdata
  }

  function add(type){
    let id = nextId(data.children)
    let name = prompt("Nom du sous-ensemble :", `${path}-${id}`) || `${path}-${id}`
    data.children = [...data.children, {
      type: type,
      name: name,
      id:   id
    }]
  }

  function rename(){
    data.name = prompt(`Renommer "${data.name}" en :`, data.name) || data.name
  }

</script>

<Component bind:data={data} path={path} on:datachange>
  <h1>Sous-ensemble</h1>
  <h2>{data.name} <a href="@" on:click|preventDefault={rename}>✎</a></h2>

  <button on:click={e => add('Porte')}>Nouvelle porte</button>
  <button on:click={e => add('Caisson')}>Nouveau caisson</button>
  <button on:click={e => add('Etagere')}>Nouvelle étagère</button>
  <button on:click={e => add('Ensemble')}>Nouveau sous-ensemble</button>
</Component>


