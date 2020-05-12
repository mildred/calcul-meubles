<script>
  import { setContext } from 'svelte';
  import TreeItem from './TreeItem.svelte';
  import TreeItemOption from './TreeItemOption.svelte';
  import Ensemble from './ensembles/Ensemble.svelte';
  import Porte from './ensembles/Porte.svelte';
  import Caisson from './ensembles/Caisson.svelte';
  import Etagere from './ensembles/Etagere.svelte';
  import Facade from './ensembles/Facade.svelte';
  let components = { Porte, Caisson, Ensemble, Etagere, Facade }

  setContext('App-components', components)

  let filename = `meuble_${new Date().toISOString().slice(0,16).replace(/T/, '_').replace(/:/, '')}.json`
  let component_layout = 'hsplit'
  let data
  let tree_hidden = false

  let item = JSON.parse(localStorage.getItem('calcul-meubles-data') || 'null')
  let fileData = localStorage.getItem('calcul-meubles-file-data')
  if(item) {
    data = item.data
    filename = item.filename
  }

  $: localStorage.setItem('calcul-meubles-data', JSON.stringify({data: data, filename: filename}))

  function clear(){
    if(!isSaved()) {
      alert("Fichier non enregistré, veuillez enregistrer le fichier avant d'en créer un nouveau.")
      return
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

  function saveAs(){
    save(true)
  }

  function ensureSaved(){
    let item = localStorage.getItem('calcul-meubles-data')
    if (item) {
      if(save(false) == 'cancelled') return false;
    }
    return true;
  }

  function isSaved(){
    let json = JSON.stringify(data, null, 2)
    return (json == fileData)
  }

  function simpleSave(){
    if(save(false) == 'already-saved') {
      alert("Déjà enregistré")
    }
  }

  function save(saveAs){
    let json = JSON.stringify(data, null, 2)
    if(!saveAs && json == fileData){
      return 'already-saved';
    }

    if(saveAs && !rename()) return 'cancelled';

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
      fileData = json
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  function open(){
    if(!isSaved()) {
      alert("Fichier non enregistré, veuillez enregistrer le fichier avant d'en ouvrir un nouveau.")
      return
    }
    let input = document.createElement('input');
    input.style.display = 'none';
    input.setAttribute('type', 'file')
    input.addEventListener('change', (e) => {
      let file = e.target.files[0];
      if (!file) return

      let reader = new FileReader();
      reader.onload = (e) => {
        data     = JSON.parse(e.target.result)
        filename = file.name
        fileData = e.target.result
      }
      reader.readAsText(file);
    }, false)

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  function moveTree(e){
    if(e.target.value == 'show') {
      showTree()
      e.target.value = window.location.hash
    } else {
      window.location.hash = e.target.value
    }
  }

  function hideTree(e){
    e.preventDefault()
    tree_hidden = true
  }

  function showTree(){
    tree_hidden = false
  }
</script>

<style>
  .root {
    display: grid;
    grid-template-rows: 3rem auto;
    grid-template-columns: auto auto;
    grid-template-areas:
      "toolbar toolbar"
      "tree main";
    height: 100%
  }
  .tree-hidden.root {
    grid-template-columns: auto;
    grid-template-areas:
      "toolbar"
      "main";
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
    overflow: auto;
    width: 15rem;
    resize: horizontal;
  }
  .tree-hidden .tree {
    display: none;
  }
  .root:not(.tree-hidden) .tree-select {
    display: none;
  }
  .main {
    grid-area: main;
    overflow: auto;
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

<div class="root" class:component-hsplit={component_layout == 'hsplit'} class:tree-hidden={tree_hidden}>
  <div class="toolbar">
    <select on:change={moveTree} class="tree-select">
      <TreeItemOption data={data}/>
      <option value="show">(montrer)</option>
    </select>
    <button on:click={clear}>Nouveau</button>
    <button on:click={simpleSave}>Enregistrer</button>
    <button on:click={saveAs}>Enregistrer sous...</button>
    <button on:click={open}>Ouvrir...</button>
    <a href="#json">{filename}</a>
    <a href="@" on:click|preventDefault={rename}>✎</a>
    <label style="float: right">
      Agencement :
      <select bind:value={component_layout}>
        <option value="">À la suite</option>
        <option value="hsplit">Horizontal</option>
      </select>
    </label>
  </div>

  <div class="tree">
    <TreeItem data={data}/>
    <a on:click={hideTree} href='#'>(cacher)</a>
  </div>

  <div class="main">
    <Ensemble name="Meuble" initdata={data} on:datachange={(e) => {data = e.detail.data}} />
    <pre id="json">{JSON.stringify(data, null, 2)}</pre>
  </div>
</div>
