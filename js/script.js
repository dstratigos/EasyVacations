$(document).ready(function () {
  // fetching data from JSON file
  fetch("./assets/data.json")
    .then((res) => res.json())
    .then((data) => {
      // storing data to variables for convenience
      const roomTypes = data[0].roomtypes;
      const hotels = data[1].entries;
      let filteredList = [];

      // function to create html elements to serve the hotel list
      // takes a list of hotels as parameter
      function showList(hotels) {
        hotels.map(function (hotel) {
          $("<div/>", {
            class: "newEntry",
            html: getHtml(hotel),
          }).appendTo("#hotel-list");
        });

        $("#hotel-list").hide().slideDown("slow");
      }

      // function to fill the html elements with parameters from
      // hotel object. Object is inserted as a parameter of the function
      function getHtml(hotel) {
        let $html = $(".entry-template").clone();
        $html.find("#image")[0].src = hotel.thumbnail;
        $html.find("#entry-name")[0].innerText = hotel.hotelName;
        for (let o = 0; o < hotel.rating; o++) {
          $('<i class="fas fa-star text-warning"></i>').appendTo($html.find("#entry-stars")[0]);
        }
        $html.find("#entry-city")[0].innerText = hotel.city;
        $html.find("#entry-rating-no")[0].innerText = hotel.ratings.no.toFixed(1);
        $html.find("#entry-rating-text")[0].innerText = hotel.ratings.text;
        $html.find("#entry-reviews")[0].innerText = ` (${Math.floor(Math.random() * 1000) + 100} reviews)`;
        $html.find("#price-per-night")[0].innerText = hotel.price;
        hotel.filters.map(function (filter) {
          $(`<li>${filter.name}</li>`).appendTo($html.find(".amenities")[0]);
        });
        $(".map").on("click", function () {
          console.log($(".map").parent("div").eq(2));
          $(".modal-body").html(
            `<iframe src=${hotel.mapurl} width="100%" height="400" frameborder="0" style="border:0"></iframe>`
          );
        });

        return $html.html();
      }

      // viewing all hotels in the JSON
      showList(hotels);

      // creating an empty array and filling it with all the hotels' cities
      const cities = [];
      hotels.map((hotel) => cities.push(hotel.city));

      // creating a new array with only the unique values of the cities array
      // to be feeded to the AutoComplete plugin
      const uniqueCities = Array.from(new Set(cities));

      // activating AutoComplete plugin on search input text-box
      // params: minimum characters required, search query: uniqueCities
      $(".basicAutoComplete").autoComplete({
        minLength: 2,
        events: {
          search: function (qry, callback) {
            qry = uniqueCities;
            callback(qry);
          },
        },
      });

      // assigning the value of AutoComplete selection to search input text-box
      // if nothing is selected the value remains remains as typed
      $(".basicAutoComplete").on("autocomplete.select", function (evt, item) {
        $("#searchInput").val = item;
      });

      function filterBySearch() {
        const searchTerm = $("#searchInput").val();

        $("#hotel-list").empty();
        filteredList.length = 0;

        filteredList = hotels.filter((hotel) => hotel.city === searchTerm);
      }

      // search button actions
      $("#searchBtn").on("click", function () {
        filterBySearch();
        filteredList.length > 0 ? showList(filteredList) : showList(hotels);
      });

      // price range actions
      const valueElement = $("#price-range");
      const valueSpanElement = $(".valueSpan");
      let currentRange = [];

      // function to update the slider range min & max values
      function priceRangeUpdate() {
        currentRange =
          filteredList.length > 0 ? filteredList.map((hotel) => hotel.price) : hotels.map((hotel) => hotel.price);
        const $max = Math.max.apply(this, currentRange);
        const $min = Math.min.apply(this, currentRange);

        if (currentRange.length === 1) {
          valueElement.attr({ max: $max, min: $max });
        } else {
          valueElement.attr({ max: $max, min: $min });
        }

        valueElement.attr("value", $max);
        //valueSpanElement.html(valueElement.attr("value"));
      }

      // function to view hotels filtered by price
      function filterByPrice() {
        $("#hotel-list").empty();

        filteredList.length > 0
          ? (tempList = filteredList.filter((hotel) => hotel.price <= valueElement.val()))
          : (tempList = hotels.filter((hotel) => hotel.price <= valueElement.val()));

        showList(tempList);
      }

      // actions to take when slider is moving
      valueElement.on("input", () => {
        priceRangeUpdate();
        valueSpanElement.show();
        valueSpanElement.html(valueElement.val());
      });

      // actions to take when slider has a value set
      valueElement.on("change", () => {
        filterByPrice();
      });

      // function to view hotels filtered by property type
      $("#property-types").on("change", function () {
        $("#hotel-list").empty();
        let starValue = $(this).val();
        let starlist = [];

        if (starValue === "0") {
          filteredList.length > 0 ? (starlist = filteredList) : (starlist = hotels);
        } else {
          filteredList.length > 0
            ? (starlist = filteredList.filter((hotel) => hotel.rating == starValue))
            : (starlist = hotels.filter((hotel) => hotel.rating == starValue));
        }

        showList(starlist);
      });

      // function to view hotels filtered by guest ratings
      $("#guest-ratings").on("change", function () {
        $("#hotel-list").empty();
        let guestValue = $(this).val();
        let guestList = [];

        if (guestValue === "0") {
          filteredList.length > 0 ? (guestList = filteredList) : (guestList = hotels);
        } else {
          filteredList.length > 0
            ? (guestList = filteredList.filter(
                (hotel) => hotel.guestrating > guestValue - 1 && hotel.guestrating <= guestValue
              ))
            : (guestList = hotels.filter(
                (hotel) => hotel.guestrating > guestValue - 1 && hotel.guestrating <= guestValue
              ));
        }
        showList(guestList);
      });

      // function to view hotels filtered by location
      $("#location-selector").on("change", function (input) {
        $("#hotel-list").empty();
        filteredList.length = 0;
        let location = $(this).val();

        if (location != "0") {
          filteredList = hotels.filter((hotel) => hotel.city === location);
          showList(filteredList);
        } else showList(hotels);
      });

      // function to view hotels filtered by more filters
      $("#more-filters").on("change", function (input) {
        $("#hotel-list").empty();
        let filtersVal = $(this).val();
        let moreFiltered = [];

        if (filtersVal == "0") {
          filteredList.length > 0 ? (moreFiltered = filteredList) : (moreFiltered = hotels);
        } else {
          filteredList.length > 0
            ? (moreFiltered = filteredList.filter((hotel) =>
                hotel.filters.some((filter) => filter.name === filtersVal)
              ))
            : (moreFiltered = hotels.filter((hotel) => hotel.filters.some((filter) => filter.name === filtersVal)));
        }

        showList(moreFiltered);
      });

      // initializing check-in date picker
      $(".check-in").datepicker({
        clearBtn: true,
        format: "DD, dd/mm/yyyy",
        autoclose: true,
        todayHighlight: true,
        startDate: moment().format("DD/MM/YYYY"),
      });

      // initializing check-out date picker
      $(".check-out").datepicker({
        clearBtn: true,
        format: "DD, dd/mm/yyyy",
        autoclose: true,
        todayHighlight: true,
      });

      // setting the check-in event listener
      $("#check-in-date").on("change", function (input) {
        setTotalPrice();

        let checkOutStart = moment(input.target.value, "DD/MM/YYYY").add(1, "days").format("DD/MM/YYYY");
        console.log(checkOutStart);
        $(".check-out").datepicker("setStartDate", checkOutStart);
      });

      // setting the check-out event listener
      $("#check-out-date").on("change", function () {
        setTotalPrice();
      });

      // calculating the total reservation billable days
      function reservationDays() {
        let checkIn = moment($("#check-in-date").val(), "DD/MM/YYYY");
        let checkOut = moment($("#check-out-date").val(), "DD/MM/YYYY");

        return checkOut > checkIn ? checkOut.diff(checkIn, "days") : 0;
      }

      //setting the values for total nights and price elements
      function setTotalPrice() {
        let billable = reservationDays();
        let nights = $(".nights");
        let total = $(".total-price");
        let list = [];

        filteredList.length > 0 ? (list = filteredList) : (list = hotels);

        for (let i = 1; i < total.length; i++) {
          nights[i].innerText = billable;
          total[i].innerText = list[i - 1].price * billable;
        }
      }

      // filling the location selector
      uniqueCities.map(function (city, index) {
        $("#location-selector").append(`<option value="${city}">${city}</option>`);
      });

      // filling the more filters selector
      const filters = [];
      hotels.map(function (hotel) {
        hotel.filters.map(function (filter) {
          filters.push(filter.name);
        });
      });

      const uniqueFilters = Array.from(new Set(filters));
      uniqueFilters.map(function (filter) {
        $("#more-filters").append(`<option value="${filter}">${filter}</option>`);
      });

      // filling the room type selector
      roomTypes.map(function (type, index) {
        $("#room-types").append(`<option value="${index}">${type.name}</option>`);
      });
    }); // Fetch end
});
