function dateNoTimezone(date) {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}

function dateToHourMin(date) {
  const timeString = date.split("T")[1].split(".")[0].split(":")
  return timeString[0] + ':' + timeString[1]
}

function dateToJustDate(date) {
  const dateString = date.split("T")[0].split("-").reverse().join(".")
  return dateString
}

async function SeriesPopup(startDateObj, endDateObj,availableCarsJson) {
  return new Promise((resolve) => {
    //const startTimeVariable = dateNoTimezone(startTime).split("T")[1].split(".")[0].split(":")  // turn dateobj to string array [0]hours [1]minutes
    //const endTimeVariable = dateNoTimezone(endTime).split("T")[1].split(".")[0].split(":")  // turn dateobj to string array [0]hours [1]minutes

    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    function parseClock(clock) {
      const [hours, minutes] = clock.split(':')
      return parseInt(hours)*60 + parseInt(minutes)
    }
    
    // start datetime
    const [startDate, startTime] = dateNoTimezone(startDateObj).split("T")
    const [sYear, sMonth, sDay] = startDate.split('-')
    const [sHour, sMinute] = startTime.split(':')

    // end datetime
    const [endDate, endTime] = dateNoTimezone(endDateObj).split("T")
    const [eYear, eMonth, eDay] = endDate.split('-')
    const [eHour, eMinute] = endTime.split(':')
    

    const dialog = document.createElement('dialog')
    dialog.classList.add('seriesPopup')
    dialog.innerHTML = `
      <h2>Auton sarja varaus</h2>

      <select id='popCarSelect'>
      </select>

      <div>
        <p>Aikaväli</p>
        <div class='popTimeSpan'>
          <input type='date' id='popDateStartTime' value='${sYear}-${sMonth}-${sDay}'/>
          <p>:</p>
          <input type='date' id='popDateEndTime' value='${eYear}-${eMonth}-${eDay}'/>
        </div>
      </div>

      <div class='popDaySelect'>
        <div>
          <input type='checkbox' id='cbMa' class='cbDay'/>
          <label for='cbMa'>ma</label>
        </div>
        <div>
          <input type='checkbox' id='cbTi' class='cbDay'/>
          <label for='cbTi'>ti</label>
        </div>
        <div>
          <input type='checkbox' id='cbKe' class='cbDay'/>
          <label for='cbKe'>ke</label>
        </div>
        <div>
          <input type='checkbox' id='cbTo' class='cbDay'/>
          <label for='cbTo'>to</label>
        </div>
        <div>
          <input type='checkbox' id='cbPe' class='cbDay'/>
          <label for='cbPe'>pe</label>
        </div>
      </div>

      <div>
        <p>Kello</p>
        <div class='popTimeSpan'>
          <input type='time' id='popTimeStartTime' value='08:00'/>
          <p>:</p>
          <input type='time' id='popTimeEndTime' value='10:00'/>
        </div>
      </div>

      <div>
        <p>Varaaja</p>
        <input type='text' class='popSarjaVaraaja'/>
      </div>

      <button class='addButton varausBaseButton baseGreen'>varaa</button>
      <button class='closeButton varausBaseButton'>peruuta</button>
    `
    //<input type='time' id='popTimeStartTime' value='${sHour}:${sMinute}'/>
    //<input type='time' id='popTimeEndTime' value='${eHour}:${eMinute}'/>

    const select = dialog.querySelector('#popCarSelect')
    Object.keys(availableCarsJson).map(carName => {
      const autoSelectElem = document.createElement('option')
      autoSelectElem.appendChild(document.createTextNode(carName))
      select.appendChild(autoSelectElem)
    })

    const closeButton = dialog.querySelector('.closeButton')
    closeButton.addEventListener('click', () => {
      closeButton.removeEventListener('click', () => closeButtonFunction())
      dialog.remove()
      resolve(null)
    })

    const addButton = dialog.querySelector('.addButton')
    addButton.addEventListener('click', () => {
      //addButton.removeEventListener('click', () => closeButtonFunction())

      // get values from dates and times TODO
      const startClock = dialog.querySelector('#popTimeStartTime').value
      const startDateText = `${dialog.querySelector('#popDateStartTime').value}T${startClock}:00`
      const startDateInput = new Date(startDateText)

      const endClock = dialog.querySelector('#popTimeEndTime').value
      const endDateText = `${dialog.querySelector('#popDateEndTime').value}T${endClock}:00`
      const endDateInput = new Date(endDateText)

      const checkboxElements = dialog.getElementsByClassName('cbDay')
      let daysChecked = []
      for (const checkbox of checkboxElements) {
        daysChecked.push(checkbox.checked)
      }
      daysChecked.push(false) // saturday
      daysChecked.push(false) // sunday

      // if no days are checked
      if(daysChecked.reduce((prev, curr) => prev + curr) === 0){
        dialog.querySelector('.popDaySelect').style = 'outline: solid red;'
        return
      } else {
        dialog.querySelector('.popDaySelect').style = 'outline: none;'
      }

      const diffTime = startDateInput - endDateInput

      if(diffTime >= 0){
        dialog.querySelector('#popDateEndTime').style = 'outline: solid red;'
        return
      } else {
        dialog.querySelector('#popDateEndTime').style = 'outline: none;'
      }

      const diffDays = Math.floor(-diffTime / (1000 * 60 * 60 * 24)) // time difference in days.

      if(diffDays === 0 || diffDays >= 180){
        dialog.querySelector('#popDateEndTime').style = 'outline: solid red;'
        return
      } else {
        dialog.querySelector('#popDateEndTime').style = 'outline: none;'
      }

      if (parseClock(endClock) - parseClock(startClock) <= 0) {
        dialog.querySelector('#popTimeEndTime').style = 'outline: solid red;'
        return
      } else {
        dialog.querySelector('#popTimeEndTime').style = 'outline: none;'
      }

      // loop through days froms start to end
      const arrayOfDates = [] //[{start: date, endDate}, {}, ...]
      for (let i = 1; i <= diffDays; i++){
        const newDate = addDays(startDateInput, i)
        if(daysChecked[ newDate.getDay() - 1 ]){
          const newDateEnd = new Date(newDate)//addDays(endDateInput, i)
          const [eHours, eMins] = endClock.split(':')
          newDateEnd.setHours(parseInt(eHours))
          newDateEnd.setMinutes(parseInt(eMins))
          arrayOfDates.push({
            start: dateNoTimezone(newDate),//newDate,
            end: dateNoTimezone(newDateEnd)//newDateEnd
          })
        }
      }

      if(arrayOfDates.length === 0){
        dialog.remove()
        resolve(null)
      }

      const varaajaElement = dialog.querySelector('.popSarjaVaraaja')
      if(varaajaElement.value === ''){
        varaajaElement.style = 'outline: solid red;'
        return
      } else {
        varaajaElement.style = 'outline: none;'
      }

      const varaaja = `${varaajaElement.value} ::sarja ::${new Date().valueOf()}`

      dialog.remove()
      resolve({
        varaaja,
        title: select.value,
        dates: arrayOfDates
      })
    })
    
    document.body.appendChild(dialog)
    dialog.showModal()
  })
}

