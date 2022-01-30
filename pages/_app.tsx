import "../styles/globals.css";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import type { ReactElement, ReactNode } from "react";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export default function Application({ Component, pageProps }: AppPropsWithLayout) {
    // Use the layout defined at the page level, if available
    const getLayout = Component.getLayout ?? ((page) => page);

    return (
        <SessionProvider
            // Provider options are not required but can be useful in situations where
            // you have a short session maxAge time. Shown here with default values.
            session={pageProps.session}>
            <Toaster />
            {getLayout(<Component {...pageProps} />)}
        </SessionProvider>
    );
}
