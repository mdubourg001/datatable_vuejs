<template>
  <div id="app">
    <div class="container">
      <div class="col-11 col-mx-auto col-md-12">
        <datatable/>
      </div>
    </div>
  </div>
</template>

<script>
  import Datatable from './components/Datatable'

  export default {
    name: 'App',
    components: {
      Datatable
    }
  }
</script>

<style>
  body {
    padding-top: 30px;
    padding-bottom: 30px;
    font-family: Cantarell, sans-serif;
    line-height: inherit;
  }

  /* ======================= */

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }
</style>
