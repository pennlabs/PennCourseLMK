function formatCourse (repo) {

  var markup = repo.section_id;

  return markup;
}

function formatCourseSelection (repo) {
  return repo.section_id;
}

$(document).ready(function () { 
  $(".courses").select2({
    ajax: {
      url: "/courses",
      dataType: 'json',
      delay: 250,
      data: function (params) {
        return {
        q: params.term, // search term
      };
    },
    processResults: function (data, params) {
      // parse the results into the format expected by Select2
      // since we are using custom formatting functions we do not need to
      // alter the remote JSON data, except to indicate that infinite
      // scrolling can be used
      return {
        results: data,
      };
    },
    cache: true
  },
  escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
  minimumInputLength: 2,
  templateResult: formatCourse, // omitted for brevity, see the source of this page
  templateSelection: formatCourseSelection // omitted for brevity, see the source of this page
});
})