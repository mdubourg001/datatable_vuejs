
export class Model {

  constructor(mock_url) {
    this.raw_data = JSON.parse(http_get(mock_url));
    this.filtered_data = this.raw_data;
    this.columns = Object.keys(this.raw_data[0]);

    this.offset = 0;
    this.range = 10;

    this.selected_index = 0;
    this.displayed_data = this.filtered_data.slice(0, this.range);

    this.searchbar = "";
    this.ordering = this.columns[0];
    this.order(this.ordering);
  }

  next() {
    if (this.offset + this.range < this.filtered_data.length) {
      this.offset += this.range;
      this.selected_index += 1;
      this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    }
  }

  previous() {
    if (this.offset - this.range >= 0) {
      this.offset -= this.range;
      this.selected_index -= 1;
      this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
    }
  }

  goto_index(index) {
    this.offset = this.range * index;
    this.selected_index = index;
    this.displayed_data = this.filtered_data.slice(this.offset, this.offset + this.range);
  }

  update_range() {
    this.range = parseInt(this.range);
    this.offset = 0;
    this.selected_index = 0;
    this.displayed_data = this.filtered_data.slice(0, this.range);
  }


  filter() {
    this.selected_index = 0;
    this.offset = 0;

    let _this = this;
    this.filtered_data = this.raw_data.filter(row => {
      for (let key of Object.keys(row)) {
        if (String(row[key]).includes(_this.searchbar))
          return true;
      }
      return false;
    });

    this.displayed_data = this.filtered_data.slice(0, this.range);
    this.order(this.ordering);
  }

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


function http_get(url) {
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET", url, false);
  xhttp.send(null);
  return xhttp.responseText;
}
