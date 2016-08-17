var ViewModel = function() {
    var self = this;

    var cuisine_to_search_for;
    var location_to_search;
    self.do_hours_exist = false;
    self.data_from_model = ko.observableArray();
    self.data_for_hours = [];
    var search_button = document.getElementById('my-search-button');

    function getHours(place_id) {
        /* next ajax call four hours*/

        $.ajax({
    		url: 'https://api.foursquare.com/v2/venues/' + place_id + '/hours?client_id=IY4MOF0VN0HHCOSRH121TJYN1P3FTVZRNCX2RU1YNF23GRBH&client_secret=O0GFJPKBRBDYSO4M52SRJBINZLFWVF4DLPNYZ3WH5NOIYVKW&v=20130815',
    		dataType: 'json',
    		success: function(response) {
                Promise.resolve(response).then(function(the_response)
                {
                    self.data_for_hours.length = 0;
                    for (var object_index in the_response.response.hours.timeframes) {
                        var thing_to_search_in = the_response.response.hours.timeframes;

                        /* convert numerical days to english */
                        for (var day in thing_to_search_in[object_index].days) {
                            if (thing_to_search_in[object_index].days[day] === 1) {
                                thing_to_search_in[object_index].days[day] = 'Monday';
                            }
                            if (thing_to_search_in[object_index].days[day] === 2) {
                                thing_to_search_in[object_index].days[day] = 'Tuesday';
                            }
                            if (thing_to_search_in[object_index].days[day] === 3) {
                                thing_to_search_in[object_index].days[day] = 'Wednesday';
                            }
                            if (thing_to_search_in[object_index].days[day] === 4) {
                                thing_to_search_in[object_index].days[day] = 'Thursday';
                            }
                            if (thing_to_search_in[object_index].days[day] === 5) {
                                thing_to_search_in[object_index].days[day] = 'Friday';
                            }
                            if (thing_to_search_in[object_index].days[day] === 6) {
                                thing_to_search_in[object_index].days[day] = 'Saturday';
                            }
                            if (thing_to_search_in[object_index].days[day] === 7) {
                                thing_to_search_in[object_index].days[day] = 'Sunday';
                            }
                        }
                        self.data_for_hours.push({days: thing_to_search_in[object_index].days, hours: thing_to_search_in[object_index].open});
                    }

                }).then(function() {
                    document.getElementById('subresult-hours').innerHTML = '<strong>Hours</strong><br><br>';
                    var formatted_days;
                    var formatted_hours;

                    if (self.data_for_hours.length === 0) {
                        self.data_for_hours.push({days: ['No  operating hours found'], hours: [{start: 'No opening time found', end: 'No closing time found'}]});
                    }
                    for (var item in self.data_for_hours) {
                        var current_item = self.data_for_hours[item];
                        var hours_array = current_item.hours;
                        formatted_days = '';
                        /* this formats the days for dom display */
                        for (var day = 0; day < current_item.days.length; day++) {


                            if (day != current_item.days.length - 1) {
                                formatted_days = formatted_days + current_item.days[day] + ', ';
                            } else {
                                formatted_days = formatted_days + current_item.days[day] + ':<br><br>';
                            }
                        }

                        document.getElementById('subresult-hours').innerHTML = document.getElementById('subresult-hours').innerHTML + formatted_days;


                        for (var hours_object_index = 0; hours_object_index < hours_array.length; hours_object_index++) {
                            formatted_hours = '';
                            formatted_hours = formatted_hours + 'Open: ' + hours_array[hours_object_index].start + '<br>' + 'Close: ' + hours_array[hours_object_index].end+ '<br><br>';

                            document.getElementById('subresult-hours').innerHTML = document.getElementById('subresult-hours').innerHTML + formatted_hours;
                        }
                    }
                });
    		}
    	});
    }

    function getSubResults(index) {
        var place_name = self.data_from_model()[index].name;
        var place_id = self.data_from_model()[index].id;
        var place_location_array = self.data_from_model()[index].location.formattedAddress;
        var place_formatted_location = '';

        for (var k = 0; k < place_location_array.length; k++) {
            if (k != place_location_array.length - 1) {
                place_formatted_location = place_formatted_location + place_location_array[k] + ', ';
            } else {
                place_formatted_location = place_formatted_location + place_location_array[k];
            }
        }
        getHours(place_id);

        document.getElementById('subresult-name').innerHTML = place_name;
        document.getElementById('subresult-address').innerHTML = place_formatted_location;
    }

    search_button.addEventListener('click', function() {
        cuisine_to_search_for = document.getElementById('my-search-input-query').value;

        location_to_search = document.getElementById('my-search-input-location').value;

        document.getElementById('subresult-name').innerHTML = '';
        document.getElementById('subresult-address').innerHTML = '';

        /* initial ajax call to get results */
        $.ajax({
    		url: 'https://api.foursquare.com/v2/venues/search?client_id=IY4MOF0VN0HHCOSRH121TJYN1P3FTVZRNCX2RU1YNF23GRBH&client_secret=O0GFJPKBRBDYSO4M52SRJBINZLFWVF4DLPNYZ3WH5NOIYVKW&v=20130815&near=' + location_to_search + '&query=' + cuisine_to_search_for,
    		dataType: 'json',
    		success: function(response) {
    			/**/
                if (response.response.venues.length < 1 ) {
                    self.data_from_model({name: 'No results found', index: 0});
                }
                else {
                    self.data_from_model.removeAll();
                    for (var i = 0; i < 10; i++) {
                        response.response.venues[i].index = 'results-list-item' + i;
                        response.response.venues[i].visibility = true;
                        self.data_from_model.push(response.response.venues[i]);
                    }

                    console.log(self.data_from_model());

                    for (var j=0; j < self.data_from_model().length; j++) {

                        function theCloser(current_index) {
                            document.getElementById('results-list-item' + current_index).addEventListener('click', function() {
                                getSubResults(current_index);
                            });
                        }
                        theCloser(j);
                    }
                }
    		}
    	});
    });

};

ko.applyBindings(new ViewModel());
