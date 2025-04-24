import { Metadata } from "next";
import ClientDefaultLayout from "@/components/Layouts/ClientDefaultLayout";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ChangeRequestPink from "@/components/NewRequest/ChangeRequestPink";

export const metadata: Metadata = {
    title:
        "ListAn Dashboard",
    description: "This is a management system or Company Users",
};

export default function Home() {
    return (
        <>
            <ClientDefaultLayout>
                <Breadcrumb pageName="変更" />
                <ChangeRequestPink />
            </ClientDefaultLayout>
        </>
    );
}
