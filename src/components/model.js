export class Model {

  constructor(mock_url) {
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

    this.currently_edited_id = -1;
    this.currently_edited_data = {};

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
  filter(perform_order) {
    this.selected_index = 0;
    this.offset = 0;

    let _this = this;
    this.filtered_data = this.raw_data.filter(row => {
      for (let key of Object.keys(row)) {
        // non respect de la casse pour la recherche
        if (String(row[key]).toLowerCase().includes(_this.searchbar.toLowerCase()))
          return true;
      }
      return false;
    });

    this.displayed_data = this.filtered_data.slice(0, this.range);
    if (perform_order)
      this.order(this.ordering);
  }

  /* filtrage lors de l'input dans l'une des barres des recherche par colonne */
  filter_by_column(criterias, perform_order) {
    this.selected_index = 0;
    this.offset = 0;
    this.filtered_data = this.raw_data.filter(row => {
      return Object.keys(criterias).every(function (key) {
        return (String(row[key]).toLowerCase().includes(criterias[key].toLowerCase()));
      });
    });

    this.displayed_data = this.filtered_data.slice(0, this.range);
    if (perform_order)
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
      function (a, b) {
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

  add(data) {
    let serial = 0;
    this.raw_data.forEach(function (r) {
      if (r['id'] > serial)
        serial = r['id']
    });

    data['id'] = serial + 1;
    this.raw_data.push(data);
    this.offset = 0;
    this.selected_index = 0;
    this.filtered_data = this.raw_data;
    this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
  }

  update_edited_row(id) {
    this.currently_edited_id = id;

    let _this = this;
    this.raw_data.forEach(function (row) {
      if (row['id'] === id)
        _this.currently_edited_data = row;
    });
  }

  edit() {
    this.filtered_data = this.raw_data;
    this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    this.currently_edited_id = -1;
  }

  remove(id) {
    for (let i = 0; i < this.filtered_data.length; i++) {
      if (this.filtered_data[i].id === id) {
        this.filtered_data.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < this.raw_data.length; i++) {
      if (this.raw_data[i].id === id) {
        this.raw_data.splice(i, 1);
        break;
      }
    }

    this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    if (this.displayed_data.length === 0 && this.selected_index > 0) {
      this.offset -= this.range;
      this.selected_index -= 1;
      this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    }

    alert("La ligne d'identifiant " + String(id) + " a bien été supprimée.");
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
