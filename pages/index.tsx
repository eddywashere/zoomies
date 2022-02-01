import type { ReactElement } from "react";
import { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import Calendar from "../components/calendar";
import pMap from "p-map";
import addMinutes from "date-fns/addMinutes";
import formatISO from "date-fns/formatISO";
import endOfWeek from "date-fns/endOfWeek";
import getHours from "date-fns/getHours";

import withAuth from "../utils/with-auth";
import { getLayout } from "../components/layout/dashboard";
import UIPage from "../components/ui/page";
import toasty from "../components/toasty";
import redis from "../utils/redis";
import zoom from "../utils/zoom";

export default function Page({ meetings, users }: any) {
    let earliestStartingHour: number;
    const eow = new Date(endOfWeek(new Date()));
    const initialEvents = meetings.map((m: any) => {
        let currentStartTime = new Date(m.start_time);
        let currentStartHour = getHours(currentStartTime);
        if (!earliestStartingHour) {
            earliestStartingHour = currentStartHour;
        } else if (currentStartTime <= eow && (currentStartHour > earliestStartingHour || !!earliestStartingHour)) {
            earliestStartingHour = currentStartHour;
        }
        return {
            title: `${m.account}: ${m.topic}`,
            start: m.start_time,
            end: m.end_time,
            duration: m.duration,
            meetingId: m.meetingId,
            topic: m.topic,
            account: m.account,
            backgroundColor: m.backgroundColor,
        };
    });

    const toastify = (event: any) => {
        const title = event?.extendedProps?.account;
        const description = event?.extendedProps?.topic;
        const link = `https://us02web.zoom.us/meeting/${event?.extendedProps?.meetingId}`;
        return toasty({ title, description, link });
    };

    return (
        <UIPage>
            <UIPage.Body>
                <Calendar
                    // @ts-ignore
                    scrollTime={`${earliestStartingHour || 11}:00:00`}
                    scrollTimeReset={false}
                    slotEventOverlap={false}
                    slotMinTime="08:00:00"
                    initialEvents={initialEvents}
                    initialView="listYear"
                    eventClick={(data) => toastify(data.event)}
                    selectable
                    height={600}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "timeGridWeek,dayGridMonth listYear",
                    }}
                    buttonText={{ listYear: "Event List", month: "Month", week: "Week", today: "Today" }}
                />
            </UIPage.Body>
        </UIPage>
    );
}

Page.getLayout = (page: ReactElement) => {
    return getLayout(page, {
        meta: { title: "Dashboard" },
    });
};

const getLicensedUsers = async () => {
    let licensedUsersCache = await redis.get("licensedUsers");
    if (licensedUsersCache) {
        console.log("hit: licensedUsers");
        return JSON.parse(licensedUsersCache);
    }
    console.log("miss: licensedUsers");

    const colors = ["#b91c1c", "#4d7c0f", "#1e40af", "#d97706", "#6d28d9", "#db2777"];
    const response = await zoom.users.ListUsers();
    const licensedUsers = response.users
        .filter((u) => u.type === 2)
        .map((u) => ({
            ...u,
            backgroundColor: colors.shift() || "#cccccc",
        }));
    try {
        redis.set("licensedUsers", JSON.stringify(licensedUsers), "EX", 60 * 60); // 1HR CACHE
    } catch (error) {
        console.error(error);
    }

    return licensedUsers;
};

const getAllUserMeetings = async (licensedUsers: any[]) => {
    let allUserMeetings = await redis.get("allUserMeetings");
    if (allUserMeetings) {
        console.log("hit: allUserMeetings");
        return JSON.parse(allUserMeetings);
    }
    console.log("miss: allUserMeetings");

    const getUserMeetings = async ({ id, first_name, last_name, pic_url, backgroundColor }: any) => {
        const response = await zoom.meetings.ListMeetings(id, { type: "upcoming", page_size: 300 });

        return response.meetings
            .map((m) => {
                const { start_time, duration, agenda, topic } = m;
                return {
                    start_date_time: start_time ? new Date(start_time).getTime() : null,
                    start_time: start_time || null,
                    end_time: !!start_time && !!duration ? formatISO(addMinutes(new Date(start_time), duration)) : null,
                    duration: duration || null,
                    agenda: agenda || "Agenda N/A",
                    topic: topic || "Untitled",
                    account: `${first_name} ${last_name}`,
                    avatar: pic_url,
                    meetingId: m.id,
                    meeting_type: m.type,
                    backgroundColor,
                };
            })
            .filter((a) => !!a.start_date_time);
    };

    const meetings = await pMap(licensedUsers, getUserMeetings, { concurrency: 4 });
    //@ts-ignore
    const flattenedMeetings = meetings.flat().sort((a, b) => a.start_date_time - b.start_date_time);
    try {
        redis.set("allUserMeetings", JSON.stringify(flattenedMeetings), "EX", 60 * 3); // 3 minute cache
    } catch (error) {
        console.error(error);
    }

    return flattenedMeetings;
};

export const getServerSideProps = withAuth(async (_ctx: GetServerSidePropsContext) => {
    const licensedUsers = await getLicensedUsers();
    const meetings = await getAllUserMeetings(licensedUsers);

    return {
        props: {
            users: licensedUsers,
            meetings: meetings,
        },
    };
});
