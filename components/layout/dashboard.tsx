import Meta, { MetaProps } from "../ui/meta";
import React from "react";
import Nav from "../ui/nav";

type Props = {
    meta?: MetaProps;
    background?: string;
};

const Dashboard: React.FC<Props> = ({ children, meta = {}, background = "bg-white", ..._props }) => (
    <>
        <Meta {...meta} />
        <div className={`relative min-h-screen ${background}`}>
            <Nav />
            {children}
        </div>
    </>
);

export default Dashboard;

export const getLayout = (page: any, props: any) => <Dashboard {...props}>{page}</Dashboard>;
