import zoomApi from "zoomapi";

const client = zoomApi({
    apiKey: process.env.ZOOM_CLIENT_ID || "",
    apiSecret: process.env.ZOOM_CLIENT_SECRET || "",
});

export default client;
