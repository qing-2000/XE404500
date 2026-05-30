import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarView.css';

function CalendarView({ events, onDatesSet }) {
  // 自定义事件内容：精简显示
  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const props = event.extendedProps || {};
    const start = event.start;
    const hours = start ? String(start.getHours()).padStart(2, '0') : '';
    const locationShort = props.location ? props.location.slice(0, 4) : '';

    return (
      <div className="event-content">
        {hours && <span className="event-time">{hours}:00</span>}
        {locationShort && <span className="event-loc"> {locationShort}</span>}
        <span className="event-title"> {event.title}</span>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="100%"
        expandRows={true}
        stickyHeaderDates={false}
        headerToolbar={{
          left: 'title',
          right: ''
        }}
        locale="zh-cn"
        buttonText={{ today: '今天' }}
        eventContent={renderEventContent}
        datesSet={onDatesSet}
      />
    </div>
  );
}

export default CalendarView;