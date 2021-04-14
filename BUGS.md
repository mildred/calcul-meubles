Bugs en cours
=============

Bugs corrigés
=============

#1 Décalage des meubles à la suppression
----------------------------------------

- Statut: *corrigé*
- Version: `1.0.0+master.f91aff8e`

### Description

Ouvrir le fichier `2021-04-14 basile 6 3 mars, redimmensionnement four.json`,
consulter le *Caisson armoire coulissante*, revenir sur l'ensemble, supprimer ce
caisson (0-13), consulter le *Caisson frigo* et constater qu'il s'agit de
l'ancien *Caisson armoire coulissante*.

### Notes particulières

Lors de la suppression, tout se passe normalement, et juste après la
suppression, recharger la page ou ouvrir une autre instance de calcul-meubles
montre le bon caisson frigo. Par contre, sans recharger la page, si on va sur le
caisson frigo, les mesures et options deviennent celles de l'armoire
coulissante.

Cela est causé par Svelte qui ne recrée pas les éléments HTML correctement dans
la liste. Svelte supprime le dernier élément au lieu  de supprimer l'élément
enlevé.
