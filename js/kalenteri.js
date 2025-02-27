console.log('kalenteri.js loaded')

document.addEventListener('DOMContentLoaded', async () => {
    let calendarEl = document.getElementById(my_ajax_object.element_name); // page needs div with id kalenteriElement
    if (!calendarEl) return; // if no cant get elem then return nothing.
    calendarEl.setAttribute('name', 'kalenteri_name_css')

    let carReservationsJSON;

    function colorCase(title) {
        switch (title) {
          case "Henkilöauto":
            return '#648FFF'
          case "Pakettiauto":
            return '#785EF0'
          case "Pikkubussi":
            return '#FE6100'
          default:
            return '#FFB000'
        }
    }

    async function Popup() {
        return new Promise((resolve) => {
          const myDialog = document.createElement("dialog")
          myDialog.setAttribute('id', 'varausPopup')
          document.body.appendChild(myDialog)
        
          const header = document.createElement('h2')
          var text = document.createTextNode("Auton varaus")
          header.appendChild(text)
        
          var closeButton = document.createElement('button')
          closeButton.textContent = 'peruuta'
          closeButton.setAttribute('id', 'closeButton')
          closeButton.addEventListener('click', () => dialogClose())
    
          var addButton = document.createElement('button')
          addButton.textContent = 'varaa'
          addButton.setAttribute('id', 'addButton')
          addButton.addEventListener('click', () => dialogAdd())
        
          var select = document.createElement('select')
          var auto1 = document.createElement('option')
          auto1.appendChild(document.createTextNode('Henkilöauto'))
          var auto2 = document.createElement('option')
          auto2.appendChild(document.createTextNode('Pakettiauto'))
          var auto3 = document.createElement('option')
          auto3.appendChild(document.createTextNode('Pikkubussi'))
          var auto4 = document.createElement('option')
          auto4.appendChild(document.createTextNode('muu'))
          select.appendChild(auto1)
          select.appendChild(auto2)
          select.appendChild(auto3)
          select.appendChild(auto4)

          const varaajaText = document.createElement('p')
          var text2 = document.createTextNode("Varaaja")
          varaajaText.appendChild(text2)
          varaajaInput = document.createElement('input')
        
          function dialogClose() {
            addButton.removeEventListener('click', () => dialogAdd())
            closeButton.removeEventListener('click', () => dialogClose())
            myDialog.close()
            resolve(undefined)
          }
        
          function dialogAdd() {
            addButton.removeEventListener('click', () => dialogAdd())
            closeButton.removeEventListener('click', () => dialogClose())
            myDialog.close()
            resolve({value: select.value, input: varaajaInput.value})
          }
          
          myDialog.appendChild(header)
          myDialog.appendChild(select)
          myDialog.appendChild(varaajaText)
          myDialog.appendChild(varaajaInput)
          myDialog.appendChild(addButton)
          myDialog.appendChild(closeButton)
          myDialog.showModal()
        })
    }

    function dateNoTimezone(date) {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    }

    await jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: my_ajax_object.ajax_url,
        data: { action:'get_all' },
        success: function(response){
            carReservationsJSON = response.data.map(obj => {
                return {...obj, color: colorCase(obj.title), extendedProps: {ID: obj.id, varaaja:obj.varaaja}}
            })
            console.log(carReservationsJSON)
        },
        error: function(jqXHR, error, errorThrown){
          if(jqXHR.status&&jqXHR.status==200){
            console.log('err', jqXHR);
          } else {
            console.log(jqXHR.responseText)
          }
        }
    });  

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },

        buttonText: {
            today: 'Tänään',
            month: 'Kuukausi',
            week: 'Viikko',
            day: 'Päivä'
        },

        //initialDate: '2023-01-12',
        navLinks: true, // can click day/week names to navigate views
        selectable: true,
        selectMirror: true,
        locale: 'fi-fi',
        allDaySlot: false,
        unselectAuto: false, // if true(default) event gets unselected during popup()

        slotMinTime: "07:00",
        slotMaxTime: "19:00",
        
        select: async function(arg) {
            //var title = prompt('Event Title:');
            var popUpResult = await Popup()

            if (popUpResult) {
            var title = popUpResult.value
            var varaaja = popUpResult.input

            jQuery.ajax({
                type: "POST",
                dataType: "json",
                url: my_ajax_object.ajax_url,
                data: {
                    action:'post_db',
                    title: title,
                    start: dateNoTimezone(arg.start),
                    end: dateNoTimezone(arg.end),
                    varaaja: varaaja
                },
                success: function(response){
                    calendar.addEvent({
                    ID: response.data.id,
                    publicId: response.data.id,
                    title: title,
                    start: arg.start,
                    end: arg.end,
                    color: colorCase(title),
                    varaaja: varaaja
                    })
                    console.log('added, id:', response.data.id)
                },
                error: function(error){
                    console.log('add error:', error)
                }
            });  
            }
            calendar.unselect()
        },

        eventClick: function(arg) {
            if (confirm('Haluatko varmasti poistaa tämän varauksen?')) {
            jQuery.ajax({
                type: "post",
                dataType: "json",
                url: my_ajax_object.ajax_url,
                data: {
                    action:'delete_db',
                    id: arg.event._def.extendedProps.ID,
                },
                success: function(){ 
                    arg.event.remove()
                    console.log('deleted, id:', arg.event._def.extendedProps.ID); 
                },
                error: function(error){
                    console.log('deleted with error, id:', arg.event._def.extendedProps.ID);
                    console.log('delete error:', error)
                }
            });
            }
        },

        eventDrop: function (arg) {
            if(confirm('Haluatko siirtää ajan?')) {
            jQuery.ajax({
                type: "post",
                dataType: "json",
                url: my_ajax_object.ajax_url,
                data: {
                    action:'update_db',
                    id: arg.event._def.extendedProps.ID,
                    start: dateNoTimezone(arg.event.start),
                    end: dateNoTimezone(arg.event.end)
                },
                success: function(){
                    console.log('moved, id:', arg.event._def.extendedProps.ID); 
                    },
                error: function(error){
                    console.log('moved with error, id:', arg.event._def.extendedProps.ID)
                    console.log('move error:', error)
                }
            });
            } else {
            arg.revert();
            }
        },

        eventResize: function (arg) {
            if(confirm('Haluatko muuttaa ajan?')) {
            jQuery.ajax({
                type: "post",
                dataType: "json",
                url: my_ajax_object.ajax_url,
                data: {
                    action:'update_db',
                    id: arg.event._def.extendedProps.ID,
                    start: dateNoTimezone(arg.event.start),
                    end: dateNoTimezone(arg.event.end)
                },
                success: function(){ 
                    console.log('updated, id:', arg.event._def.extendedProps.ID); 
                },
                error: function(error){
                    console.log('updated with error, id:', arg.event._def.extendedProps.ID)
                    console.log('update error:', error)
                }
            });
            } else {
            arg.revert();
            }
        },

        eventDidMount : function (event) {
            const varaaja = event.event._def.extendedProps.varaaja
            if (varaaja) {
                let elements = event.el.getElementsByClassName('fc-event-title fc-sticky')

                if (elements.length == 0) return;

                varaajaTextElemt = document.createElement('p')
                varaajaTextElemt.setAttribute('id', 'eventparagraph')
                const text = document.createTextNode(varaaja)
                varaajaTextElemt.appendChild(text)

                elements[0].appendChild(varaajaTextElemt)    
            }
        },
        editable: true,
        dayMaxEvents: true,

        events: carReservationsJSON
    });

    calendar.render();
})