// $(document).ready(function(){
//   var courses = new Bloodhound({
//     datumTokenizer: Bloodhound.tokenizers.obj.whitespace('section_id'),
//     queryTokenizer: Bloodhound.tokenizers.whitespace,
//     prefetch: '/courses'
//     });

//   $('#bloodhound .typeahead').typeahead({
//     hint: true,
//     highlight: false,
//     minLength: 1,
//   },
//   {
//     name: 'states',
//     source: courses,
//     display: 'section_id',
//     templates: {
//       empty: 'No courses found.',
//       suggestion: function(data) {
//         var l = ''
//         if(data.instructors.length != 0){ 
//           var l = data.instructors.join(', ')
//         }
//         return '<p><i>' + data.section_id + '</i> - ' + data.course_title + '<br><small>' + l + '<br>' + data.meeting_days + '</small></p>';
//       }
//     }
//   });
// });

$(document).ready(function() {
  $(".courses").select2({
    ajax: {
      url: "/courses",
      dataType: 'json',
      delay: 250,
      data: function (params) {
        return {
          q: params.term
        };
      },
      processResults: function (data, params) {
        // parse the results into the format expected by Select2
        // since we are using custom formatting functions we do not need to
        // alter the remote JSON data, except to indicate that infinite
        // scrolling can be used
        console.log(data);
        return {
          results: data,
        };
      },
      cache: true,
      escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
      minimumInputLength: 1,
      templateResult: function (b) {return b;}, // omitted for brevity, see the source of this page
      templateSelection: function (b) { return b; } // omitted for brevity, see the source of this page
    }
  });
})