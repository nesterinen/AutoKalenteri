console.log('kalenteri.js loaded')

document.addEventListener('DOMContentLoaded', async () => {
    let calendarEl = document.getElementById('kalenteriElement'); // page needs div with id kalenteriElement
    if (!calendarEl) return; // if no cant get elem then return nothing.

    console.log('element found!')

    await jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: my_ajax_object.ajax_url,
        data: { action:'get_all' },
        success: function(response){
            console.log(response)
        },
        error: function(jqXHR, error, errorThrown){
          if(jqXHR.status&&jqXHR.status==200){
            console.log('err', jqXHR);
          } else {
            console.log(jqXHR.responseText)
          }
        }
    });  

    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        }
      });
      calendar.render();
})