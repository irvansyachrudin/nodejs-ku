$(document).ready(function () {
    $('input.typeahead').typeahead({
        name: 'typeahead',
        remote: 'http://localhost:8000/search?key=%query',
        limit: 10
    });
});