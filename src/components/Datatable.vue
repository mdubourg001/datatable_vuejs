<template>

  <div>

    <div class="form-group d-inline-block">
      <label class="label label-rounded label-warning p-2 d-inline-block" for="range-select">Range:</label>
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
      <input id="searchbar" class="form-input d-inline-block" type="text" placeholder="Tri par champs..."
             v-model="model.searchbar" @input="model.filter()">
    </div>

    <br>
    <br>

    <table class="table table-hover">
      <thead>
      <tr>
        <th v-for="column in model.columns" @click="model.order(column)">
          {{ column }}
          <b v-if="model.ordering === column">&#9660;</b>
          <b v-if="model.ordering === '-' + column">&#9650;</b>
        </th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="row in model.displayed_data">
        <td v-for="column in model.columns">
          {{ row[column] }}
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
        <p>Affichage des entrées <b>{{model.offset + 1}}</b> à <b>{{model.offset + model.range}}</b> sur <b>{{model.filtered_data.length}}</b>.</p>
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
  let model = new Model.Model('https://raw.githubusercontent.com/vega/ipyvega/master/notebooks/cars.json');

  export default {
    name: "datatable",
    data() {
      return {
        model: model
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

  select, input {
    width: auto;
  }
</style>
