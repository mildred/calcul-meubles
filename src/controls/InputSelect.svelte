<script>

  export let value = null
  export let def = null
  export let force = false
  export let init = null

  if(init != null && value == null) value = init

  let defname = def
  let select
  let default_value_id =  Math.random().toString(36).substring(2) +
                          Math.random().toString(36).substring(2) +
                          Math.random().toString(36).substring(2)

  let inner_val = (def != null && value == null) ? default_value_id : value
  $: value = (def != null && inner_val == default_value_id) ? null : inner_val

  $: findDefName(select)
  function findDefName(select){
    if(!select) return
    let option = Array.from(select.options).find(op => op.value == def)
    if(option) defname = option.textContent
  }

  $: error = force && value != null && value != def

</script>
<style>
  select.error {
    box-shadow: 0 0 1.5px 1px red;
  }
</style>

<select bind:value={inner_val} bind:this={select} class:error={error}>
  {#if def != null}
  <option value="{default_value_id}">{defname} (par défaut)</option>
  {/if}
  <slot></slot>
</select>
