class CarReservationsContainer {
    constructor(car, color){
        this.car = car
        this.color = color
        this.startDate = new Date()
        this.endDate = new Date(new Date(this.startDate).setMonth(this.startDate.getMonth() + 1))
        this.element = this.#createElement(car, color)
        this.events = []
        this.reservationCount = 0
    }

    #createElement(car, color) {
        const startDateStr = this.startDate.toISOString().split('T')[0]
        const endDateStr = this.endDate.toISOString().split('T')[0]

        const Element = document.createElement('div')
        Element.classList.add('EeRoomContainer')
        Element.innerHTML = `
            <div class='EeRoomHeader'>
                <h1 style='text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: 3px;'>
                    ${car}
                </h1>
                <div class='EeRoomHeaderDate'>
                    <div>
                        <input type='date' value='${startDateStr}' disabled>
                    </div>
                    <div>-</div>
                    <div>
                        <input type='date' value='${endDateStr}' class='endDateInput'/>
                    </div>
                    <div class='reservationCount'>
                        bla bla bla
                    </div>
                </div>
            </div>

            <div class='${car}'>
            </div>
        `

        const endDateInput = Element.querySelector('.endDateInput')
        endDateInput.addEventListener('input', (event) => {
            const newEndDate = new Date(event.target.value)
            if(newEndDate - this.startDate >= 0) {
                this.endDate = newEndDate
                this.renderEvents()
                endDateInput.style = 'outline: none;'
            } else {
                endDateInput.style = 'outline: 1px solid red;'
            }
        })

        return Element
    }

    #eventElement(event) {
        const eventElement = document.createElement('div')
        //eventElement.style = 'outline: 1px solid coral;'
        eventElement.classList.add('EeElement')
        let [dateText, startTime] = event.start.split(' ')
        let [ , endTime] = event.end.split(' ')
    
        startTime = startTime.split(':')    
        startTime = startTime[0] + ':' + startTime[1]
    
        endTime = endTime.split(':')
        endTime = endTime[0] + ':' + endTime[1]
    
        eventElement.innerHTML = `
            <div class='EeDateTime'>
                <div class='EeParagraph'>${dateText.replaceAll('-', '.')}</div>
                <div class='EeParagraph'>${startTime}-${endTime}</div>
            </div>
    
            <div class='EeHeader'>${event.varaaja.split('::')[0]}</div>
            <div class='EeParagraph'>${event.title}</div>
        `
        return eventElement
    }

    renderEvents(){
        this.reservationCount = 0
        const Container = this.element.querySelector('.'+this.car)
        Container.innerHTML = ''
        const oneDayMs = 1000*60*60*20 //20hours
        this.events.forEach((event) => {
            // filter dates by endDate + 20hours
            if(new Date(event.end) - this.endDate >= oneDayMs){
                return
            } 
            Container.appendChild(this.#eventElement(event))
            this.reservationCount++;
        })

        this.element.querySelector('.reservationCount').innerHTML = `jakson varaus määrä: ${this.reservationCount}`
    }

    addEvent(event){
        this.events.push(event)
    }
}

async function EventList(parentElement){
    let reservations

    const container = document.createElement('div')
    container.innerHTML = `
        <div class='EeMainContainer'>
        </div>
    `

    const mainContainer = container.querySelector('.EeMainContainer')

    // create car container/element/object things
    const cars = {}
    for (const [car, color] of Object.entries(php_args.available_cars)) {
        const eventObject = new CarReservationsContainer(car, color)
        cars[car] = eventObject
        mainContainer.appendChild(eventObject.element)
    }

    // fetch all events (within year) from database
    await jQuery.ajax({
        type: "POST",
        dataType: "json",
        url: php_args.ajax_url,
        data: { action: 'auto_get_all' },
        success: function (response) {
            reservations = response.data.map(obj => {
                const color = php_args.available_cars[obj.title] ? php_args.available_cars[obj.title] : '#5baa00'
                return {...obj, color:color}
            })
        },
        error: function(error){
            console.log('get all error:', error)
            reservations = null
        }
    })

    if(!reservations) {
        console.log('database connection error...')
        return
    }

    // filter old events
    reservations = reservations.filter(event => 
        new Date (event.end) - new Date() >= 0
    )

    // sort events by date
    reservations = reservations.sort((curr, next) => {
        return new Date(curr.start) - new Date(next.start)
    })

    // add events for appropriate cars
    for (const event of reservations) {
        if(!event.title) continue
        cars[event.title].addEvent(event)
    }

    // render all cars
    for (const car of Object.values(cars)) {
        if(car instanceof CarReservationsContainer){
            car.renderEvents()
        }
    }

    parentElement.appendChild(container)
}

console.log('varaukset.js loaded')
document.addEventListener('DOMContentLoaded', async () => {
    const calendarListElement = document.getElementById(php_args.element_name)
    if(!calendarListElement) return
    
    const link = document.createElement('a')
    link.href = php_args.link_to_main
    link.textContent = 'Autovaraus kalenteri'
    calendarListElement.appendChild(link)

    await EventList(calendarListElement)

    const blink = document.createElement('a')
    blink.href = php_args.link_to_main
    blink.textContent = 'Autovaraus kalenteri'
    calendarListElement.appendChild(blink)
})