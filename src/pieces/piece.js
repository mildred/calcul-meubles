export default class Piece {

  constructor(longueur, largeur, epaisseur, arrasement) {
    this.longueur  = longueur
    this.largeur   = largeur
    this.epaisseur = epaisseur
    this.arrasement = arrasement

    this.epaisseur_plateau =
      (epaisseur <= 20 - 3) ? 20 :
      (epaisseur <= 27 - 3) ? 27 :
      (epaisseur <= 35 - 3) ? 35 :
      epaisseur + 10;
  }

  string_dimentions(){
    return `${this.longueur} x ${this.largeur} x ${this.epaisseur}`
  }

  string_dimentions_plateau(){
    return `${this.longueur} x ${this.largeur} x ${this.epaisseur_plateau}`
  }

  cubage() {
    return this.longueur * this.largeur * this.epaisseur_plateau * 1e-9
  }

  prix(prix_cube) {
    return this.cubage() * prix_cube
  }
}
