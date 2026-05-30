import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarView.css';
import React from 'react';
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
          <div className="day-title">{event.title}</div>
          <div className="day-time">{timeStr}</div>
          <div className="day-meta">
            {props.location && (
              <span className="event-loc" style={{ whiteSpace: 'nowrap' }}>
                📍 {props.location}
              </span>
            )}
            {props.person && <span className="event-person">👤 {props.person}</span>}
            {props.description && <span className="event-desc">📝 {props.description}</span>}
          </div>
        </div>
      );

      case 'dayGridWeek':
        return (
          <div className="event-content event-detail-week">
            <div className="week-main">
              <span className="event-time">{timeStr}</span>
              <span className="event-title">{event.title}</span>
            </div>
            {(props.location || props.person) && (
              <div className="week-meta">
                {props.location && <span className="event-loc">📍 {props.location}</span>}
                {props.person && <span className="event-person">👤 {props.person}</span>}
              </div>
            )}
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
    const priority = arg.event.extendedProps?.computedPriority || 'medium';
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