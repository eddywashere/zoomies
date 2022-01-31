import type { ReactElement } from "react";
import { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import Calendar from "../components/calendar";
import zoomApi from "zoomapi";
import pMap from "p-map";

import withAuth from "../utils/with-auth";
import { getLayout } from "../components/layout/dashboard";
import UIPage from "../components/ui/page";
import toasty from "../components/toasty";

export default function Page({ meetings }: any) {
    // As this page uses Server Side Rendering, the `session` will be already
    // populated on render without needing to go through a loading stage.
    // This is possible because of the shared context configured in `_app.js` that
    // is used by `useSession()`.
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const colors = ["#b91c1c", "#4d7c0f", "#1e40af", "#d97706", "#6d28d9", "#db2777"];
    const bgColorMap: any = {};
    const getBackgroundColors = (account: string) => {
        bgColorMap[account] = bgColorMap[account] || colors.shift();
        return bgColorMap[account];
    };
    const initialEvents = meetings.map((m: any) => ({
        title: `${m.account}: ${m.topic}`,
        start: m.start_time,
        duration: m.duration,
        meetingId: m.meetingId,
        topic: m.topic,
        account: m.account,
        backgroundColor: getBackgroundColors(m.account),
    }));

    const toastify = (event: any) => {
        const title = event?.extendedProps?.account;
        const description = event?.extendedProps?.topic;
        const link = `https://us02web.zoom.us/meeting/${event?.extendedProps?.meetingId}`;
        return toasty({ title, description, link });
    };

    // todo: find earliest meeting time during the week and set as scrollTime

    return (
        <UIPage>
            <UIPage.Body>
                {/* @ts-ignore */}
                <Calendar
                    scrollTime="08:00:00"
                    scrollTimeReset={false}
                    slotEventOverlap={false}
                    /* @ts-ignore */
                    slotDuration="00:15:00"
                    initialEvents={initialEvents}
                    /* @ts-ignore */
                    defaultView="dayGridMonth"
                    eventClick={(data) => toastify(data.event)}
                    selectable
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

export const getServerSideProps = withAuth(async (_ctx: GetServerSidePropsContext) => {
    const client = zoomApi({
        apiKey: process.env.ZOOM_CLIENT_ID || "",
        apiSecret: process.env.ZOOM_CLIENT_SECRET || "",
    });
    const response = await client.users.ListUsers();
    const licensedUsers = response.users.filter((u) => u.type === 2);

    const getUserMeetings = async ({ id, first_name, last_name, pic_url }: any) => {
        const response = await client.meetings.ListMeetings(id, { type: "upcoming", page_size: 300 });

        return response.meetings.map((m) => {
            const { start_time, duration, agenda, topic } = m;
            return {
                start_time: start_time || null,
                duration: duration || null,
                agenda: agenda || "Agenda N/A",
                topic: topic || "Untitled",
                account: `${first_name} ${last_name}`,
                avatar: pic_url,
                meetingId: m.id,
                meeting_type: m.type,
            };
        });
        // todo: sort this first.
    };

    const meetings = await pMap(licensedUsers, getUserMeetings, { concurrency: 4 });
    return {
        props: {
            users: licensedUsers,
            meetings: meetings.flat(),
        },
    };
});
