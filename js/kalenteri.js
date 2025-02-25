console.log('kalenteri.js loaded')

document.addEventListener('DOMContentLoaded', async () => {
    let calendarEl = document.getElementById('kalenteriElement'); // page needs div with id kalenteriElement
    if (!calendarEl) return; // if no cant get elem then return nothing.

    console.log('element found!')

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