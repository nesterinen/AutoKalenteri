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

    // event info
    const titleText = document.createElement('h3')
    titleText.textContent = event.title

    const dateText = document.createElement('h4')
    dateText.textContent = dateToJustDate(dateNoTimezone(event.start))

    const timeText = document.createElement('h4')
    timeText.textContent = dateToHourMin(dateNoTimezone(event.start)) + ' - ' + dateToHourMin(dateNoTimezone(event.end))

    const endText = document.createElement('p')
    endText.textContent = event._def.extendedProps.varaaja ? event._def.extendedProps.varaaja : 'ei varaajaa'

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
    clickDialog.appendChild(titleText)
    clickDialog.appendChild(dateText)
    clickDialog.appendChild(timeText)
    clickDialog.appendChild(endText)
    clickDialog.appendChild(deleteButton)
    clickDialog.appendChild(closeButton)
    clickDialog.showModal()
  })
}