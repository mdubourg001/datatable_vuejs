<template>

  <div>

      <div class="toast" @click="model.toast_displayed = false"
           v-bind:class="{visible: model.toast_displayed,
         'toast-success': model.toast_type === 'success',
         'toast-error': model.toast_type === 'error',
         'toast-primary': model.toast_type === 'primary'}">
        <b>{{model.toast_message}}</b>
      </div>

    <div class="modal" id="edit-modal" v-bind:class="{active: model.edit_modal_opened}">
      <a @click="model.edit_modal_opened = false" class="modal-overlay" aria-label="Close"></a>
      <div class="modal-container">
        <div class="modal-header">
          <h4 class="d-inline-block">Ajouter un élément</h4>
          <button class="btn btn-error modal-close float-right" @click="model.edit_modal_opened = false">✖</button>
        </div>
        <div class="divider"></div>
        <div class="modal-body">
          <form class="form-horizontal" action="/" @submit.prevent="" name="edit-form">
            <div class="form-group" v-for="col in model.columns" v-if="col !== 'id'">
              <div class="col-3">
                <label class="form-label">{{col}}: </label>
              </div>
              <div class="col-9">
                <input class="form-input" type="text" :name="col"/>
              </div>
            </div>
            <br/>
            <button class="btn btn-error input-group-btn float-right" @click="submit_edit()">Insérer</button>
          </form>
        </div>
      </div>
    </div>

    <div class="modal" id="details-modal" v-bind:class="{active: model.details_modal_opened}">
      <a @click="model.close_details(false)" class="modal-overlay" aria-label="Close"></a>
      <div class="modal-container">
        <div class="modal-header">
          <h4 class="d-inline-block">Détails d'un élément</h4>
          <button class="btn btn-error modal-close float-right" @click="model.close_details(false)">✖</button>
        </div>
        <div class="divider"></div>
        <div class="modal-body">
          <table class="table">
            <thead>
            <th>Clé</th>
            <th>Valeur</th>
            </thead>
            <tr v-for="col in model.columns">
              <td><b>{{col}}</b></td>
              <td>
                <span v-if="!model.details_editing || col === 'id'">{{model.currently_detailed_data[col]}}</span>
                <input type="text" v-model="model.currently_detailed_data[col]"
                       v-if="model.details_editing && col !== 'id'"
                       class="column-value text-center">
              </td>
            </tr>
          </table>
          <br/>
          <div class="columns">
            <div class="col-6 text-center">
              <button class="btn btn-default" v-if="model.details_editing" @click="model.close_details(false)">Annuler
              </button>
            </div>
            <div class="col-6 text-center">
              <button class="btn btn-error" @click="model.details_editing = true" v-if="!model.details_editing">Editer
              </button>
              <button class="btn btn-success" v-if="model.details_editing" @click="model.close_details(true)">Valider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="columns">
        <div class="col-6 col-md-4 col-sm-12">
          <button class="btn btn-error d-inline-block"
                  @click="model.edit_modal_opened = true">Ajouter une ligne
          </button>
          <div class="hide-md form-group d-inline-block">
            <label class="label label-rounded label-warning p-2 d-inline-block" for="range-select">Éléments par
              page:</label>
            <select class="form-select d-inline-block" id="range-select" name="range"
                    v-model="model.range" @change="model.update_range()">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div class="col-6 col-md-8 col-sm-12 form-group text-right">
          <label class="hide-xs label label-rounded label-warning p-2 d-inline-block"
                 for="searchbar">Recherche: </label>
          <div class="has-icon-left d-inline-block">
            <input id="searchbar" class="form-input" type="text" placeholder="Tri par champs..."
                   v-model="model.searchbar" @input="model.filter(false)">
            <i class="icon form-icon icon-search"></i>
          </div>
        </div>
      </div>
    </div>

    <br>
    <br>

    <div class="table-wrapper">
      <table class="table">
        <thead>
        <tr>
          <th>
            <button id="delete-rows-btn" class="btn btn-sm btn-error tooltip tooltip-right"
                    v-if="model.checked_rows.length > 0"
                    data-tooltip="Supprimer les lignes sélectionnés" @click="model.remove_all()">
              <i class="icon icon-cross"></i>
            </button>
          </th>
          <th v-for="column in model.columns" @click="model.order(column)"
              :data-tooltip="'Cliquer pour trier par ' +  column" class="tooltip tooltip-bottom">
            {{ column }}
            <b v-if="model.ordering === column">&#9660;</b>
            <b v-if="model.ordering === '-' + column">&#9650;</b>
          </th>
          <th>Actions</th>
        </tr>
        <tr class="hide-md">
          <td>
            <label class="form-switch">
              <input type="checkbox" @click="model.check_all()"
                     :checked="model.displayed_data.every((x) => model.checked_rows.includes(x['id']))
                               && model.displayed_data.length > 0">
              <i class="form-icon"></i> Tous
            </label>
          </td>
          <td v-for="column in model.columns">
            <input class="form-input filter-input" type="text" @input="filter_by_column(false)"
                   :name="column" :placeholder="'Tri par ' + column + '...'">
          </td>
          <td>
            <button class="btn tooltip tooltip-left" data-tooltip="Vider les filtres" @click="clear_filters()">
              <i class="icon icon-cross"></i>
            </button>
          </td>
        </tr>
        </thead>

        <tbody>
        <tr v-for="row in model.displayed_data" v-bind:class="{checked: model.checked_rows.includes(row['id'])}">
          <td>
            <input type="checkbox" class="form-checkbox" :checked="model.checked_rows.includes(row['id'])"
                   @click="model.check_row(row['id'])">
          </td>
          <td v-for="column in model.columns">
            <input v-bind:class="{'label-lookalike': column === 'id'}" type="text" :name="column"
                   v-bind:disabled="column === 'id'" class="column-value text-center"
                   v-model="model.currently_edited_data[column]" v-if="model.currently_edited_id === row['id']">
            <span v-if="model.currently_edited_id !== row['id']">{{row[column]}}</span>
          </td>
          <td v-if="model.currently_edited_id !== row['id']" class="hide-sm">
            <div class="popover popover-left">
              <button class="btn">...</button>
              <div class="popover-container">
                <button class="btn" @click="model.show_details(row)">Détails</button>
                <button class="btn" @click="model.update_edited_row(row)">Éditer</button>
                <button class="btn btn-error" @click="model.remove(row['id'], true)">Supprimer</button>
              </div>
            </div>
          </td>
          <td v-if="model.currently_edited_id !== row['id']" class="show-sm">
            <button class="btn btn-error" @click="model.remove(row['id'])">
              <i class="icon icon-delete"></i>
            </button>
          </td>
          <td v-if="model.currently_edited_id === row['id']">
            <button class="btn btn-success tooltip" data-tooltip="Valider" @click="model.edit()">
              <i class="icon icon-check"></i>
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <br/>
    <div v-if="model.displayed_data.length === 0" class="text-center">
      <i>Aucune donnée ne peut être affichée.</i>
    </div>


    <div class="columns p-2">
      <div class="column col-6 col-md-12 pt-2">
        <p>Affichage des entrées <b>{{model.offset + 1}}</b> à <b>{{model.offset + model.range}}</b> sur <b>{{model.filtered_data.length}}</b>.
        </p>
      </div>
      <div class="column col-6 col-md-12">
        <ul id="pagination" class="pagination float-right" v-if="model.filtered_data.length > model.range">
          <li class="page-item" v-bind:class="{ disabled: model.offset - model.range < 0 }">
            <button class="btn btn-link" tabindex="-1" @click="model.previous()">Précédent</button>
          </li>

          <li class="page-item">
            <button class="btn" v-bind:class="{'btn-error' : 0 === model.selected_index,
                'btn-link': 0 !== model.selected_index}"
                    @click="model.goto_index(0)">{{ 1 }}
            </button>
          </li>

          <li class="page-item" v-if="model.selected_index > 3">
            <span>...</span>
          </li>

          <li class="page-item" v-for="(n, index) in Math.ceil(model.filtered_data.length / model.range)"
              v-if="Math.abs(model.selected_index - index) <= 2
          && index !== 0
          && index !== Math.ceil(model.filtered_data.length / model.range) - 1">
            <button class="btn" v-bind:class="{'btn-error' : index === model.selected_index,
                'btn-link': index !== model.selected_index}"
                    @click="model.goto_index(index)">{{ index +1 }}
            </button>
          </li>

          <li class="page-item" v-if="model.selected_index < Math.ceil(model.filtered_data.length / model.range) - 3">
            <span>...</span>
          </li>

          <li class="page-item">
            <button class="btn" v-bind:class="{'btn-error' : Math.ceil(model.filtered_data.length / model.range) - 1 === model.selected_index,
                'btn-link': Math.ceil(model.filtered_data.length / model.range) - 1 !== model.selected_index}"
                    @click="model.goto_index(Math.ceil(model.filtered_data.length / model.range) - 1)">{{
              Math.ceil(model.filtered_data.length / model.range) }}
            </button>
          </li>

          <li class="page-item" v-bind:class="{ disabled: model.offset + model.range >= model.filtered_data.length }">
            <button class="btn btn-link" tabindex="-1" @click="model.next()">Suivant</button>
          </li>
        </ul>
      </div>
    </div>

  </div>

