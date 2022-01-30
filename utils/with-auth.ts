import { getSession } from "next-auth/react";
import { GetServerSidePropsContext, GetServerSideProps } from "next";

export default function withAuth(getServerSidePropsFunc: GetServerSideProps<any>) {
    return async (ctx: GetServerSidePropsContext) => {
        let session;
        try {
            session = await getSession(ctx);
        } catch {
            session = null;
        }
        if (!session) {
            return {
                redirect: {
                    destination: `/api/auth/signin?callbackUrl=${encodeURIComponent(ctx.resolvedUrl)}`,
                    permanent: false,
                },
            };
        }

        if (getServerSidePropsFunc) {
            const { props = {}, ...attrs } = ((await getServerSidePropsFunc(ctx)) || {}) as any;
            return {
                props: {
                    session,
                    ...props,
                },
                ...attrs,
            };
        }
        return {
            props: {
                session,
            },
        };
    };
}
