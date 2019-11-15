<script>
  import Component from '../Component.svelte';

  export let name = null
  export let path = '0'
  export let data = {}

  data = {
    children: [],
    type: 'Ensemble',
    id: 0,
    name: name,
    ...data
  }

  function add(type){
    let name = prompt("Nom du sous-ensemble :")
    let id = data.children.length
    data.children = [...data.children, {
      type: type,
      name: name || `${path}-${id}`,
      id:   id
    }]
  }

  function rename(){
    data.name = prompt(`Renommer "${data.name}" en :`)
  }

</script>

<Component data={data} path={path}>
  <h1>Sous-ensemble</h1>
  <h2>{data.name} <a href="@" on:click|preventDefault={rename}>✎</a></h2>

  <button on:click={e => add('Porte')}>Nouvelle porte</button>
  <button on:click={e => add('Caisson')}>Nouveau caisson</button>
  <button on:click={e => add('Ensemble')}>Nouveau sous-ensemble</button>
</Component>