</template>

<script>
  let Model = require('./model');
  let model = new Model.Model('https://raw.githubusercontent.com/mdubourg001/datatable_vuejs/master/src/assets/REDUCED_DATA.json');

  export default {
    name: "datatable",
    data() {
      return {
        model: model
      }
    },
    methods: {
      submit_edit: function () {
        let form = document.forms.namedItem('edit-form');
        let inputs = form.getElementsByTagName('input');

        let formdata = {};
        for (let i = 0; i < inputs.length; i++) {
          formdata[inputs[i].name] = inputs[i].value;
        }
        if (Object.keys(formdata).every((x) => formdata[x] === ""))
          model.display_toast('error', "Une ligne vide ne peut pas être insérée.", 3000);

        else {
          model.add(formdata);
          model.display_toast('success', "La ligne a bien été insérée.", 3000);
          model.edit_modal_opened = false;
        }
      },
      filter_by_column: function (perform_order) {
        let inputs = document.getElementsByClassName('filter-input');
        let criterias = {};
        for (let i = 0; i < inputs.length; i++) {
          if (inputs[i].value && inputs[i].value !== "")
            criterias[inputs[i].getAttribute('name')] = inputs[i].value;
        }
        model.filter_by_column(criterias, perform_order);
      },
      clear_filters: function () {
        let inputs = document.getElementsByClassName('filter-input');
        for (let i = 0; i < inputs.length; i++) {
          inputs[i].value = "";
        }
        model.filter_by_column({}, false);
      }
    }
  }
