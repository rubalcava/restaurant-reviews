

var model;

var ViewModel = function() {
    var stuff_to_search_for;
    var submit_button = document.getElementById('my-search-button');

    submit_button.addEventListener('click', function() {
        stuff_to_search_for = document.getElementById('my-search-input').value;

        /* now make ajax call */
        $.ajax({
    		url: 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + stuff_to_search_for + '&key=AIzaSyAekM9XVEMmw0oWbPws8F5T-4WsCNB9Tw0&callback=?',
    		dataType: 'json',
    		success: function(response) {
    			/**/
                console.log('https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + stuff_to_search_for + '&key=AIzaSyAekM9XVEMmw0oWbPws8F5T-4WsCNB9Tw0&callback=?');
    		}
    	});
    });
};

ko.applyBindings(new ViewModel());
