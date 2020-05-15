<script>
  import { getContext } from 'svelte';
  import { calculEstimations } from './estimation.js';

  export let pieces;
  export let estimations;

  let settings
  getContext('settings').subscribe(data => { settings = data })

  $: estimations = calculEstimations(settings, pieces)

  function temps(hours){
    let mins = hours % 60
    let h = (hours-mins) / 60
    return `${h.toFixed()} h ${mins.toFixed()} min`
  }
</script>

<table class="large styled">
  <caption>Estimations pour {pieces.name}</caption>
  {#each estimations.components as estim_comp}
    <tr>
      <th>{estim_comp.type}</th>
      <th colspan=3>{estim_comp.name}</th>
      <td><em>{temps(estim_comp.total)}</em></td>
    </tr>
    {#each estim_comp.postes as estim}
      <tr>
        <td></td>
        <td>{estim.name}</td>
        <td>{estim.base_value.toFixed(4)} {estim.base_unit}</td>
        <td>{temps(estim.value)} / {estim.base_unit}</td>
        <td>{temps(estim.computed)}</td>
      </tr>
    {/each}
  {/each}
  <tr>
    <th colspan=4>Total</th>
    <td>{temps(estimations.total)}</td>
  </tr>
</table>
