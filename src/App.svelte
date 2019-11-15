<script>
  import Folder from './Folder.svelte';
  import TreeItem from './TreeItem.svelte';

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

  function save(){
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

      console.log("file: %o", file)

      let reader = new FileReader();
      reader.onload = (e) => {
        data     = JSON.parse(e.target.result)
        filename = "foo"
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
    grid-area: toolbar;
  }
  .tree {
    grid-area: tree;
  }
  .main {
    grid-area: main;
  }
  #json:not(:target) {
    display: none;
  }
</style>

<div class="root">
  <div class="toolbar">
    <button on:click={clear}>Nouveau</button>
    <button on:click={save}>Enregistrer sous...</button>
    <button on:click={open}>Ouvrir...</button>
    <a href="#json">{filename}</a>
  </div>

  <div class="tree">
    <TreeItem data={data}/>
  </div>

  <div class="main">
    <Folder name="Meuble" bind:data={data} />
    <pre id="json">{JSON.stringify(data, null, 2)}</pre>
  </div>
</div>
