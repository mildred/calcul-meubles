import { get_position, get_orient } from './utils.js';
import { reduceToObject } from '../utils.js';

export default class Piece {

  constructor() {
    this.type       = 'Piece'
    this.longueur   = 0
    this.largeur    = 0
    this.epaisseur  = 0
    this.arrasement = 0
    this.x          = 0
    this.y          = 0
    this.z          = 0
    this.orient     = 'xyz'
    this.names      = []
    this.que        = 1
    this.features   = []
  }

  update(props) {
    if (props.features && props.features.length == 1 && props.features[0] == true) {
      console.log("WARNING: incorrect feature %o", props)
      throw new Exception()
    }
    return this.update_new({...this, props})
  }

  update_new(props) {
    let res = Object.assign(Object.create(Piece.prototype), props)
    if (res.features && res.features.length == 1 && res.features[0] == true) {
      console.log("WARNING: incorrect feature %o", res)
      throw new Exception()
    }
    return res
  }

  get epaisseur_plateau() {
    return (this.epaisseur <= 10) ? this.epaisseur + 3 :
           (this.epaisseur <= 20 - 3) ? 20 :
           (this.epaisseur <= 30 - 3) ? 30 :
           (this.epaisseur <= 35 - 3) ? 35 :
           (this.epaisseur <= 45 - 3) ? 45 :
           this.epaisseur + 10;
  }

  get nombre_tenons(){
    return (this.longueur_tenon1 ? 1 : 0) +
           (this.longueur_tenon2 ? 1 : 0)
  }

  get name(){
    return this.names.join(' ')
  }

  get name_list(){
    return (this.names_list || [this.names]).map(n => n.join(' '))
  }

  set_name() {
    return this.update_new({
      ...this,
      names: Array.from(arguments).filter(x => x),
    })
  }

  add_name() {
    return this.update_new({
      ...this,
      names: this.names.concat(Array.from(arguments).filter(x => x)),
    })
  }

  prefix_name() {
    return this.update_new({
      ...this,
      names: Array.from(arguments).filter(x => x).concat(this.names),
    })
  }

  // add features to the piece if they do not exist yet
  // example: group.add_features("traverse", "traverse-tenonee")
  add_features() {
    return this.update_new({
      ...this,
      features: [...this.features, ...Array.from(arguments).filter(x => x && !this.features.includes(x))],
    })
  }

  count_features() {
    return Array.from(arguments,
      feat => [feat, this.features.includes(feat) ? this.que : 0])
      .reduce(reduceToObject(0, 1), {})
  }

  multiply_que(que){
    return this.update_new({
      ...this,
      que: this.que * que
    })
  }

  build(longueur, largeur, epaisseur) {
    return this.update_new({
      ...this,
      arrasement:      longueur  || this.arrasement,
      longueur:        longueur  || this.longueur,
      largeur:         largeur   || this.largeur,
      epaisseur:       epaisseur || this.epaisseur,
    })
  }

  ajout_tenons(longueur_tenon1, longueur_tenon2) {
    if(longueur_tenon2 === undefined) longueur_tenon2 = longueur_tenon1
    return this.update_new({
      ...this,
      arrasement:      this.arrasement || this.longueur,
      longueur:        this.longueur + longueur_tenon1 + longueur_tenon2,
      longueur_tenon1: (this.longueur_tenon1 || 0) + longueur_tenon1,
      longueur_tenon2: (this.longueur_tenon2 || 0) + longueur_tenon2,
    })
  }

  usine_tenons(longueur_tenon1, longueur_tenon2) {
    if(longueur_tenon2 === undefined) longueur_tenon2 = longueur_tenon1
    return this.update_new({
      ...this,
      arrasement:      this.arrasement - longueur_tenon1 - longueur_tenon2,
      longueur_tenon1: (this.longueur_tenon1 || 0) + longueur_tenon1,
      longueur_tenon2: (this.longueur_tenon2 || 0) + longueur_tenon2,
    })
  }

  //  rx  ry  rz    x   y   z     orienté comme
  //
  //  0   0   0     ep  la  Lo    traverse coté       la  ep  Lo    une traverse de haut/bas direction av/ar
  //  0   0   1     la  ep  Lo    traverse bas av/ar  ep  la  Lo    une traverse de coté direction av/ar
  //  0   1   0     Lo  la  ep    traverse de porte   Lo  ep  la    une traverse de haut/bas direction g/d
  //  1   0   0     ep  Lo  la    montant coté        la  Lo  ep    un montant de porte
  //
  //  0   1   1     la  Lo  ep    montant porte       ep  Lo  la    un montant de coté
  //  1   1   0     la  Lo  ep    montant porte       ep  Lo  la    un montant de coté
  //  1   0   1     la  Lo  ep    montant porte       Lo  la  ep    une traverse de porte
  //  1   1   1     Lo  la  ep    traverse de porte
  //
  //  rotation  x   y   z   comme
  //            ep  la  Lo  traverse coté
  //  x         ep  Lo  la  montant coté
  //  y         Lo  la  ep  traverse de porte
  //  z         la  ep  Lo  traverse horizontale av/ar
  //  xy        la  Lo  ep  montant de porte
  //  xz        Lo  ep  la  traverse horizontale g/d
  //  yx        Lo  ep  la  traverse horizontale g/d
  //  yz        la  Lo  ep  montant de porte
  //  zx        la  Lo  ep  montant de porte
  //  zy        Lo  ep  la  traverse horizontale g/d
  //
  //  orientation   x   y   z
  //  xyz           Lo  la  ep    traverse de porte
  //  xzy           Lo  ep  la    traverse horiz g/d
  //  yxz           la  Lo  ep    montant de porte
  //  yzx           ep  Lo  la    montant de coté
  //  zxy           la  ep  Lo    traverse horiz av/ar
  //  zyx           ep  la  Lo    traverse de coté
  put(x, y, z, orient){
    return this.update_new({
      ...this,
      'x':      x || this.x,
      'y':      y || this.y,
      'z':      z || this.z,
      'orient': orient ? get_orient(orient) : this.orient,
    })
  }