async function Popup(startTime, endTime, availableCarsJson) {
  return new Promise((resolve) => {
    var startTimeVariable = dateNoTimezone(startTime).split("T")[1].split(".")[0].split(":")  // turn dateobj to string array [0]hours [1]minutes
    var endTimeVariable = dateNoTimezone(endTime).split("T")[1].split(".")[0].split(":")  // turn dateobj to string array [0]hours [1]minutes
    // Dialog the main element.
    const myDialog = document.createElement("dialog")
    myDialog.setAttribute('id', 'varausPopup')
    document.body.appendChild(myDialog)
    
    // Header txt
    const header = document.createElement('h2')
    const text = document.createTextNode("Auton varaus")
    header.appendChild(text)


    // Reservation time span #######################################
    const resrvTimes = document.createElement('div')
    resrvTimes.setAttribute('id', "popupStartEndTimes")

    const rasrvParagraph = document.createElement('p')
    const rasrvParagraphText = document.createTextNode('Aikaväli')
    rasrvParagraph.appendChild(rasrvParagraphText)

    var startTextField = document.createElement('input')
    startTextField.setAttribute('type', 'time')
    startTextField.setAttribute('value', `${startTimeVariable[0]}:${startTimeVariable[1]}`)

    var endTextField = document.createElement('input')
    endTextField.setAttribute('type', 'time')
    endTextField.setAttribute('value', `${endTimeVariable[0]}:${endTimeVariable[1]}`)

    resrvTimes.appendChild(rasrvParagraph)
    resrvTimes.appendChild(startTextField)
    resrvTimes.appendChild(endTextField)
    // ################################################################


    // create selection from availableCars
    var select = document.createElement('select')
    Object.keys(availableCarsJson).map(carName => {
      const autoSelectElem = document.createElement('option')
      autoSelectElem.appendChild(document.createTextNode(carName))
      select.appendChild(autoSelectElem)
    })


    // reserver / varaaja
    const varaajaText = document.createElement('p')
    const text2 = document.createTextNode("Varaaja")
    varaajaText.appendChild(text2)
    var varaajaInput = document.createElement('input')
  
    
    // close dialog button #########################################
    var closeButton = document.createElement('button')
    closeButton.textContent = 'peruuta'
    closeButton.setAttribute('id', 'closeButton')
    closeButton.addEventListener('click', () => dialogClose())

    function dialogClose() {
      addButton.removeEventListener('click', () => dialogAdd())
      closeButton.removeEventListener('click', () => dialogClose())
      myDialog.remove()
      resolve(null)
    }

    // ################################################################


    // add reservarion button ######################################
    var addButton = document.createElement('button')
    addButton.textContent = 'varaa'
    addButton.setAttribute('id', 'addButton')
    addButton.addEventListener('click', () => dialogAdd())

    function dialogAdd() {
      addButton.removeEventListener('click', () => dialogAdd())
      closeButton.removeEventListener('click', () => dialogClose())

      const startDateObj = new Date(startTime)
      startTimeVariable = startTextField.value.split(':')
      startDateObj.setHours(startTimeVariable[0])
      startDateObj.setMinutes(startTimeVariable[1])

      const endDateObj = new Date(endTime)
      endTimeVariable = endTextField.value.split(':')
      endDateObj.setHours(endTimeVariable[0])
      endDateObj.setMinutes(endTimeVariable[1])

      myDialog.remove()
      resolve({value: select.value, input: varaajaInput.value, start: startDateObj, end: endDateObj})
    }
    // ################################################################
    

    // Finalize creating element
    myDialog.appendChild(header)
    myDialog.appendChild(select)
    myDialog.appendChild(resrvTimes)
    myDialog.appendChild(varaajaText)
    myDialog.appendChild(varaajaInput)
    myDialog.appendChild(addButton)
    myDialog.appendChild(closeButton)
    myDialog.showModal()
  })
}


