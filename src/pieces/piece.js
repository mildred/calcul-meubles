export default class Piece {

  constructor(longueur, largeur, epaisseur) {
    this.longueur  = longueur
    this.largeur   = largeur
    this.epaisseur = epaisseur

    this.epaisseur_plateau =
      (epaisseur < 18 - 2) ? 18 :
      (epaisseur < 24 - 2) ? 24 :
      (epaisseur < 32 - 2) ? 32 :
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
