import type { ReactElement } from "react";
import { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import Calendar from "../components/calendar";

import withAuth from "../utils/with-auth";
import { getLayout } from "../components/layout/dashboard";
import UIPage from "../components/ui/page";

export default function Page() {
    // As this page uses Server Side Rendering, the `session` will be already
    // populated on render without needing to go through a loading stage.
    // This is possible because of the shared context configured in `_app.js` that
    // is used by `useSession()`.
    const { data: session, status } = useSession();
    const loading = status === "loading";

    return (
        <UIPage>
            <UIPage.Body>
                <Calendar />
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
    return {
        props: {},
    };
});
