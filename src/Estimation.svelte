<script>
  import { getContext } from 'svelte';
  import { calculEstimations } from './estimation.js';

  export let pieces;
  export let estimations;
  let onlyMins = false;

  let settings
  getContext('settings').subscribe(data => { settings = data })

  $: estimations = calculEstimations(settings, pieces)

  function temps(all_mins, onlyMins){
    if (onlyMins) {
      return `${all_mins.toFixed()} min`
    } else {
      let mins = all_mins % 60
      let h = (all_mins-mins) / 60
      return `${h.toFixed()} h ${mins.toFixed()} min`
    }
  }
</script>

<table class="large styled">
  <caption>Estimations pour {pieces.name} (afficher <label style="display: inline"><input bind:checked={onlyMins} type=checkbox /> les minutes seulement</label>)</caption>
  {#each estimations.components as estim_comp}
    <tr>
      <th>{estim_comp.type}</th>
      <th colspan=3>{estim_comp.name}</th>
      <td><em>{temps(estim_comp.total, onlyMins)}</em></td>
    </tr>
    {#each estim_comp.postes as estim}
      <tr>
        <td></td>
        <td>{estim.name}</td>
        <td>{estim.base_value.toFixed(4)} {estim.base_unit}</td>
        <td>{temps(estim.value, onlyMins)} / {estim.base_unit}</td>
        <td>{temps(estim.computed, onlyMins)}</td>
      </tr>
    {/each}
  {/each}
  <tr>
    <th colspan=4>Total</th>
    <td>{temps(estimations.total, onlyMins)}</td>
  </tr>
</table>