async function clickPopup(event) {
  return new Promise((resolve) => {
    // clickDialog the main element.
    const clickDialog = document.createElement("dialog")
    clickDialog.setAttribute('id', 'clickPopup')
    document.body.appendChild(clickDialog)

    // Header txt
    const header = document.createElement('h2')
    const text = document.createTextNode("Varaus")
    header.appendChild(text)

    // event info  ####################################################
    const eventInfo = document.createElement('div')
    eventInfo.setAttribute('id', 'popupEventInfo')

    const titleText = document.createElement('h3')
    titleText.textContent = event.title

    const dateText = document.createElement('h4')
    dateText.textContent = dateToJustDate(dateNoTimezone(event.start))

    const timeText = document.createElement('h4')
    timeText.textContent = dateToHourMin(dateNoTimezone(event.start)) + ' - ' + dateToHourMin(dateNoTimezone(event.end))

    const endText = document.createElement('h3')
    endText.textContent = event._def.extendedProps.varaaja ? event._def.extendedProps.varaaja : 'ei varaajaa'
    
    eventInfo.appendChild(titleText)
    eventInfo.appendChild(dateText)
    eventInfo.appendChild(timeText)
    eventInfo.appendChild(endText)
    // ################################################################


    // delete dialog button ###########################################
    var deleteButton = document.createElement('button')
    deleteButton.textContent = 'poista'
    deleteButton.setAttribute('id', 'deleteButton')
    deleteButton.addEventListener('click', () => dialogDelete())

    function dialogDelete() {
      closeButton.removeEventListener('click', () => dialogClose())
      deleteButton.removeEventListener('click', () => dialogDelete())
      clickDialog.remove()
      resolve({id: event.id, delete: true, update: false})
    }
    // ################################################################


    // close dialog button ############################################
    var closeButton = document.createElement('button')
    closeButton.textContent = 'takaisin'
    closeButton.setAttribute('id', 'closeButton')
    closeButton.addEventListener('click', () => dialogClose())

    function dialogClose() {
      closeButton.removeEventListener('click', () => dialogClose())
      deleteButton.removeEventListener('click', () => dialogDelete())
      clickDialog.remove()
      resolve({id: null, delete: false, update: false})
    }
    // ################################################################


    // Finalize creating element
    clickDialog.appendChild(header)

    clickDialog.appendChild(eventInfo)
    //clickDialog.appendChild(titleText)
    //clickDialog.appendChild(dateText)
    //clickDialog.appendChild(timeText)
    //clickDialog.appendChild(endText)

    clickDialog.appendChild(deleteButton)
    clickDialog.appendChild(closeButton)
    clickDialog.showModal()
  })
}