<script>

  export let checked = null
  export let def = null
  export let force = false
  export let tristate = true

  function change(e){
    let prev = !e.target.checked
    let curr = e.target.checked

    if(e.target.readOnly) {
      checked = curr
    } else if(prev == def && tristate && def !== null) {
      checked = null
      e.target.checked = prev
    } else {
      checked = curr
    }
  }

</script>

<input
  type=checkbox
  data-def={def}
  data-force={force}
  data-checked={checked}
  checked={(!checked && checked !== false) ? def : checked}
  readonly={tristate ? (!checked && checked !== false) : force}
  disabled={force}
  on:change={change}
  />

