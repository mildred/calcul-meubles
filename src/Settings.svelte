<script>
  import { version } from '../package.json';
  import { getContext } from 'svelte';
  import { get } from 'svelte/store';
  import { cleanObject, reduceToObject } from './utils.js';
  import { routeDeclare } from './route.js';
  import InputNumber from './controls/InputNumber.svelte';
  import InputSelect from './controls/InputSelect.svelte';
  import InputDurationMin from './controls/InputDurationMin.svelte';
  import InputCheckbox from './controls/InputCheckbox.svelte';

  export let settings;
  export let settings_opened = false

  let componentNames = Object.keys(getContext('App-components'))

  let def = {
    cubeprice: 1440,
    cubemargin: 135,
    porte_type: 'contre-profil',
    postes_estimations: [],
  }

  let ui = {}
  settings.subscribe(settings => {
    ui = settings
  })

  $: ui = {
    postes_estimations: [],
    ...ui
  }

  let merged = {}
  $: merged = {
    ...def,
    ...cleanObject(ui),
  }
  $: settings.set(merged)

  let root_element;
  routeDeclare((route) => {
    settings_opened = route.settings
    return route.settings ? [root_element] : []
  })

  function addEstim(){
    let estimName = prompt("Quel nom donner à l'estimation :")
    if(estimName) ui.postes_estimations = [...ui.postes_estimations, {
      name: estimName,
      value: 0,
      indice: 'constant',
      components: componentNames.reduce((h,c) => (h[c]=true, h), {}),
    }]
    console.log(ui.postes_estimations)
  }

  function removeEstim(idx){
    ui.postes_estimations.splice(idx, 1)
    ui.postes_estimations = ui.postes_estimations
  }

  function renameEstim(idx){
    let poste = ui.postes_estimations[idx]
    let newName = prompt(`Renommer la phase "${poste.name}" en :`, poste.name)
    if(!newName) return;
    ui.postes_estimations[idx].name = newName
  }

  function availableComp(ui, idx) {
    return componentNames.filter(c => ui.postes_estimations[idx].components[c])
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
        let data = JSON.parse(e.target.result)
        if(data.settings) settings.set(data.settings)
      }
      reader.readAsText(file);
    }, false)

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }
</script>

<style>
  .estim label {
    display: inline
  }
</style>

<div class="routable" bind:this={root_element}>
  <button on:click={(e) => window.location.hash = '#/'}>Fermer</button>
  <p><small>(version {version})</small></p>
  <hr/>
  <label>
    <span>Type de porte : </span>
    <InputSelect def={def.porte_type} bind:value={ui.porte_type}>
      <option value="tenon-mortaise">tenon et mortaise</option>
      <option value="contre-profil">contre profil</option>
      <option value="onglet">coupe d'onglet</option>
    </InputSelect>
  </label>
  <hr/>

  <label><span>Prix du bois : </span><InputNumber bind:value={ui.cubeprice} def={def.cubeprice} min=0/> €</label>
  <label><span>Marge de cubage : </span><InputNumber bind:value={ui.cubemargin} def={def.cubemargin} min=0/> %</label>

  <h2>Postes</h2>
  <table class="estim">
    <tr>
      <th>Nom</th>
      <th>Temps (min)</th>
      <th>Indice</th>
      <th>&nbsp;</th>
      {#each componentNames as comp}
        <th>{comp}</th>
      {/each}
    </tr>
    {#each merged.postes_estimations as estim, idx}
      <tr>
        <td>{estim.name} :</td>
        <td><InputDurationMin bind:value={ui.postes_estimations[idx].value} /></td>
        <td>
          <select bind:value={ui.postes_estimations[idx].indice}>
            <option value="">(désactivé)</option>
            <optgroup label="par opération...">
              <option value="constant">une fois pour toutes</option>
              <option value="per_component">par élément ({availableComp(ui, idx).join(', ')})</option>
              <option value="per_ferrage_charniere">par ferrage de charnières</option>
              <option value="tenon">par tenon</option>
            </optgroup>
            <optgroup label="par type de pièce...">
              <option value="m2_trav_mont_cp">par m² de montants ou traverses à contre-profil</option>
              <option value="m2_trav_mont_ncp">par m² de montants ou traverses (sauf contre-profil)</option>
              <option value="m2_trav_mont">par m² de montants ou traverses (tous)</option>
              <option value="m2_panneau">par m² de panneaux montés en rainure</option>
              <option value="m2_panneau_seul">par m² de panneaux libres</option>
              <option value="m2_panneau_tous">par m² de panneaux (tous)</option>
              <option value="m2_cote">par m² de côtés de tiroir</option>
              <option value="m2_plateau">par m² (toutes pièces)</option>
              <option value="nb_trav_mont_cp">par nombre de montants ou traverses à contre-profil</option>
              <option value="nb_trav_mont_ncp">par nombre de montants ou traverses (sauf contre-profil)</option>
              <option value="nb_trav_mont">par nombre de montants ou traverses (tous)</option>
              <option value="nb_panneau">par nombre de panneaux montés en rainure</option>
              <option value="nb_panneau_seul">par nombre de panneaux libres</option>
              <option value="nb_panneau_tous">par nombre de panneaux (tous)</option>
              <option value="nb_cote">par nombre de côtés de tiroir</option>
              <option value="nb_plateau">par nombre total de pièces</option>
            </optgroup>
            <optgroup label="par épaisseur...">
              <option value="m2_ep0_20">par m² de panneau (ep ⩽ 20)</option>
              <option value="m2_ep20_plus">par m² de pièces (ep &gt; 20)</option>
              <option value="nb_ep0_20">par panneau (ep ⩽ 20)</option>
              <option value="nb_ep20_plus">par nombre de pièces (ep &gt; 20)</option>
            </optgroup>
          </select>
        </td>
        <td>
          <button on:click={e => removeEstim(idx)}>🗑</button>
          <button on:click={e => renameEstim(idx)}>✎</button>
        </td>
        {#each componentNames as comp}
          <td>
            <label>
              <InputCheckbox bind:checked={ui.postes_estimations[idx].components[comp]} title={comp}/>
              {comp.substr(0,2)}
            </label>
          </td>
        {/each}
      </tr>
    {/each}
    <li><button on:click={e => addEstim()}>Ajouter un poste</button></li>
  </table>

  <hr/>
  <button on:click={(e) => window.location.hash = '#/'}>Fermer</button>
  <button on:click={open}>Ouvrir...</button>
  <details>
    <summary>Contenu des préférences</summary>
    <pre>{JSON.stringify(merged, null, 2)}</pre>
  </details>
</div>
