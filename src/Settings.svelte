<script>
  import { getContext } from 'svelte';
  import { get } from 'svelte/store';
  import { cleanObject, reduceToObject } from './utils.js';
  import { routeDeclare } from './route.js';
  import InputNumber from './controls/InputNumber.svelte';
  import InputDuration from './controls/InputDuration.svelte';
  import InputCheckbox from './controls/InputCheckbox.svelte';

  export let settings;
  export let settings_opened = false

  let componentNames = Object.keys(getContext('App-components'))

  let def = {
    cubeprice: 1440,
    cubemargin: 135,
    estimations: componentNames
      .map(c => [c, {}])
      .reduce(reduceToObject(), {}),
  }

  let ui = {}
  settings.subscribe(settings => {
    ui = settings
  })

  $: ui = {
    estimations: {},
    ...ui
  }

  let merged = {}
  $: merged = {
    ...def,
    ...cleanObject(ui),

    estimations: componentNames
      .map(c => [c, mergeEstimations(def.estimations[c] || {}, ui.estimations[c] || {} )])
      .reduce(reduceToObject(), {}),
  }
  $: settings.set(merged)

  function mergeEstimations(def, ui){
    return cleanObject({
      ...def,
      ...ui,
    })
  }

  let root_element;
  routeDeclare((route) => {
    settings_opened = route.settings
    return route.settings ? [root_element] : []
  })

  function addEstim(compName){
    let estimName = prompt("Quel nom donner à l'estimation :")
    if(estimName) ui.estimations[compName][estimName] = {
      value: 0,
      indice: 'constant',
    }
  }

  function removeEstim(compName, estimName){
    ui.estimations[compName][estimName] = null
    merged.estimations[compName][estimName] = null
  }

  function renameEstim(compName, estimName){
    let newName = prompt(`Renommer la phase "${estimName}" pour ${compName} en :`, estimName)
    if(!newName) return;
    ui.estimations[compName][newName] = ui.estimations[compName][estimName]
    merged.estimations[compName][newName] = merged.estimations[compName][estimName]
    ui.estimations[compName][estimName] = null
    merged.estimations[compName][estimName] = null
  }

  $: console.log('ui', ui)
  $: console.log('merged', merged)
</script>

<div class="routable" bind:this={root_element}>
  <button on:click={(e) => window.location.hash = '#/'}>Fermer</button>
  <hr/>

  <label><span>Prix du bois : </span><InputNumber bind:value={ui.cubeprice} def={def.cubeprice} min=0/> €</label>
  <label><span>Marge de cubage : </span><InputNumber bind:value={ui.cubemargin} def={def.cubemargin} min=0/> %</label>

  <h2>Estimations</h2>
  {#each componentNames as component}
    <h3>{component}</h3>
    <ul>
      {#each Object.entries(merged.estimations[component])
          .map(ent => [ent[0], ent[1], def.estimations[component][ent[0]] || {value: 0, indice: ''}])
          as [estim_name, estim, def_estim]}
        <li>
          <label>
            <span>{estim_name} : </span>
            <InputDuration bind:value={ui.estimations[component][estim_name].value} def={def_estim.value} />
            <select bind:value={ui.estimations[component][estim_name].indice}>
              <option value="">(désactivé)</option>
              <option value="constant">une fois pour toutes</option>
              <option value="per_component">par {component}</option>
              <option value="m2_ep0_20">par m² de panneau (ep ⩽ 20)</option>
              <option value="m2_ep20_plus">par m² de pièces (ep &gt; 20)</option>
              <option value="m2_plateau">par m² (toutes pièces)</option>
              <option value="nb_ep0_20">par panneau (ep ⩽ 20)</option>
              <option value="nb_ep20_plus">par nombre de pièces (ep &gt; 20)</option>
              <option value="nb_plateau">par nombre de pièces et panneaux (toutes epaisseurs)</option>
              <option value="tenon">par tenon</option>
            </select>
            <button on:click={e => removeEstim(component, estim_name)}>🗑</button>
            <button on:click={e => renameEstim(component, estim_name)}>✎</button>
          </label>
        </li>
      {/each}
      <li><button on:click={e => addEstim(component)}>Ajouter un poste</button></li>
    </ul>
  {/each}

  <hr/>
  <button on:click={(e) => window.location.hash = '#/'}>Fermer</button>
  <details>
    <summary>Contenu des préférences</summary>
    <pre>{JSON.stringify(merged, null, 2)}</pre>
  </details>
</div>
