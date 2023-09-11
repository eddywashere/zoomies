import zoomApi from "zoomapi";

export const client = zoomApi({
    accountId: process.env.ZOOM_ACCOUNT_ID || "MISSING",
    oauthClientId: process.env.ZOOM_CLIENT_ID || "MISSING",
    oauthClientSecret: process.env.ZOOM_CLIENT_SECRET || "MISSING",
});

export default client;
