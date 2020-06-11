<script>

  export let value = null
  export let def = null
  export let size = 5
  export let step = "any"
  export let title = "";

</script>

<input
  style="width: {size+1}em"
  type=number
  bind:value={value}
  placeholder={def}
  step={step}
  title={title}
  /> min
