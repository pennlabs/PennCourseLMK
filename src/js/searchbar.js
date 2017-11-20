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
      empty: '<div class="lmk-rec-element list-group-item">No matching courses found.</div>',
      suggestion: function(data) {
        var instructors = ''
        if(data.instructors.length != 0){ 
          var instructors = data.instructors.join(', ')
        }
        return '<div class="lmk-rec-element list-group-item">' +
          // '<p>' + data.section_id + '</p>' +
          data.section_id + '<br />' +
          '<small>' + data.course_title + '</small>' +
          // '<br><small>' + instructors + '<br />' + data.meetings_days + '</small> <br />'+
          // data.demand +
          '</div>';
      }
    }
  });
});