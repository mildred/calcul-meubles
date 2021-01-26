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

  function csv_line(line){
    return line.map(x => `${x}`.replaceAll('"', '""')).map(x => `"${x}"`).join(',')
  }

  function save(){
    let lines = []
    let row = lines.length + 1

    lines.push(csv_line(["Indices"]))
    let indices_first_row = lines.length + 1
    for(let poste of settings.postes_estimations) {
      row = lines.length + 1
      lines.push(csv_line([
        "",
        poste.name,
        "", "",
        poste.value, "min",
        poste.indice, "",
        `=CONCAT(TRUNC(E${row}/60), "h ", TRUNC(MOD(E${row}, 60)), "min")`
      ]))
    }

    row = lines.length + 1
    let first_row = row

    for(let estim_comp of estimations.components) {
      lines.push("")

      row = lines.length + 1
      lines.push(csv_line([
        estim_comp.type,
        estim_comp.name,
        "", "", "", "",
        `=SUBTOTAL(9;G${row+1}:G${row+estim_comp.postes.length})`, "min",
        `=CONCAT(TRUNC(G${row}/60), "h ", TRUNC(MOD(G${row}, 60)), "min")`
      ]))

      for(let estim of estim_comp.postes) {
        row = lines.length + 1
        lines.push(csv_line([
          "",
          `=B${estim.estim_idx+indices_first_row}`,
          estim.base_value.toFixed(4), estim.base_unit,
          `=E${estim.estim_idx+indices_first_row}`, `min / ${estim.base_unit}`,
          `=C${row}*E${row}`, "min",
          `=CONCAT(TRUNC(G${row}/60), "h ", TRUNC(MOD(G${row}, 60)), "min")`
        ]))
      }
    }

    lines.push("")

    row = lines.length + 1
    lines.push(csv_line([
      "Total",
      "",
      "", "", "", "",
      `=SUBTOTAL(9;G${first_row}:G${row-1})`, "min",
      `=CONCAT(TRUNC(G${row}/60), "h ", TRUNC(MOD(G${row}, 60)), "min")`
      ]))

    let csv = "\uFEFF" + lines.join("\n")

    let filename = (prompt("Nom du fichier :", `estimation - ${name}`) || "liste de débit") + ".csv"

    let file = new window.File([csv], filename, {
      type: 'text/csv'
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
    } finally {
      URL.revokeObjectURL(url)
    }
  }
</script>

<table class="large styled">
  <caption>Estimations pour {pieces.name} (afficher <label style="display:
  inline"><input bind:checked={onlyMins} type=checkbox /> les minutes
  seulement</label>, <a href="javascript:void(0)" on:click={save}>ouvrir dans un
  tableur</a>)</caption>
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
