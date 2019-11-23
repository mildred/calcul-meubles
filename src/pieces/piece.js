
function get_position(pos){
  switch(pos){
    case 'left':   case 'l': case 'gauche':  case 'ga': case 'zy': case 'x': return 'zy';
    case 'right':  case 'r': case 'droite':  case 'dr': case 'Zy': case 'X': return 'Zy';
    case 'top':    case 't': case 'haut':    case 'h':  case 'xZ': case 'y': return 'xZ';
    case 'bottom': case 'b': case 'bas':                case 'xz': case 'Y': return 'xz';
    case 'front':  case 'F': case 'avant':   case 'av': case 'xy': case 'z': return 'xy';
    case 'back':   case 'B': case 'arrière': case 'ar': case 'Xy': case 'Z': return 'Xy';
    default: throw `Unknown position ${pos}`
  }
}

function get_orient(orient){
  switch(orient){
    case 'xyz': case 'xzy':
    case 'yxz': case 'yzx':
    case 'zxy': case 'zyx':
      return orient
    default:
      throw `Unknown orient ${orient}`
  }
}

export default class Piece {

  constructor() {
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
  }

  update_new(props) {
    return Object.assign(Object.create(Piece.prototype), props)
  }

  get epaisseur_plateau() {
    return (this.epaisseur <= 20 - 3) ? 20 :
           (this.epaisseur <= 27 - 3) ? 27 :
           (this.epaisseur <= 35 - 3) ? 35 :
           this.epaisseur + 10;
  }

  get name(){
    return this.names.join(' ')
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

  build(longueur, largeur, epaisseur) {
    return this.update_new({
      ...this,
      arrasement:      longueur,
      longueur:        longueur,
      largeur:         largeur,
      epaisseur:       epaisseur,
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
  // returns [translation, dimension]
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

  projection(pos){
    pos = get_position(pos)
    let [x, dx] = this.dim(pos[0])
    let [y, dy] = this.dim(pos[1])
    return [x, y, dx, dy]
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
    ]
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

  cubage(factor) {
    return this.longueur * this.largeur * this.epaisseur_plateau * 1e-9 * (factor || 1)
  }

  prix(prix_cube, factor) {
    return this.cubage(factor) * prix_cube
  }

  signature() {
    return JSON.stringify(
      Object.keys(this)
        .sort()
        .filter(k => (! ['names', 'x', 'y', 'z', 'orient', 'que'].includes(k)))
        .map(k => [k, this[k]])
        .reduce((a, b) => a.concat(b), []))
  }

  merge(other){
    console.assert(this.signature() == other.signature())
    return this.update_new({
      ...this,
      que:   (this.que || 1) + (other.que || 1),
      names: this.names
        .filter((n) => other.names.includes(n))
        .concat(this.names.filter((n) => !other.names.includes(n) && !other.names.includes(`(${n})`)).map(x => x[0] == '(' ? x : `(${x})`))
        .concat(other.names.filter((n) => !this.names.includes(n) && !this.names.includes(`(${n})`)).map(x => x[0] == '(' ? x : `(${x})`))
    })
  }
}
