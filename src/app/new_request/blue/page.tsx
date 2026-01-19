import { Metadata } from "next";
import ClientDefaultLayout from "@/components/Layouts/ClientDefaultLayout";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import NewRequestBlue from "@/components/NewRequest/NewRequestBlue";

export const metadata: Metadata = {
    title:
        "ListAn Dashboard",
    description: "This is a management system or Company Users",
};

export default function Home() {
    return (
        <>
            <ClientDefaultLayout>
                <Breadcrumb pageName="新規依頼" />
                <NewRequestBlue />
            </ClientDefaultLayout>
        </>
    );
}
