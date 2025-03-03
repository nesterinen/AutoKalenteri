async function Popup(startTime, endTime, availableCarsJson) {
  function dateNoTimezone(date) {
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
  }
  
  var startTimeVariable = dateNoTimezone(startTime).split("T")[1].split(".")[0].split(":")  // turn dateobj to string array [0]hours [1]minutes
  var endTimeVariable = dateNoTimezone(endTime).split("T")[1].split(".")[0].split(":")  // turn dateobj to string array [0]hours [1]minutes

  return new Promise((resolve) => {
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
    const rasrvParagraphText = document.createTextNode('Kello')
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
      myDialog.close()
      resolve(undefined)
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

      myDialog.close()
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