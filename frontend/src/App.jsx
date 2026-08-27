import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState } from 'react'

export default function Calendar() {
  const [events, setEvents] = useState([])

  const handleDateClick = (info) => {
    const title = prompt('Nombre del evento')

    if (!title) return

    const newEvent = {
      id: Date.now().toString(),
      title,
      date: info.dateStr
    }

    setEvents(prev => [...prev, newEvent])
  }

  const handleEventClick = (info) => {
    const newTitle = prompt(
      'Editar evento',
      info.event.title
    )

    if (!newTitle) return

    setEvents(prev =>
      prev.map(event =>
        event.id === info.event.id
          ? { ...event, title: newTitle }
          : event
      )
    )
  }

  return (
    <FullCalendar
      plugins={[
        dayGridPlugin,
        interactionPlugin
      ]}
      initialView="dayGridMonth"
      events={events}
      dateClick={handleDateClick}
      eventClick={handleEventClick}
    />
  )
}