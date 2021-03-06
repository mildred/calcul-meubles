<script>
  import { onMount, getContext } from 'svelte';
  import { cleanObject, pipeline } from '../utils.js';
  import InputNumber from '../controls/InputNumber.svelte';
  import InputCheckbox from '../controls/InputCheckbox.svelte';
  import InputSelect from '../controls/InputSelect.svelte';
  import Component from '../Component.svelte';
  import Cote from '../draw/Cote.svelte';
  import Piece from '../pieces/piece.js';
  import Group from '../pieces/Group.js';
  import SVGPiece from '../pieces/SVGPiece.svelte';
  import SVGDrawing from '../pieces/SVGDrawing.svelte';
  import ListeDebit from '../ListeDebit.svelte'

  export let path
  export let initdata = {}

  let settings
  getContext('settings').subscribe(data => { settings = data })

  let data = {...initdata}

  let defaults = {
    quantite: 1,
    type:  'contre-profil',
    largeur: 400,
    hauteur: 600,
    epaisseur: 22,
    largeur_montants: 70,
    largeur_traverses: 70,
    profondeur_tenons: 30,
    profondeur_rainure: 10,
    profondeur_profil: 15,
    encastree: false,
    jeu_encastrement: 2,
    jeu_rainure: 1,
    epaisseur_panneau: 16,
    inclure_panneau: true,
    ferrage: 'charnieres',
    ...initdata.defaults
  }

  let opt = { ...initdata.opt }
  let ui  = { ...(initdata.ui || initdata.opt) }

  $: opt = pipeline(
    {
      ...defaults,
      ...cleanObject({
        type: settings.porte_type
      }),
      ...cleanObject(ui)
    },
    opt => ({
      largeur_traverse_h: opt.largeur_traverses,
      largeur_traverse_b: opt.largeur_traverses,
      ...opt
    }))

  $: data.opt = opt
  $: data.ui  = ui
  let state = {}

  let zoom = 0.25

  $: jeu_encastrement = opt.encastree ? opt.jeu_encastrement : 0

  $: montant = new Piece()
    .add_name("Montant")
    .add_features(opt.type == 'contre-profil' ? 'montant-cp' : 'montant')
    .build(opt.hauteur - 2*jeu_encastrement, opt.largeur_montants, opt.epaisseur)
  $: montant_g = montant
    .add_name("gauche")
    .put(jeu_encastrement, jeu_encastrement, 0, 'yxz')
  $: montant_d = montant
    .add_name("droit")
    .put(jeu_encastrement + opt.largeur - opt.largeur_montants, jeu_encastrement, 0, 'yxz')

  $: traverse =
    (opt.type == 'contre-profil')  ? new Piece()
      .add_name("Traverse")
      .add_features('traverse-cp')
      .build(
        opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_profil) - 2*jeu_encastrement,
        0,
        opt.epaisseur):
    (opt.type == 'tenon-mortaise') ? new Piece()
      .add_name("Traverse")
      .add_features('traverse')
      .build(
        opt.largeur - 2 * opt.largeur_montants - 2*jeu_encastrement,
        0,
        opt.epaisseur)
      .ajout_tenons(opt.profondeur_tenons):
    (opt.type == 'onglet') ? new Piece()
      .add_name("Traverse")
      .add_features('traverse')
      .build(opt.largeur, 0, opt.epaisseur):
    new Piece();
  $: traverse_xpos =
    (opt.type == 'contre-profil')  ? opt.largeur_montants - opt.profondeur_profil:
    (opt.type == 'tenon-mortaise') ? opt.largeur_montants - opt.profondeur_tenons:
    (opt.type == 'onglet')         ? 0:
    0;
  $: traverse_h = traverse
    .add_name("haut")
    .build(null, opt.largeur_traverse_h)
    .put(jeu_encastrement + traverse_xpos, jeu_encastrement + opt.hauteur-opt.largeur_traverse_h, 0, 'xyz')
  $: traverse_b = traverse
    .add_name("bas")
    .build(null, opt.largeur_traverse_b)
    .put(jeu_encastrement + traverse_xpos, jeu_encastrement, 0, 'xyz')
  $: panneau = (
    (opt.type == 'contre-profil')  ? new Piece()
      .build(
        opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure) - 2*jeu_encastrement,
        opt.hauteur + 2 * (opt.profondeur_rainure - opt.jeu_rainure)
          - opt.largeur_traverse_h - opt.largeur_traverse_b
          - 2*jeu_encastrement,
        opt.epaisseur_panneau):
    (opt.type == 'tenon-mortaise') ? new Piece()
      .build(
        opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure),
        opt.hauteur + 2 * (opt.profondeur_rainure - opt.jeu_rainure)
          - opt.largeur_traverse_h - opt.largeur_traverse_b,
        opt.epaisseur_panneau):
    (opt.type == 'onglet') ? new Piece()
      .build(
        opt.largeur - 2 * (opt.largeur_montants - opt.profondeur_rainure + opt.jeu_rainure),
        opt.hauteur + 2 * (opt.profondeur_rainure - opt.jeu_rainure)
          - opt.largeur_traverse_h - opt.largeur_traverse_b,
        opt.epaisseur_panneau):
    new Piece())
    .add_name("Panneau")
    .add_features('panneau')
    .put(
      jeu_encastrement + montant.largeur - opt.profondeur_rainure + opt.jeu_rainure,
      jeu_encastrement + traverse_b.largeur - opt.profondeur_rainure + opt.jeu_rainure,
      0,
      'xyz')

  $: pieces = [
    opt.inclure_panneau ? panneau : null,
    traverse_h, traverse_b,
    montant_g, montant_d,
  ].filter(x => x != null).map(p => p.multiply_que(opt.quantite))

  $: state.pieces_group = new Group(pieces, `Porte ${data.name}`, 'Porte')
    .add_features(`ferrage-${opt.ferrage}`)

