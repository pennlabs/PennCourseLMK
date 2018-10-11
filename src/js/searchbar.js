function getDemandIcon(demand) {
  switch(demand) {
    case 0:
    case 1:
    case 2:
    case 3:
      return '<i style="color: #31CF65" data-toggle="tooltip" data-placement="right" title="This course is in low demand" class="fa fa-thermometer-empty" aria-hidden="true"></i>'
    case 4:
    case 5:
    case 6:
    case 7:
      return '<i style="color: orange" data-toggle="tooltip" data-placement="right" title="This course is in medium demand" class="fa fa-thermometer-half" aria-hidden="true"></i>'
    case 8:
    case 9:
    case 10:
      return '<i style="color: #FC3C63" data-toggle="tooltip" data-placement="right" title="This course is in high demand" class="fa fa-thermometer-full" aria-hidden="true"></i>'
  }
}

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

  $('#bloodhound #courseTypeahead').typeahead({
    hint: true,
    highlight: false,
    minLength: 1,
  },
  {
    name: 'states',
    source: courses,
    display: 'section_id',
    templates: {
      empty: '<div class="lmk-rec-element card"><div class="card-content">No matching courses found.</div></div>',
      suggestion: function(data) {
        var instructors = ''
        if(data.instructors.length != 0){
          var instructors = data.instructors.join(', ')
        }
        return '<div class="lmk-rec-element card">' +
          // '<p>' + data.section_id + '</p>' +
          '<div class="card-content">' +
          data.section_id + '<br />' +
          '<small>' + data.course_title + '</small>' +
          '<span class="lmk-command-icon">'+getDemandIcon(data.demand)+'</span>' +
          '</div></div>';
      }
    }
  });
});