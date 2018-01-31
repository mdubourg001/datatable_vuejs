<template>
  <div id="app">
    <div class="container">
      <datatable/>
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
    padding: 50px;
    font-family: Cantarell, sans-serif;
  }

  /* ======================= */

  .text-center {
    text-align: center;
  }
</style>
