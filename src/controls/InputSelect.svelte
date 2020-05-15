<script>

  export let value = null
  export let def = null
  export let force = false

  if(def !== null && (value === null || value === undefined)) value = def

  let inner_val = value
  $: value = (force && inner_val == def) ? null : inner_val

</script>

<select bind:value={inner_val}>
  <slot></slot>
</select>
