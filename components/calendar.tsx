import FullCalendar, { type CalendarOptions } from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { useRef } from "react";

const Calendar = (props: CalendarOptions) => {
    const calendarRef = useRef(null);

    return (
        <FullCalendar
            //@ts-ignore
            innerRef={calendarRef}
            plugins={[dayGridPlugin, listPlugin, timeGridPlugin, interactionPlugin]}
            initialEvents={[{ title: "nice event", start: new Date(), resourceId: "a" }]}
            {...props}
        />
    );
};

export default Calendar;