</script>

<style scoped>
  .table-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
  }

  table {
    border: 1px solid lightgray;
  }

  table tr.checked {
    background-color: rgba(255, 178, 0, 0.12);
  }

  table td, th {
    text-align: center;
  }

  th {
    cursor: pointer;
  }

  select, input {
    width: auto;
  }

  table .popover-container {
    padding-right: 15px;
    background-color: white;
    width: auto;
    border-radius: 5px;
    z-index: 400;
  }

  table .filter-input {
    width: 100%;
  }

  table .column-value {
    background-color: white;
    color: #3c3c3c;
    border: 1px solid lightgray;
    padding: 5px;
  }

  table .column-value.label-lookalike {
    background-color: transparent;
    border: none;
  }

  .popover-container button {
    width: 100%;
    margin-bottom: 5px;
  }

  .modal-container {
    padding: 30px;
  }

  .modal input:not([type="submit"]) {
    width: 100%;
  }

  .modal label {
    text-transform: capitalize;
  }

  .toast {
    position: fixed;
    bottom: 25px;
    right: 25px;
    padding: 30px;
    border-radius: 15px;
    width: inherit;
    transform: scaleY(0);
    transition: transform 0.3s ease;
    z-index: 4000;
    cursor: pointer;
  }

  .toast:hover {
    opacity: 0.8;
  }

  .toast.visible {
    transform: scaleY(1);
  }
</style>