</script>

<style>
  form > * {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    max-width: 30em;
  }
  form > * > *:first-child {
    flex-grow: 1;
  }
  hr.clear {
    clear: both;
    border: none;
  }
  table {
    clear: both;
  }
</style>

<Component bind:data={data} state={state} path={path} on:datachange>
  <div slot="plan">
    <SVGDrawing pieces={pieces} name={`Porte ${data.name}`} />

    <!--<img src="porte.svg" />-->
    <p>Zoom : <input type=range bind:value={zoom} min=0 max=1 step=.05> {zoom*100} %</p>
    <svg
        width="{zoom*opt.largeur + 25}"
        height="{zoom*opt.hauteur + 65}">
      <Cote zoom={zoom} x=20 y=0 dim={[
          {
            text: "largeur: ",
            start: 0,
            length: opt.largeur,
            row: 2,
          },
          {
            text: "lon. traverse: ",
            start: traverse_h.x,
            length: traverse_h.longueur,
            row: 1,
          },
          {
            start: montant_g.x,
            length: montant_g.largeur,
            row: 0,
          },
          {
            start: montant_d.x,
            length: montant_d.largeur,
            row: 0,
          }
        ]} />
      <Cote zoom={zoom} x=0 y=60 pos=left dim={[
          {
            text: "hauteur: ",
            start: 0,
            length: opt.hauteur,
            row: 0,
          }
        ]} />
      <g transform="translate(20, {60 + zoom*opt.hauteur}) scale({zoom} {zoom})">
        {#each pieces as piece}
          <SVGPiece piece={piece} pos="avant" />
        {/each}
      </g>
    </svg>
  </div>

  <div class="main" slot="dim">
    <form>
    <!-- buggy
    <label><span>Quantité : </span><InputNumber min=1 bind:value={ui.quantite} def={defaults.quantite}/></label>
    -->
    <label>
      <span>Ferrage : </span>
      <InputSelect def={defaults.ferrage} bind:value={ui.ferrage} force={defaults.force_ferrage}>
        <option value="aucun">aucun</option>
        <option value="charnieres">charnières</option>
      </InputSelect>
    </label>
    <label>
      <span>Type : </span>
      <InputSelect def={defaults.type} bind:value={ui.type}>
        <option value="tenon-mortaise">tenon et mortaise</option>
        <option value="contre-profil">contre profil</option>
        <option value="onglet">coupe d'onglet</option>
      </InputSelect>
    </label>
    <label><span>Largeur   : </span><InputNumber min=0 bind:value={ui.largeur} def={defaults.largeur} force={defaults.force_largeur}/> mm</label>
    <label><span>Hauteur   : </span><InputNumber min=0 bind:value={ui.hauteur} def={defaults.hauteur} force={defaults.force_hauteur}/> mm</label>
    <label><span>Épaisseur : </span><InputNumber min=0 bind:value={ui.epaisseur} def={defaults.epaisseur} force={defaults.force_epaisseur}/> mm</label>
    <hr/>
    <label><span>Largeur montants : </span><InputNumber min=0 bind:value={ui.largeur_montants} def={defaults.largeur_montants}/> mm</label>
    <label><span>largeur traverses : </span><InputNumber min=0 bind:value={ui.largeur_traverses} def={defaults.largeur_traverses}/> mm</label>
    <label><span>largeur traverse haut : </span><InputNumber min=0 bind:value={ui.largeur_traverse_h} def={opt.largeur_traverses}/> mm</label>
    <label><span>largeur traverse bas : </span><InputNumber min=0 bind:value={ui.largeur_traverse_b} def={opt.largeur_traverses}/> mm</label>
    <hr/>
    <label><span>Épaisseur panneau : </span><InputNumber min=0 bind:value={ui.epaisseur_panneau} def={defaults.epaisseur_panneau}/> mm</label>
    <label><span>Profondeur rainures : </span><InputNumber min=0 bind:value={ui.profondeur_rainure} def={defaults.profondeur_rainure}/> mm</label>
    <label><span>Jeu paneau / rainure : </span><InputNumber min=0 bind:value={ui.jeu_rainure} def={defaults.jeu_rainure}/> mm</label>
    {#if opt.type == 'tenon-mortaise' }
    <label><span>Profondeur tenons : </span><InputNumber min=0 bind:value={ui.profondeur_tenons} def={defaults.profondeur_tenons}/> mm</label>
    {:else if opt.type == 'contre-profil' }
    <label><span>Profondeur profil : </span><InputNumber min=0 bind:value={ui.profondeur_profil} def={defaults.profondeur_profil}/> mm</label>
    {/if}
    <label><span>Inclure le paneau</span><InputCheckbox bind:checked={ui.inclure_panneau} def={defaults.inclure_panneau} /></label>
    <hr/>
    <label><span>Encastrée</span><InputCheckbox bind:checked={ui.encastree} def={defaults.encastree} /></label>
    <label><span>jeu encastrement (tout autour) : </span><InputNumber min=0 bind:value={ui.jeu_encastrement} def={defaults.jeu_encastrement}/> mm</label>
    </form>
  </div>

  <div slot="tables">
    <ListeDebit pieces={state.pieces_group} />
  </div>
</Component>