  // axis := 'x' | 'y' | 'z' | 'X' | 'Y' | 'Z'
  // dim1 := 'longueur' | 'arrasement' | 'longueur_tenon1' | 'longueur_tenon2' | 0
  // dim2 := 'largeur' | 0
  // dim3 := 'epaisseur' | 0
  // returns [translation, dimension] (negated if axis is uppercase)
  dim(axis, dim1, dim2, dim3){
    dim1 = dim1 == undefined ? 'longueur'  : dim1
    dim2 = dim2 == undefined ? 'largeur'   : dim2
    dim3 = dim3 == undefined ? 'epaisseur' : dim3
    let sign = (axis == axis.toLowerCase()) ? 1 : -1;
    axis = axis.toLowerCase()
    let dims = [
      dim1 == 0 ? 0 : this[dim1] || 0,
      dim2 == 0 ? 0 : this[dim2] || 0,
      dim3 == 0 ? 0 : this[dim3] || 0]
    return [sign*this[axis], sign*dims[this.orient.indexOf(axis)]]
  }

  bounding_box(){
    let [xmin, dx] = this.dim('x')
    let [ymin, dy] = this.dim('y')
    let [zmin, dz] = this.dim('z')
    return {
      dx, dy, dz,
      xmin, ymin, zmin,
      xmax: xmin + dx,
      ymax: ymin + dy,
      zmax: zmin + dz,
    }
  }

  projection_polyline(pos){
    pos = get_position(pos)
    let [x, dx] = this.dim(pos[0])
    let [y, dy] = this.dim(pos[1])
    let [_1, t1x] = this.dim(pos[0], 'longueur_tenon1', 0, 0)
    let [_2, t2x] = this.dim(pos[0], 'longueur_tenon2', 0, 0)
    let [_3, t1y] = this.dim(pos[1], 'longueur_tenon1', 0, 0)
    let [_4, t2y] = this.dim(pos[1], 'longueur_tenon2', 0, 0)
    //console.log(this)
    //console.log([pos, x, dx, y, dy])
    //console.log([pos[0], this.orient.indexOf(pos[0]), t1x, t2x])
    //console.log([pos[1], this.orient.indexOf(pos[1]), t1y, t2y])
    let dx1  = Math.floor(dx/3)
    let dx2 = dx - dx1
    let dy1  = Math.floor(dy/3)
    let dy2 = dy - dy1
    return [
      // t1y: tenon ou face du bas
      [x+t1x,     y+t1y],
      [x+dx1,     y+t1y],
      [x+dx1,     y],
      [x+dx2,     y],
      [x+dx2,     y+t1y],
      // t2x: tenon ou face de droite
      [x+dx-t2x,  y+t1y],
      [x+dx-t2x,  y+dy1],
      [x+dx,      y+dy1],
      [x+dx,      y+dy2],
      [x+dx-t2x,  y+dy2],
      // t2y: tenon ou face du haut
      [x+dx-t2x,  y+dy-t2y],
      [x+dx2,     y+dy-t2y],
      [x+dx2,     y+dy],
      [x+dx1,     y+dy],
      [x+dx1,     y+dy-t2y],
      // t1x: tenon ou face gauche
      [x+t1x,     y+dy-t2y],
      [x+t1x,     y+dy2],
      [x,         y+dy2],
      [x,         y+dy1],
      [x+t1x,     y+dy1],
      // fermeture de la figure
      [x+t1x,     y+t1y],
    ].map(c => [c[0], -c[1]])
  }

  string_arrasement(){
    if (this.arrasement && this.arrasement != this.longueur) {
      return this.arrasement
    } else {
      return ''
    }
  }

  string_dimentions(){
    return `${this.longueur} x ${this.largeur} x ${this.epaisseur}`
  }

  string_dimentions_plateau(){
    return `${this.longueur} x ${this.largeur} x ${this.epaisseur_plateau}`
  }

  surface(){
    return this.longueur * this.largeur * 1e-6
  }

  cubage(factor) {
    return this.longueur * this.largeur * this.epaisseur_plateau * 1e-9 * (factor || 1)
  }

  prix(prix_cube, factor) {
    return this.cubage(factor) * prix_cube
  }

  individual(){
    return [this]
  }

  signature() {
    return JSON.stringify(
      Object.keys(this)
        .sort()
        .filter(k => (! ['names', 'names_list', 'x', 'y', 'z', 'orient', 'que'].includes(k)))
        .map(k => [k, this[k]])
        .reduce((a, b) => a.concat(b), []))
  }

  merge(other){
    console.assert(this.signature() == other.signature())
    return this.update_new({
      ...this,
      que:   (this.que || 1) + (other.que || 1),
      names_list: [...(this.names_list||[this.names]), other.names],
      names: this.names
        .filter((n) => other.names.includes(n))
        .concat(this.names.filter((n) => !other.names.includes(n) && !other.names.includes(`(${n})`)).map(x => x[0] == '(' ? x : `(${x})`))
        .concat(other.names.filter((n) => !this.names.includes(n) && !this.names.includes(`(${n})`)).map(x => x[0] == '(' ? x : `(${x})`))
    })
  }
}
