<script>

  export let minutes = null
  export let hours = null
  export let def = null
  export let size = 5
  export let value = null

  if(value && !hours && !minutes) {
    minutes = (value % 60) || 0
    hours   = ((value - minutes) / 60) || 0
  }

  let defMinutes, defHours
  $: defMinutes = (def % 60) || 0
  $: defHours = ((def - defMinutes) / 60) || 0
  $: value = (hours == null && minutes == null) ? null :
    (hours || defHours)*60 + (minutes || defMinutes)

  //let uiValue = value
  //$: value = (uiValue == null) ? undefined : uiValue

</script>

<input
  style="width: {size+1}em"
  type=number
  bind:value={hours}
  placeholder={defHours}
  min={0}
  /> h

<input
  style="width: {size+1}em"
  type=number
  bind:value={minutes}
  placeholder={defMinutes}
  min={0}
  /> min
