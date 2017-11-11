$(document).ready(function(){
  var courses = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('section_id'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    // prefetch: '/courses'
    remote: {
      url: '/courses?dept=%QUERY',
      wildcard: '%QUERY'
    }
    });

  $('#bloodhound .typeahead').typeahead({
    hint: true,
    highlight: false,
    minLength: 1,
  },
  {
    name: 'states',
    source: courses,
    display: 'section_id',
    templates: {
      empty: 'No courses found.',
      suggestion: function(data) {
        var l = ''
        if(data.instructors.length != 0){ 
          var l = data.instructors.join(', ')
        }
        return '<p><i>' + data.section_id + '</i> - ' + data.course_title + '<br><small>' + l + '<br>' + data.meetings_days + '</small> <br />'+ data.demand + '</p>';
      }
    }
  });
});