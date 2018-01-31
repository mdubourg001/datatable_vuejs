
export class Model {

  constructor(mock_path) {
    /* les datas en JSON comme on les récupère sur de la requête */
    this.raw_data = JSON.parse(http_get(mock_url));
    /* sera notre set de données après ordering et filtering */
    this.filtered_data = this.raw_data;
    this.columns = Object.keys(this.raw_data[0]);

    /* décalage des lignes affichées par rapport à la première ligne du dataset */
    this.offset = 0;
    /* nombre d'éléments affichés à par page */
    this.range = 10;

    /* index de pagination actuellement séléctionné */
    this.selected_index = 0;
    /* data actuellement affichées */
    this.displayed_data = this.filtered_data.slice(0, this.range);

    /* contenu de la searchbar */
    this.searchbar = "";
    /* nom de la colonne selon laquelle on order */
    this.ordering = "";
    this.order(this.columns[0]);
  }

  /* callback lors de l'appui sur 'Suivant' (pagination) */
  next() {
    if (this.offset + this.range < this.filtered_data.length) {
      this.offset += this.range;
      this.selected_index += 1;
      this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    }
  }

  /* callback lors de l'appui sur 'Précédent' (pagination) */
  previous() {
    if (this.offset - this.range >= 0) {
      this.offset -= this.range;
      this.selected_index -= 1;
      this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    }
  }

  /* callback lors de l'appui sur un index (pagination) */
  goto_index(index) {
    this.offset = this.range * index;
    this.selected_index = index;
    this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
  }

  /* callback lors du changement de model.range */
  update_range() {
    this.range = parseInt(this.range);
    this.offset = 0;
    this.selected_index = 0;
    this.displayed_data = this.filtered_data.slice(0, this.range);
  }

  /* filtrage lors de l'input dans la barre de recherche */
  filter() {
    this.selected_index = 0;
    this.offset = 0;

    let _this = this;
    this.filtered_data = this.raw_data.filter(row => {
      for (let key of Object.keys(row)) {
        if (String(row[key]).toLowerCase().includes(_this.searchbar.toLowerCase()))
          return true;
      }
      return false;
    });

    this.displayed_data = this.filtered_data.slice(0, this.range);
    this.order(this.ordering);
  }

  /* ordering au clic sur le nom des colonnes */
  order(column) {
    if (this.ordering === column && this.ordering.slice(0, 1) === '-')
      this.ordering = this.ordering.slice(1);
    else if (this.ordering === column)
      this.ordering = "-" + column;
    else
      this.ordering = column;

    let _this = this;
    this.filtered_data.sort(
      function(a, b) {
        if (_this.ordering.slice(0, 1) !== '-') {
          if (a[_this.ordering] < b[_this.ordering]) return -1;
          if (a[_this.ordering] > b[_this.ordering]) return 1;
          return 0;
        } else {
          if (a[_this.ordering.slice(1)] < b[_this.ordering.slice(1)]) return 1;
          if (a[_this.ordering.slice(1)] > b[_this.ordering.slice(1)]) return -1;
          return 0;
        }
      }
    );

    this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
  }

}


/* =========== FONCTIONS UTILITAIRES ========== */

/* réalise une requête HTTP GET et retourne le résultat */
function http_get(url) {
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET", url, false);
  xhttp.send(null);
  return xhttp.responseText;
}
