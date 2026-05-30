import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarView.css';

function CalendarView({ events, viewType, onDatesSet }) {
  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const props = event.extendedProps || {};
    const start = event.start;
    const hours = start ? String(start.getHours()).padStart(2, '0') : '';
    const minutes = start ? String(start.getMinutes()).padStart(2, '0') : '';
    const timeStr = `${hours}:${minutes}`;

    // 地点简略名（月视图用）
    const locationShort = props.location ? props.location.slice(0, 4) : '';

    // 根据视图类型返回不同的 JSX
    switch (viewType) {
      case 'dayGridDay':
        return (
          <div className="event-content event-detail-day">
            <div className="event-time">{timeStr}</div>
            <div className="event-title">{event.title}</div>
            {props.location && (
              <div className="event-loc">
                📍 {props.locationUrl ? (
                  <a href={props.locationUrl} target="_blank" rel="noreferrer">{props.location}</a>
                ) : props.location}
              </div>
            )}
            {props.person && <div className="event-person">👤 {props.person}</div>}
            {props.description && <div className="event-desc">📝 {props.description}</div>}
          </div>
        );

      case 'dayGridWeek':
        return (
          <div className="event-content event-detail-week">
            <div><span className="event-time">{timeStr}</span> <span className="event-title">{event.title}</span></div>
            {props.location && (
              <div className="event-loc">
                📍 {props.locationUrl ? (
                  <a href={props.locationUrl} target="_blank" rel="noreferrer">{props.location}</a>
                ) : props.location}
              </div>
            )}
            {props.person && <div className="event-person">👤 {props.person}</div>}
          </div>
        );

      case 'multiMonthYear':
        return (
          <div className="event-content event-detail-year">
            <span className="event-title">{event.title}</span>
          </div>
        );

      // 月视图（默认）
      default:
        return (
          <div className="event-content event-detail-month">
            {timeStr !== '00:00' && <span className="event-time">{timeStr}</span>}
            {locationShort && <span className="event-loc"> {locationShort}</span>}
            <span className="event-title"> {event.title}</span>
          </div>
        );
    }
  };

  const eventClassNames = (arg) => {
    const priority = arg.event.extendedProps?.priority || 'medium';
    return [`priority-${priority}`];
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        views={{
          dayGridMonth: { type: 'dayGridMonth' },
          dayGridWeek: { type: 'dayGridWeek' },
          dayGridDay: { type: 'dayGridDay' },
          multiMonthYear: {
            type: 'multiMonthYear',
            duration: { months: 12 },
            titleFormat: { year: 'numeric' }
          }
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridDay,dayGridWeek,dayGridMonth,multiMonthYear'
        }}
        events={events}
        height="100%"
        expandRows={true}
        stickyHeaderDates={false}
        locale="zh-cn"
        buttonText={{
          today: '今天',
          prev: '‹',
          next: '›',
          dayGridDay: '日',
          dayGridWeek: '周',
          dayGridMonth: '月',
          multiMonthYear: '年'
        }}
        eventContent={renderEventContent}
        eventClassNames={eventClassNames}
        datesSet={onDatesSet}
      />
    </div>
  );
}

export default CalendarView;