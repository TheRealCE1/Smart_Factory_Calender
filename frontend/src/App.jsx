import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from 'react'
import './App.css'

export default function Calendar() {
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState(null)
  const [notificationMessage, setNotificationMessage] = useState('')

  const getLocalDate = (date = new Date()) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const getLocalTime = (date = new Date()) => date.toTimeString().slice(0, 5)

  const showEventNotification = (message) => {
    setNotificationMessage(message)
    window.setTimeout(() => setNotificationMessage(''), 6000)

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Calender Smart Factory', { body: message })
    }
  }

  useEffect(() => {
    const timers = []

    events.forEach((calendarEvent) => {
      if (calendarEvent.allDay) return

      const startTime = new Date(calendarEvent.start).getTime()
      const reminderMinutes = Number(calendarEvent.reminderMinutes)
      const reminderTime = startTime - reminderMinutes * 60 * 1000
      const schedule = (time, message) => {
        const delay = time - Date.now()
        if (delay > 0) timers.push(window.setTimeout(() => showEventNotification(message), delay))
      }

      if (reminderMinutes > 0) {
        schedule(reminderTime, `Tu evento "${calendarEvent.title}" comienza en ${reminderMinutes} minutos.`)
      }
      schedule(startTime, `Ya es la hora de tu evento: "${calendarEvent.title}".`)
    })

    return () => timers.forEach(window.clearTimeout)
  }, [events])

  const handleDateClick = (info) => {
    const date = info.dateStr.slice(0, 10)
    const time = info.dateStr.includes('T') ? info.dateStr.slice(11, 16) : '09:00'

    const end = new Date(`${date}T${time}`)
    end.setHours(end.getHours() + 1)
    setEventForm({ id: null, title: '', date, time, endDate: getLocalDate(end), endTime: getLocalTime(end), reminderMinutes: '5', allDay: false })
  }

  const handleEventClick = (info) => {
    const start = info.event.start
    const end = info.event.end || new Date(start.getTime() + 60 * 60 * 1000)
    setEventForm({
      id: info.event.id,
      title: info.event.title,
      date: getLocalDate(start),
      time: start.toTimeString().slice(0, 5),
      endDate: getLocalDate(end),
      endTime: getLocalTime(end),
      reminderMinutes: String(info.event.extendedProps.reminderMinutes || 0),
      allDay: info.event.allDay
    })
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get('title').trim()
    const date = formData.get('date')
    const allDay = formData.get('allDay') === 'on'
    const reminderMinutes = formData.get('reminderMinutes')

    if (!title || !date) return

    if (allDay) {
      const allDayEvent = {
        id: eventForm.id || Date.now().toString(),
        title,
        start: date,
        allDay: true,
        reminderMinutes: 0
      }

      setEvents(prev => eventForm.id
        ? prev.map(currentEvent => currentEvent.id === eventForm.id ? allDayEvent : currentEvent)
        : [...prev, allDayEvent]
      )
      setEventForm(null)
      return
    }

    const time = formData.get('time')
    const endDate = formData.get('endDate')
    const endTime = formData.get('endTime')

    if (!time || !endDate || !endTime) return

    if (new Date(`${endDate}T${endTime}`) <= new Date(`${date}T${time}`)) {
      setNotificationMessage('La fecha y hora de fin deben ser posteriores al inicio.')
      return
    }

    const updatedEvent = {
      id: eventForm.id || Date.now().toString(),
      title,
      start: `${date}T${time}`,
      end: `${endDate}T${endTime}`,
      reminderMinutes: Number(reminderMinutes)
    }

    setEvents(prev => eventForm.id
      ? prev.map(currentEvent => currentEvent.id === eventForm.id ? updatedEvent : currentEvent)
      : [...prev, updatedEvent]
    )
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
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
            <h1>Smart Factory Calender</h1>
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
          <button className="add-event-button" type="button" onClick={() => setEventForm({ id: null, title: '', date: getLocalDate(), time: '09:00', endDate: getLocalDate(), endTime: '10:00', reminderMinutes: '5', allDay: false })}>
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

      {notificationMessage && <div className="event-notification" role="status">{notificationMessage}</div>}

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
              {!eventForm.allDay && <label>
                Hora
                <input name="time" type="time" defaultValue={eventForm.time} required />
              </label>}
            </div>
            <label className="all-day-field">
              <input name="allDay" type="checkbox" checked={eventForm.allDay} onChange={(event) => setEventForm(prev => ({ ...prev, allDay: event.target.checked }))} />
              Todo el día
            </label>
            {!eventForm.allDay && <div className="event-fields-row">
              <label>
                Fecha de fin
                <input name="endDate" type="date" defaultValue={eventForm.endDate} required />
              </label>
              <label>
                Hora de fin
                <input name="endTime" type="time" defaultValue={eventForm.endTime} required />
              </label>
            </div>}
            <label>
              Recordatorio
              <select name="reminderMinutes" defaultValue={eventForm.reminderMinutes}>
                <option value="0">Sin recordatorio</option>
                <option value="5">5 minutos antes</option>
                <option value="10">10 minutos antes</option>
              </select>
            </label>
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