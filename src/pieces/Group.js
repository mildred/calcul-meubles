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
    let res = this.update({'x': x, 'y': y, 'z': z})
    console.log("group", res, {'x': x, 'y': y, 'z': z})
    return res
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
      ), null)
    return {
      xmin: this.x + res.xmin,
      xmax: this.x + res.xmax,
      ymin: this.y + res.ymin,
      ymax: this.y + res.ymax,
      zmin: this.z + res.zmin,
      zmax: this.z + res.zmax,
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
    return [this.dim(pos[0]), this.dim(pos[1])]
  }
}
