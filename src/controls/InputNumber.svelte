<script>

  export let value = null
  export let def = null
  export let force = false
  export let min = null
  export let max = null
  export let step = null
  export let size = 5

  $: ui = {
    placeholder: def,
    min: force ? def : min,
    max: force ? def : max,
    step: step || 'any',
  }

  //let uiValue = value
  //$: value = (uiValue == null) ? undefined : uiValue

</script>

<input
  style="width: {parseInt(size)+1}em"
  type=number
  bind:value={value}
  placeholder={ui.placeholder}
  min={ui.min}
  max={ui.max}
  step={ui.step}
  />
