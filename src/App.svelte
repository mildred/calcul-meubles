<script>
  import { setContext } from 'svelte';
  import TreeItem from './TreeItem.svelte';
  import Ensemble from './ensembles/Ensemble.svelte';
  import Porte from './ensembles/Porte.svelte';
  import Caisson from './ensembles/Caisson.svelte';
  import Etagere from './ensembles/Etagere.svelte';
  import Facade from './ensembles/Facade.svelte';
  let components = { Porte, Caisson, Ensemble, Etagere, Facade }

  setContext('App-components', components)

  let filename = `meuble_${new Date().toISOString().slice(0,16).replace(/T/, '_').replace(/:/, '')}.json`
  let data

  let item = JSON.parse(localStorage.getItem('calcul-meubles-data') || 'null')
  if(item) {
    data = item.data
    filename = item.filename
  }

  $: localStorage.setItem('calcul-meubles-data', JSON.stringify({data: data, filename: filename}))

  function clear(){
    let item = localStorage.getItem('calcul-meubles-data')
    if (item) {
      if(!confirm(`Vous avez un fichier non enregistré ${item.filename}. Êtes-vous sûr de vouloir le perdre ?`)) return
    }
    localStorage.removeItem('calcul-meubles-data')
    window.location.reload()
  }

  function rename(){
    let new_filename = prompt("Nom du fichier", filename)
    if (new_filename == null) return false
    filename = new_filename
    return true
  }

  function save(){
    if(!rename()) return;

    let json = JSON.stringify(data, null, 2)
    let file = new window.File([json], filename, {
      type: 'application/json'
    })
    let url = URL.createObjectURL(file);

    try {
      let a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      a.setAttribute('download', filename);

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      localStorage.removeItem('calcul-meubles-data')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  function open(){
    let input = document.createElement('input');
    input.style.display = 'none';
    input.setAttribute('type', 'file')
    input.addEventListener('change', (e) => {
      let file = e.target.files[0];
      if (!file) return

      let reader = new FileReader();
      reader.onload = (e) => {
        data     = JSON.parse(e.target.result)
        filename = "projet sans titre"
      }
      reader.readAsText(file);
    }, false)

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }
</script>

<style>
  .root {
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: 15rem auto;
    grid-template-areas:
      "toolbar toolbar"
      "tree main";
  }
  .toolbar {
    padding: 4px;
    grid-area: toolbar;
    background-color: var(--light-bg-color);
    border-bottom: solid 1px var(--border-color);
  }
  .tree {
    grid-area: tree;
    background-color: var(--light-bg-color);
    border-right: solid 1px var(--border-color);
  }
  .main {
    grid-area: main;
  }
  #json:not(:target) {
    display: none;
  }

  @media print {
    .toolbar .button {
      display: none;
    }
  }
</style>

<div class="root">
  <div class="toolbar">
    <button on:click={clear}>Nouveau</button>
    <button on:click={save}>Enregistrer sous...</button>
    <button on:click={open}>Ouvrir...</button>
    <a href="#json">{filename}</a>
    <a href="@" on:click|preventDefault={rename}>✎</a>
  </div>

  <div class="tree">
    <TreeItem data={data}/>
  </div>

  <div class="main">
    <Ensemble name="Meuble" initdata={data} on:datachange={(e) => {data = e.detail.data}} />
    <pre id="json">{JSON.stringify(data, null, 2)}</pre>
  </div>
</div>
