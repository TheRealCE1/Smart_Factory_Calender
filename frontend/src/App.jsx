import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState } from 'react'
import './App.css'

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
    <main className="app-shell">
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />

      <section className="calendar-card glass-panel">
        <header className="calendar-header">
          <div>
            <p className="eyebrow">ORGANIZA TU TIEMPO</p>
            <h1>Calendario</h1>
            <p className="subtitle">Planifica tus eventos y mantén tus días bajo control.</p>
          </div>
          <div className="event-counter neumorphic-inset" aria-live="polite">
            <strong>{events.length}</strong>
            <span>{events.length === 1 ? 'evento' : 'eventos'}</span>
          </div>
        </header>

        <div className="calendar-toolbar">
          <span className="calendar-hint">
            <span className="hint-dot" aria-hidden="true" />
            Selecciona un día para crear un evento
          </span>
          <span className="edit-hint">Haz clic en un evento para editarlo</span>
        </div>

        <div className="calendar-surface neumorphic-surface">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            dayMaxEvents={3}
          />
        </div>
      </section>
    </main>
  )
}