export class Model {

  constructor(mock_url) {
    /* les datas en JSON comme on les récupère de la requête */
    this.raw_data = JSON.parse(Model.http_get(mock_url));
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

    this.currently_detailed_data = {};
    this.details_editing = false;

    this.checked_rows = [];
    this.edit_modal_opened = false;
    this.details_modal_opened = false;

    this.toast_message = "";
    this.toast_type = "success";
    this.toast_displayed = false;

    this.order(this.columns[0]);
    this.display_toast('primary', String(this.raw_data.length) + " lignes on été chargées.", 5000)
  }

  /* callback lors de l'appui sur 'Suivant' (pagination) */
  next() {
    if (this.offset + this.range < this.filtered_data.length) {
      this.offset += this.range;
      this.selected_index += 1;
      this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    }
    this.checked_rows = [];
  }

  /* callback lors de l'appui sur 'Précédent' (pagination) */
  previous() {
    if (this.offset - this.range >= 0) {
      this.offset -= this.range;
      this.selected_index -= 1;
      this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    }
    this.checked_rows = [];
  }

  /* callback lors de l'appui sur un index (pagination) */
  goto_index(index) {
    this.offset = this.range * index;
    this.selected_index = index;
    this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    this.checked_rows = [];
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

    this.checked_rows = [];
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

    this.checked_rows = [];
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
    this.checked_rows = [];
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

  update_edited_row(row) {
    this.currently_edited_id = row['id'];
    this.currently_edited_data = row;
  }

  edit() {
    this.filtered_data = this.raw_data;
    this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    this.currently_edited_id = -1;
  }

  remove(id, show_alert) {
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

    if (this.checked_rows.includes(id))
      this.checked_rows.splice(this.checked_rows.indexOf(id), 1);

    if (show_alert)
      this.display_toast('success', "La ligne d'identifiant " + String(id) + " a bien été supprimée.");
  }

  remove_all() {
    let _this = this;
    let checked_rows_copy = this.checked_rows.slice();
    checked_rows_copy.forEach(function (id) {
      _this.remove(id);
    });
    this.display_toast('success', "Toutes les lignes cochées ont été supprimées.");
    this.checked_rows = [];
  }

  check_row(id) {
    if (this.checked_rows.includes(id))
      this.checked_rows.splice(this.checked_rows.indexOf(id), 1);
    else
      this.checked_rows.push(id);
  }

  check_all() {
    if (this.checked_rows.length >= this.displayed_data.length) {
      this.checked_rows = [];
    } else {
      for (let r of this.displayed_data)
        this.checked_rows.push(r['id']);
    }
  }

  show_details(row) {
    this.details_modal_opened = true;
    this.currently_detailed_data = Object.assign({}, row);
  }

  close_details(save_changes) {
    this.details_modal_opened = false;
    this.details_editing = false;

    if (save_changes) {
      let _this = this;
      for (let i = 0; i < this.raw_data.length; i++) {
        if (this.raw_data[i]['id'] === _this.currently_detailed_data['id']) {
          _this.raw_data[i] = _this.currently_detailed_data;
          break;
        }
      }

      this.filtered_data = this.raw_data;
      this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    }
  }


  /* =========== FONCTIONS UTILITAIRES ========== */

  /* réalise une requête HTTP GET et retourne le résultat */
  static http_get(url) {
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, false);
    xhttp.send(null);
    return xhttp.responseText;
  }

  /* affiche un message sous forme de toast Spectre */
  display_toast(type, message) {
    this.toast_type = type;
    this.toast_message = message;
    this.toast_displayed = true;
    let _this = this;
  }
}



