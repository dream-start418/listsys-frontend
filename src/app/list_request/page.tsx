import { Metadata } from "next";
import ClientDefaultLayout from "@/components/Layouts/ClientDefaultLayout";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ListRequestTable from "@/components/ListRequest/ListRequestTable";

export const metadata: Metadata = {
    title:
        "ListAn Dashboard",
    description: "This is a management system or Company Users",
};

export default function Home() {
    return (
        <>
            <ClientDefaultLayout>
                <Breadcrumb pageName="リスト依頼" />
                <ListRequestTable />
            </ClientDefaultLayout>
        </>
    );
}
