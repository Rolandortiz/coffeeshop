//bootstrap validation
(function () {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()


// datepicker

 $( function() {
    $( "#datepicker" ).datepicker({
      showButtonPanel: true,
      show: "blind"
    });
  } );


// deleting the schedule

const deleteForms = document.querySelectorAll('.delete-form');
deleteForms.forEach((form) => {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
const schedId = form.getAttribute('data-schedule-id')
deleteSched(event, schedId)

  });
});



function deleteSched(event, schedId) {
  try {
    const form = event.target;
    const row = form.closest('.row');
    const deleting = document.querySelectorAll('.delete-schedule');
    if (!deleting) {
      console.error('There is nothing to delete');
      return;
    }

    row.remove();

    $.ajax({
      type: 'DELETE',
      url: `/schedule/${schedId}`,
      success: function (response) {
        console.log('Product deleted successfully');
      },
      error: function (error) {
        console.error('An error occurred during product deletion:', error);

      },
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

$(document).ready(function() {
  $('.checkbox').each(function() {
    var scheduleId = $(this).data('schedule-id');
    var checkbox = $(this);

    $.ajax({
      url: '/schedule/' + scheduleId + '/fetch',
      type: 'GET',
      success: function(response) {
        checkbox.prop('checked', response.isChecked);
      },
      error: function(error) {
        console.log('Error fetching schedule status');
      }
    });
  });

  $('.checkbox').change(function() {
    var scheduleId = $(this).data('schedule-id');
    var status = $(this).is(':checked');

    $.ajax({
      url: '/schedule/' + scheduleId + '/update',
      type: 'PUT',
      data: { isChecked: status },
      success: function(response) {
        console.log('Schedule status updated successfully');
      },
      error: function(error) {
        console.log('Error updating schedule status');
      }
    });
  });
});
