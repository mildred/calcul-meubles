export function get_position(pos){
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

export function get_orient(orient){
  switch(orient){
    case 'xyz': case 'xzy':
    case 'yxz': case 'yzx':
    case 'zxy': case 'zyx':
      return orient
    default:
      throw `Unknown orient ${orient}`
  }
}

