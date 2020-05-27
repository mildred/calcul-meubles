<script>
  import { setContext } from 'svelte';
  import { readable, writable, get } from 'svelte/store';
  import { routeDeclare } from './route.js';
  import Settings from './Settings.svelte';
  import TreeItem from './TreeItem.svelte';
  import TreeItemOption from './TreeItemOption.svelte';
  import Ensemble from './ensembles/Ensemble.svelte';
  import Porte from './ensembles/Porte.svelte';
  import Caisson from './ensembles/Caisson.svelte';
  import Etagere from './ensembles/Etagere.svelte';
  import Facade from './ensembles/Facade.svelte';
  import Tiroir from './ensembles/Tiroir.svelte';
  let components = { Porte, Caisson, Ensemble, Etagere, Facade, Tiroir }

  setContext('App-components',  components)

  let filename = `meuble_${new Date().toISOString().slice(0,16).replace(/T/, '_').replace(/:/, '')}.json`
  let initdata = {}
  let data = {}

  $: data = {...initdata}

  //$: console.log('App initdata =', initdata)
  //$: console.log('App data =', data)

  let agencement = 'horizontal'

  let settings = writable(JSON.parse(localStorage.getItem('calcul-meubles-settings') || '{}'))
  setContext('settings', settings)
  settings.subscribe(settings => {
    if(settings.agencement && agencement != settings.agencement) agencement = settings.agencement
    //console.log("App data.settings =")
    data.settings = settings
    localStorage.setItem('calcul-meubles-settings', JSON.stringify(settings))
  })
  $: settings.update(settings => ({
      ...settings,
      agencement: agencement,
    }))

  let item = JSON.parse(localStorage.getItem('calcul-meubles-data') || 'null')
  let fileData = localStorage.getItem('calcul-meubles-file-data')
  if(item) {
    initdata = item.data
    filename = item.filename
  }

  $: localStorage.setItem('calcul-meubles-data', JSON.stringify({data: data, filename: filename}))
  $: localStorage.setItem('calcul-meubles-file-data', fileData)

  function clear(){
    if(!isSaved()) {
      if(!confirm("Fichier non enregistré, voulez-vous continuer et perdre les modifications en cours?")) return
      localStorage.setItem('calcul-meubles-data-backup', localStorage.getItem('calcul-meubles-data'))
      localStorage.setItem('calcul-meubles-file-data-backup', localStorage.getItem('calcul-meubles-file-data'))
    }
    localStorage.removeItem('calcul-meubles-data')
    localStorage.removeItem('calcul-meubles-file-data')
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
    if(data.children.length == 0) return true;
    let json = JSON.stringify(data, null, 2)
    if (json == fileData) return true;
    console.log("isSaved() = false", json, fileData)
    return false;
  }

  function simpleSave(){
    if(save(false) == 'already-saved') {
      alert("Déjà enregistré")
    }
  }

  function save(saveAs){
    if(!saveAs && isSaved()){
      return 'already-saved';
    }
    let json = JSON.stringify(data, null, 2)

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
        initdata = JSON.parse(e.target.result)
        settings.set(initdata.settings || {})
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
    window.location.hash = e.target.value
  }

  function openSettings(){
    window.location.hash = '#/settings'
  }

  let root_target;
  routeDeclare((route) => {
    return route.root ? [root_target] : []
  })

  function onDataChange(e) {
    //console.log(`App datachange{${Object.keys(e.detail).join()}} = %o`, e.detail);
    data = e.detail.data
  }
</script>

<style>
  button, select {
    margin: 0;
  }
  .tree button, .tree select {
    padding: 1px;
  }
  .root {
    display: flex;
    grid-template-rows: 3rem auto;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "toolbar toolbar"
      "tree main";
    flex-flow: row nowrap;
    height: 100%
  }
  .agencement-horizontal.root {
    display: grid;
    grid-template-columns: auto;
    grid-template-areas:
      "toolbar"
      "main";
  }
  .root.agencement-vertical .tree {
    flex: 0 0 auto
  }
  .toolbar {
    padding: 4px;
    grid-area: toolbar;
    background-color: var(--light-bg-color);
    border-bottom: solid 1px var(--border-color);
  }
  .open-save-buttons {
    display: grid;
    align-content: stretch;
    grid-template-rows: repeat(2, 50fr);
    grid-template-columns: repeat(2, auto);
  }
  .tree {
    grid-area: tree;
    background-color: var(--light-bg-color);
    border-right: solid 1px var(--border-color);
    overflow: auto;
    width: 15rem;
    resize: horizontal;
  }
  .tree :global(ul) {
    padding-left: 1em;
  }
  .tree :global(ul) :global(ul) {
    /*border-left: solid 1px var(--border-color);*/
  }
  .agencement-horizontal .tree {
    display: none;
  }
  .root.agencement-vertical .tree-select {
    display: none;
  }
  .main {
    flex: 1 1 auto;
    grid-area: main;
    overflow: auto;
    justify-self: stretch;
  }

  @media print {
    .root, .main {
      display: block !important;
      overflow: visible !important;
      height: auto;
    }
  }
</style>

<div class="root agencement-{agencement}">

  {#if agencement == 'horizontal'}
  <div class="toolbar">
    <select on:change={moveTree} class="tree-select">
      <option value='#/settings'>Paramètres</option>
      <TreeItemOption data={data}/>
    </select>
    <button on:click={clear}>Effacer</button>
    <button on:click={simpleSave}>Enregistrer</button>
    <button on:click={saveAs}>Enregistrer sous...</button>
    <button on:click={open}>Ouvrir...</button>
    {filename} <a href="@" on:click|preventDefault={rename}>✎</a>
    <div style="float: right">
      <label style="display: inline">
        Agencement :
        <select bind:value={agencement}>
          <option value='horizontal'>Horizontal</option>
          <option value='vertical'>Vertical</option>
        </select>
      </label>
      <button on:click={openSettings}>Paramètres...</button>
    </div>
  </div>
  {/if}

  <div class="tree">
    {#if agencement == 'vertical'}
      <div class="open-save-buttons">
        <select bind:value={agencement}>
          <option value='horizontal'>Agencement horizontal</option>
          <option value='vertical'>Agencement vertical</option>
        </select>
        <button on:click={openSettings}>Paramètres...</button>
        <button on:click={simpleSave}>Enregistrer</button>
        <button on:click={saveAs}>Enregistrer sous...</button>
        <button on:click={clear}>Nouveau</button>
        <button on:click={open}>Ouvrir...</button>
      </div>
      <p>{filename} <a href="@" on:click|preventDefault={rename}>✎</a></p>
    {/if}
    <ul>
      <li>
        <TreeItem data={data}/>
      </li>
      {#if agencement == 'vertical'}
        <li><a href="@" on:click|preventDefault={openSettings}>Paramètres...</a></li>
      {/if}
    </ul>
  </div>

  <div class="main">
    <Ensemble name="Meuble" initdata={initdata} on:datachange={onDataChange} />
    <div class="routable" bind:this={root_target}>
      <details>
        <summary>Contenu du fichier</summary>
        <pre id="json">{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
    <Settings bind:settings={settings} />
  </div>
</div>
