// TODO decide if all elements should be tabbable

var ViewModel = function() {
    var self = this;

    var cuisine_to_search_for;
    var location_to_search;
    self.do_hours_exist = false;
    self.data_from_model = ko.observableArray();
    self.data_for_hours = [];
    var search_button = document.getElementById('my-search-button');

    function getTips(place_id) {
        document.getElementById('subresult-img').innerHTML = '';
        var user_first_name = '';
        var user_last_name = '';
        var review_text = '';
        var entire_tip_section = '';

        $.ajax({
    		url: 'https://api.foursquare.com/v2/venues/' + place_id + '/tips?client_id=IY4MOF0VN0HHCOSRH121TJYN1P3FTVZRNCX2RU1YNF23GRBH&client_secret=O0GFJPKBRBDYSO4M52SRJBINZLFWVF4DLPNYZ3WH5NOIYVKW&v=20130815',
    		dataType: 'json',
    		success: function(response) {
                if (response.response.tips.count > 0) {
                    /* loop through each tip */
                    for (var i=0; i< response.response.tips.count; i++) {
                        user_first_name = response.response.tips.items[i].user.firstName;
                        /* check is last name exists */
                        if (response.response.tips.items[i].user.lastName !== undefined) {
                            user_last_name = response.response.tips.items[i].user.lastName;
                        }

                        review_text = response.response.tips.items[i].text;
                        entire_tip_section = entire_tip_section + '<p><strong>'+ user_first_name + ' ' + user_last_name + ':</strong></p>' + '<p>' + review_text + '</p>';


                        user_first_name = '';
                        user_last_name = '';
                        review_text = '';
                        /* only want 3 tips max */
                        if (i === 3) {
                            break;
                        }
                        /* output to page */
                        document.getElementById('subresult-tips').innerHTML = '<p tabindex="0"><strong>Tips</strong></p>' + entire_tip_section;
                    }

                }
                /* No tips found */
                else {
                    document.getElementById('subresult-img').innerHTML = '<p tabindex="0"><strong>Tips: </strong></p>' + '<p>No user tips found.</p>';
                }
    		},
            error: function(err) {
                console.log(err);
                document.getElementById('subresult-img').innerHTML = '<p><strong>Tips: </strong></p>' + '<p><strong>Error loading tips from the Foursquare API.<br>Please try again later.</strong></p>';
            }
    	});
    }

    function getImage(place_id, place_name) {
        document.getElementById('subresult-img').innerHTML = '';
        var image_location = '';
        var image_alt = '';
        $.ajax({
    		url: 'https://api.foursquare.com/v2/venues/' + place_id + '/photos?client_id=IY4MOF0VN0HHCOSRH121TJYN1P3FTVZRNCX2RU1YNF23GRBH&client_secret=O0GFJPKBRBDYSO4M52SRJBINZLFWVF4DLPNYZ3WH5NOIYVKW&v=20130815',
    		dataType: 'json',
    		success: function(response) {
                if (response.response.photos.items.length > 0) {
                    image_location = response.response.photos.items[0].prefix + response.response.photos.items[0].height + 'x' + response.response.photos.items[0].width + response.response.photos.items[0].suffix;

                    document.getElementById('subresult-img').innerHTML = '<img class="img-thumbnail"' + 'src="' + image_location + '"' + 'alt="' + place_name + ' picture from Foursquare API">';

                } else {
                    document.getElementById('subresult-img').innerHTML = '<img class="img-responsive" ' + 'src="#" ' + 'alt="No image found in Foursquare API"' + '>';
                }

    		}
    	});
    }

    function getHours(place_id) {

        /* ajax call for hours*/
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
                    document.getElementById('subresult-hours').innerHTML = '<p tabindex="0"><strong>Hours</strong></p>';
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
    		},
            error: function(err) {
                console.log(err);
            }
    	});
    }

    function getSubResults(index) {
        var place_name = self.data_from_model()[index].name;
        var place_id = self.data_from_model()[index].id;
        var cuisine_type;

        if (self.data_from_model()[index].categories.length === 0) {
            cuisine_type = 'Cuisine type unavailable';
        } else {
            cuisine_type = self.data_from_model()[index].categories[0].name;
        }

        var place_location_array = self.data_from_model()[index].location.formattedAddress;
        var place_formatted_location = '';

        for (var k = 0; k < place_location_array.length; k++) {
            if (k != place_location_array.length - 1) {
                place_formatted_location = place_formatted_location + place_location_array[k] + ', ';
            } else {
                place_formatted_location = place_formatted_location + place_location_array[k];
            }
        }

        getImage(place_id, place_name);
        getHours(place_id);
        getTips(place_id);

        document.getElementById('subresult-name').innerHTML = '<p tabindex="0">' + place_name + '</p>';
        document.getElementById('subresult-address').innerHTML = place_formatted_location;
        document.getElementById('subresult-cuisine-type').innerHTML = cuisine_type;

        document.getElementById('subresult').style.display = 'block';
    }

    search_button.addEventListener('click', function() {
        cuisine_to_search_for = document.getElementById('my-search-input-query').value;

        location_to_search = document.getElementById('my-search-input-location').value;

        document.getElementById('subresult').style.display = 'none';
        /* initial ajax call to get results */
        $.ajax({
    		url: 'https://api.foursquare.com/v2/venues/search?client_id=IY4MOF0VN0HHCOSRH121TJYN1P3FTVZRNCX2RU1YNF23GRBH&client_secret=O0GFJPKBRBDYSO4M52SRJBINZLFWVF4DLPNYZ3WH5NOIYVKW&v=20130815&near=' + location_to_search + '&query=' + cuisine_to_search_for,
    		dataType: 'json',
    		success: function(response) {
                self.data_from_model.removeAll();

                if (response.response.venues.length < 1 ) {
                    self.data_from_model.push({name: 'No results found', index: 0});

                    document.getElementById('subresult-name').innerHTML = '';
                    document.getElementById('subresult-address').innerHTML = '';
                    document.getElementById('subresult-cuisine-type').innerHTML = '';
                    document.getElementById('subresult-img').innerHTML = '';
                    document.getElementById('subresult-hours').innerHTML = '';
                }
                else {
                    for (var i = 0; i < response.response.venues.length; i++) {
                        response.response.venues[i].index = 'results-list-item' + i;
                        response.response.venues[i].visibility = ko.observable(true);
                        self.data_from_model.push(response.response.venues[i]);
                        /* limit results to 15 restaurants*/
                        if (i == 14) {
                            break;
                        }
                    }
                    for (var j=0; j < self.data_from_model().length; j++) {

                        function theCloser(current_index) {
                            document.getElementById('results-list-item' + current_index).addEventListener('click', function() {
                                getSubResults(current_index);
                            });

                            /* code from http://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box */
                            document.getElementById('results-list-item' + current_index)
                            .addEventListener("keyup", function(event) {
                                event.preventDefault();
                                if (event.keyCode == 13) {
                                    document.getElementById('results-list-item' + current_index).click();
                                }
                            });
                        }
                        theCloser(j);
                    }
                }
                var event = new Event('change');

                document.getElementById('checkbox-is-chain').dispatchEvent(event);

                document.getElementById('checkbox-users-there').dispatchEvent(event);
    		},
            error: function(err) {
                console.log(err);
                self.data_from_model.removeAll();
                document.getElementById('subresult-name').innerHTML = 'Bad request, please try something else.';
                document.getElementById('subresult-address').innerHTML = '';
                document.getElementById('subresult-cuisine-type').innerHTML = '';
                document.getElementById('subresult-img').innerHTML = '';
                document.getElementById('subresult-hours').innerHTML = '';
            }
    	});
    });

    document.getElementById('checkbox-is-chain').addEventListener('change', function() {
        /* clear subresult */
        document.getElementById('subresult').style.display = 'none';

        document.getElementById('subresult-name').innerHTML = '';
        document.getElementById('subresult-address').innerHTML = '';
        document.getElementById('subresult-cuisine-type').innerHTML = '';
        document.getElementById('subresult-img').innerHTML = '';
        document.getElementById('subresult-hours').innerHTML = '';
        document.getElementById('subresult-tips').innerHTML = '';

        /* handle both being checked */
        if ($('#checkbox-is-chain').is(':checked') && $('#checkbox-users-there').is(':checked')) {
            for (var joint_index in self.data_from_model()) {
                /* check if both required attributes are what we want */
                if (self.data_from_model()[joint_index].venueChains.length > 0 && self.data_from_model()[joint_index].hereNow.count > 0) {
                    makeVisible(joint_index);
                }
                /* both required attributes aren't what we want, so hide item*/
                else {
                    makeInvisible(joint_index);
                }
            }
        }
        /* handle just chain checkbox being changed */
        else {
            /* handle chain checkbox being checked */
            if ($('#checkbox-is-chain').is(':checked')) {
                for (var chain_index in self.data_from_model()) {
                    if (self.data_from_model()[chain_index].venueChains.length > 0) {
                        makeVisible(chain_index);
                    } else {
                        makeInvisible(chain_index);
                    }
                }
            }
            /* handle chain checkbox being unchecked */
            else {
                /* when other checkbox is still checked */
                if ($('#checkbox-users-there').is(':checked')) {
                    for (var index in self.data_from_model()) {
                        makeVisible(index);
                        if (self.data_from_model()[index].hereNow.count === 0) {
                            makeInvisible(index);
                        }
                    }
                }
                /* when other checkbox is not checked */
                else {
                    for (var this_index in self.data_from_model()) {
                        makeVisible(this_index);
                    }
                }
            }
        }
    });

    document.getElementById('checkbox-users-there').addEventListener('change', function() {
        /* clear subresult */
        document.getElementById('subresult').style.display = 'none';

        document.getElementById('subresult-name').innerHTML = '';
        document.getElementById('subresult-address').innerHTML = '';
        document.getElementById('subresult-cuisine-type').innerHTML = '';
        document.getElementById('subresult-img').innerHTML = '';
        document.getElementById('subresult-hours').innerHTML = '';
        document.getElementById('subresult-tips').innerHTML = '';

        /* handle both being checked */
        if ($('#checkbox-is-chain').is(':checked') && $('#checkbox-users-there').is(':checked')) {
            for (var joint_index in self.data_from_model()) {
                /* check if both required attributes are what we want */
                if (self.data_from_model()[joint_index].venueChains.length > 0 && self.data_from_model()[joint_index].hereNow.count > 0) {
                    makeVisible(joint_index);
                }
                /* both required attributes aren't what we want, so hide item*/
                else {
                    makeInvisible(joint_index);
                }
            }
        }
        /* handle just users checkbox being changed */
        else {
            /* handle user checkbox being checked */
            if ($('#checkbox-users-there').is(':checked')) {
                for (var chain_index in self.data_from_model()) {
                    if (self.data_from_model()[chain_index].hereNow.count > 0) {
                        makeVisible(chain_index);
                    } else {
                        makeInvisible(chain_index);
                    }
                }
            }
            /* handle user checkbox being unchecked*/
            else {
                /* when other checkbox is still checked */
                if ($('#checkbox-is-chain').is(':checked')) {
                    for (var index in self.data_from_model()) {
                        makeVisible(index);
                        if (self.data_from_model()[index].venueChains.length < 1) {
                            makeInvisible(index);
                        }
                    }
                }
                /* when other checkbox isn't checked */
                else {
                    for (var this_index in self.data_from_model()) {
                        makeVisible(this_index);
                    }
                }
            }
        }
    });

    function makeVisible(index) {
        self.data_from_model()[index].visibility(true);
    }

    function makeInvisible(index) {
        self.data_from_model()[index].visibility(false);
    }
};

ko.applyBindings(new ViewModel());
