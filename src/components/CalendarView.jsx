import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarView.css';

function CalendarView({ events }) {
  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="100%"
        contentHeight="100%"
        expandRows={true}
        headerToolbar={{
          left: 'title',
          right: ''
        }}
        locale="zh-cn"
        buttonText={{ today: '今天' }}
        dayCellClassNames="calendar-day-cell"
        eventClassNames="calendar-event"
      />
    </div>
  );
}

export default CalendarView;