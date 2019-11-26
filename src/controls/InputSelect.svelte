<script>

  export let value = null
  export let def = null

  if(def !== null && (value === null || value === undefined)) value = def

</script>

<select bind:value={value}>
  <slot></slot>
</select>
