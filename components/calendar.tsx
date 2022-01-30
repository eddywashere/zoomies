import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useRef } from "react";

const Calendar = (props = {}) => {
    const calendarRef = useRef(null);

    return (
        <FullCalendar
            //@ts-ignore
            innerRef={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialEvents={[{ title: "nice event", start: new Date(), resourceId: "a" }]}
            {...props}
        />
    );
};

export default Calendar;
