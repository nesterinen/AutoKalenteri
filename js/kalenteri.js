
console.log('kalenteri.js loaded')

document.addEventListener('DOMContentLoaded', async () => {
    let calendarEl = document.getElementById(my_ajax_object.element_name); // page needs div with id kalenteriElement
    if (!calendarEl) return; // if cant get elem then its useless to do the rest.
    calendarEl.setAttribute('name', 'kalenteri_name_css') // refrence for css

    let carReservationsJSON;

    let availableCarsJson = my_ajax_object.available_cars

    function colorCase(title) {
        let color = availableCarsJson[title]
        if(color) {
            return color
        } else {
            return '#FFB000'
        }
    }

    // there is a duplicate of this in popus.js, imports/scope in wordpress is silly.
    function dateNoTimezone(date) {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    }

    // get reservations from database
    await jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: my_ajax_object.ajax_url,
        data: { action:'auto_get_all' },
        success: function(response){
            carReservationsJSON = response.data.map(obj => {
                return {...obj, color: colorCase(obj.title), extendedProps: {varaaja:obj.varaaja}}
            })
            //console.log(carReservationsJSON)
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
        firstDay: 1,
        
        select: async function(arg) {
            // 1 day has to be subtracted when in monthview and making reservations, else 2 day long event is created.
            const endDate = new Date(arg.end)
            if (calendar.view.type === 'dayGridMonth') { endDate.setDate(arg.end.getDate() - 1) }

            // Popup returns
            // {value: select.value, input: varaajaInput.value, start: startDateObj, end: endDateObj}) | null
            const popUpResult = await Popup(arg.start, endDate, availableCarsJson)

            if (popUpResult) {
                var title = popUpResult.value
                var varaaja = popUpResult.input
                var reservationStartTime = popUpResult.start
                var reservationEndTime = popUpResult.end

                jQuery.ajax({
                    type: "POST",
                    dataType: "json",
                    url: my_ajax_object.ajax_url,
                    data: {
                        action:'auto_post_db',
                        title: title,
                        start: dateNoTimezone(reservationStartTime),
                        end: dateNoTimezone(reservationEndTime),
                        varaaja: varaaja
                    },
                    success: function(response){
                        calendar.addEvent({
                        id: response.data.id,
                        title: title,
                        start: reservationStartTime,
                        end: reservationEndTime,
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

        eventClick: async function(arg) {
            // Popup returns
            // {id: event.id, delete: boolean, update: boolean} // update functionality is not implemented yet or ever?
            const clickPopupReturn = await clickPopup(arg.event)

            if (!clickPopupReturn.id) {
                return
            }

            if (clickPopupReturn.delete) {
                const deleteId = clickPopupReturn.id
                jQuery.ajax({
                    type: "post",
                    dataType: "json",
                    url: my_ajax_object.ajax_url,
                    data: {
                        action:'auto_delete_db',
                        id: deleteId
                    },
                    success: function(){ 
                        arg.event.remove()
                        console.log('deleted, id:', deleteId ); 
                    },
                    error: function(error){
                        console.log('deleted with error, id:', deleteId );
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
                    action:'auto_update_db',
                    id: arg.event.id,
                    start: dateNoTimezone(arg.event.start),
                    end: dateNoTimezone(arg.event.end)
                },
                success: function(){
                    console.log('moved, id:', arg.event.id); 
                    },
                error: function(error){
                    console.log('moved with error, id:', arg.event.id)
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
                    action:'auto_update_db',
                    id: arg.event.id,
                    start: dateNoTimezone(arg.event.start),
                    end: dateNoTimezone(arg.event.end)
                },
                success: function(){ 
                    console.log('updated, id:', arg.event.id); 
                },
                error: function(error){
                    console.log('updated with error, id:', arg.event.id)
                    console.log('update error:', error)
                }
            });
            } else {
            arg.revert();
            }
        },

        eventDidMount : function (event) {
            // add varaaja/reserver <p></p> to event when in week view 
            if (calendar.view.type === 'timeGridWeek') {
                const varaaja = event.event._def.extendedProps.varaaja // can be null.
                if (varaaja) {
                    let elements = event.el.getElementsByClassName('fc-event-title fc-sticky')

                    varaajaTextElemt = document.createElement('p')
                    varaajaTextElemt.setAttribute('id', 'eventparagraph')
                    const text = document.createTextNode(varaaja)
                    varaajaTextElemt.appendChild(text)

                    elements[0].appendChild(varaajaTextElemt)    
                }
            }
        },
        editable: true,
        dayMaxEvents: true,

        events: carReservationsJSON
    });

    calendar.render();


    // # testArea
    //SeriesPopup(new Date(), new Date(), availableCarsJson)
    /*
    const seriesButton = document.createElement('button')
    seriesButton.innerHTML = 'Sarja varaus (PROTOTYPE)'
    seriesButton.addEventListener('click', async () => {
        const result = await SeriesPopup(new Date(), new Date(), availableCarsJson)
        console.log('series result', result)
    })
    calendarEl.appendChild(seriesButton)
    */
})