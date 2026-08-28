import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState } from 'react'
import './App.css'

export default function Calendar() {
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState(null)

  const handleDateClick = (info) => {
    const date = info.dateStr.slice(0, 10)
    const time = info.dateStr.includes('T') ? info.dateStr.slice(11, 16) : '09:00'

    setEventForm({ id: null, title: '', date, time })
  }

  const handleEventClick = (info) => {
    const start = info.event.start
    setEventForm({
      id: info.event.id,
      title: info.event.title,
      date: start.toISOString().slice(0, 10),
      time: start.toTimeString().slice(0, 5)
    })
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get('title').trim()
    const date = formData.get('date')
    const time = formData.get('time')

    if (!title || !date || !time) return

    const updatedEvent = {
      id: eventForm.id || Date.now().toString(),
      title,
      start: `${date}T${time}`
    }

    setEvents(prev => eventForm.id
      ? prev.map(currentEvent => currentEvent.id === eventForm.id ? updatedEvent : currentEvent)
      : [...prev, updatedEvent]
    )
    setEventForm(null)
  }

  const handleDeleteEvent = () => {
    if (!eventForm?.id) return

    setEvents(prev => prev.filter(event => event.id !== eventForm.id))
    setEventForm(null)
  }

  return (
    <main className="app-shell">
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />

      <section className="calendar-card glass-panel">
        <header className="calendar-header">
          <div>
            <p className="eyebrow">ORGANIZA TU TIEMPO</p>
            <h1>Calender Smart Factory</h1>
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
            Haz clic en un día o franja horaria para crear un evento
          </span>
          <button className="add-event-button" type="button" onClick={() => setEventForm({ id: null, title: '', date: new Date().toISOString().slice(0, 10), time: '09:00' })}>
            + Nuevo evento
          </button>
        </div>

        <div className="calendar-surface neumorphic-surface">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            buttonText={{ month: 'Mes', week: 'Semana', day: 'Día', today: 'Hoy' }}
            height="auto"
            dayMaxEvents={3}
          />
        </div>
      </section>

      {eventForm && (
        <div className="event-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEventForm(null)}>
          <form className="event-dialog glass-panel" onSubmit={handleFormSubmit}>
            <div className="dialog-heading">
              <div>
                <p className="eyebrow">{eventForm.id ? 'ACTUALIZA EL PLAN' : 'AÑADE A TU AGENDA'}</p>
                <h2>{eventForm.id ? 'Editar evento' : 'Nuevo evento'}</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Cerrar formulario" onClick={() => setEventForm(null)}>×</button>
            </div>
            <label>
              Evento
              <input name="title" type="text" placeholder="Ej. Reunión de equipo" defaultValue={eventForm.title} autoFocus required />
            </label>
            <div className="event-fields-row">
              <label>
                Fecha
                <input name="date" type="date" defaultValue={eventForm.date} required />
              </label>
              <label>
                Hora
                <input name="time" type="time" defaultValue={eventForm.time} required />
              </label>
            </div>
            <div className="dialog-actions">
              {eventForm.id && <button className="delete-button" type="button" onClick={handleDeleteEvent}>Borrar evento</button>}
              <button className="cancel-button" type="button" onClick={() => setEventForm(null)}>Cancelar</button>
              <button className="save-button" type="submit">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}