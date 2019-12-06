import { get_position } from './utils.js';

export default class Group {

  constructor(pieces, name) {
    this.type   = 'Group'
    this.pieces = pieces || []
    this.name   = name
    this.x = 0
    this.y = 0
    this.z = 0
  }

  update(props) {
    return this.update_new({...this, ...props})
  }

  update_new(props) {
    return Object.assign(Object.create(Group.prototype), props)
  }

  add_pieces(pieces) {
    return this.update({pieces: [...this.pieces, ...pieces]})
  }

  position(x, y, z){
    return this.update({
      'x': (x || x == 0) ? x : this.x,
      'y': (y || y == 0) ? y : this.y,
      'z': (z || z == 0) ? z : this.z,
    })
  }

  get largeur() {
    let bb = this.bounding_box()
    return bb.xmax - bb.xmin
  }

  get hauteur() {
    let bb = this.bounding_box()
    return bb.ymax - bb.ymin
  }

  get profondeur() {
    let bb = this.bounding_box()
    return bb.zmax - bb.zmin
  }

  bounding_box(){
    let keys = {
      xmin: Math.min,
      ymin: Math.min,
      zmin: Math.min,
      xmax: Math.max,
      ymax: Math.max,
      zmax: Math.max,
    }
    let res = this.pieces
      .map(p => p.bounding_box())
      .reduce((bounds, piece) => bounds === null ? piece : (
        Object.keys(keys).reduce((res, key) => ({...res, [key]: keys[key](bounds[key], piece[key])}), {})
      ), null) || {}
    return {
      xmin: this.x + (res.xmin || 0),
      xmax: this.x + (res.xmax || 0),
      ymin: this.y + (res.ymin || 0),
      ymax: this.y + (res.ymax || 0),
      zmin: this.z + (res.zmin || 0),
      zmax: this.z + (res.zmax || 0),
    }
  }

  // axis := 'x' | 'y' | 'z' | 'X' | 'Y' | 'Z'
  // returns [translation] (negated if axis is uppercase)
  dim(axis){
    let sign = (axis == axis.toLowerCase()) ? 1 : -1;
    axis = axis.toLowerCase()
    return [sign * this[axis]]
  }

  projection_position(pos){
    pos = get_position(pos)
    return [this.dim(pos[0]), -this.dim(pos[1])]
  }
}
