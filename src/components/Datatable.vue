<template>

  <div>

    <button class="btn btn-error" @click="open_edit">Ajouter une ligne</button>
    <div class="modal" id="edit-modal">
      <div class="modal-container">
        <div class="modal-header">
          <h4 class="d-inline-block">Ajouter un élément</h4>
          <button class="btn btn-error modal-close float-right" @click="close_edit">✖</button>
        </div>
        <div class="divider"></div>
        <div class="modal-body">
          <form class="form-horizontal" action="/" @submit.prevent="submit_edit" name="edit-form">
            <div class="form-group" v-for="col in model.columns" v-if="col !== 'id'">
              <div class="col-3">
                <label class="form-label">{{col}}: </label>
              </div>
              <div class="col-9">
                <input class="form-input" type="text" :name="col"/>
              </div>
            </div>
            <br/>
            <input type="submit" class="btn btn-error input-group-btn float-right" value="Insérer">
          </form>
        </div>
      </div>
    </div>

    <div class="form-group d-inline-block">
      <label class="label label-rounded label-warning p-2 d-inline-block" for="range-select">Éléments par page:</label>
      <select class="form-select d-inline-block" id="range-select" name="range"
              v-model="model.range" @change="model.update_range()">
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>

    <div class="form-group d-inline-block float-right">
      <label class="label label-rounded label-warning p-2 d-inline-block" for="searchbar">Recherche: </label>
      <div class="has-icon-left d-inline-block">
        <input id="searchbar" class="form-input" type="text" placeholder="Tri par champs..."
               v-model="model.searchbar" @input="model.filter(false)">
        <i class="icon form-icon icon-search"></i>
      </div>
    </div>

    <br>
    <br>

    <table class="table table-striped table-hover">
      <thead>
      <tr>
        <th v-for="column in model.columns" @click="model.order(column)">
          {{ column }}
          <b v-if="model.ordering === column">&#9660;</b>
          <b v-if="model.ordering === '-' + column">&#9650;</b>
        </th>
        <th>Actions</th>
      </tr>
      <tr>
        <td v-for="column in model.columns">
          <input class="form-input filter-input" type="text" @input="filter_by_column(false)"
                 :name="column" :placeholder="'Tri par ' + column + '...'">
        </td>
        <td><!-- Vide pour la colonne Actions --></td>
      </tr>
      </thead>

      <tbody>
      <tr v-for="row in model.displayed_data">
        <td v-for="column in model.columns">
          <input v-bind:class="{'label-lookalike': column === 'id'}" type="text" :name="column"
                 v-bind:disabled="column === 'id'" class="column-value text-center"
                 v-model="model.currently_edited_data[column]" v-if="model.currently_edited_id === row['id']">
          <span v-if="model.currently_edited_id !== row['id']">{{row[column]}}</span>
        </td>
        <td v-if="model.currently_edited_id !== row['id']">
          <div class="popover popover-left">
            <button class="btn">...</button>
            <div class="popover-container">
              <button class="btn" @click="model.update_edited_row(row['id'])">Éditer</button>
              <button class="btn btn-error" @click="model.remove(row['id'])">Supprimer</button>
            </div>
          </div>
        </td>
        <td v-if="model.currently_edited_id === row['id']">
          <button class="btn btn-success tooltip" data-tooltip="Valider" @click="model.edit()">
            <i class="icon icon-check"></i>
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <br/>
    <div v-if="model.displayed_data.length === 0" class="text-center">
      <i>Aucune donnée ne peut être affichée.</i>
    </div>


    <div class="columns p-2">
      <div class="column col-lg-6 col-md-12 pt-2">
        <p>Affichage des entrées <b>{{model.offset + 1}}</b> à <b>{{model.offset + model.range}}</b> sur <b>{{model.filtered_data.length}}</b>.
        </p>
      </div>
      <div class="column col-lg-6 col-md-12">
        <ul id="pagination" class="pagination float-right" v-if="model.filtered_data.length > model.range">
          <li class="page-item" v-bind:class="{ disabled: model.offset - model.range < 0 }">
            <a href="#" tabindex="-1" @click="model.previous()">Précédent</a>
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
            <a href="#" tabindex="-1" @click="model.next()">Suivant</a>
          </li>
        </ul>
      </div>
    </div>

  </div>

</template>

<script>
  let Model = require('./model');
  let model = new Model.Model('https://raw.githubusercontent.com/mdubourg001/datatable_vuejs/master/src/assets/MOCK_DATA.json');

  export default {
    name: "datatable",
    data() {
      return {
        model: model
      }
    },
    methods: {
      open_edit: function () {
        document.getElementById('edit-modal').classList.add('active');
      },
      close_edit: function () {
        document.getElementById('edit-modal').classList.remove('active');
      },
      submit_edit: function () {
        let form = document.forms.namedItem('edit-form');
        let inputs = form.getElementsByTagName('input');

        let formdata = {};
        for (let i = 0; i < inputs.length; i++) {
          formdata[inputs[i].name] = inputs[i].value;
        }
        if (Array(formdata).every((x) => formdata[x] === ""))
          alert('Une ligne entièrement vide ne peut pas être insérée.');

        else {
          model.add(formdata);
          alert("La ligne a bien été insérée");
          this.close_edit();
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
      }
    }
  }
</script>

<style scoped>
  table {
    border: 1px solid lightgray;
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
    padding: 15px;
    background-color: white;
    width: auto;
    border-radius: 5px;
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
</style>
