import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AdminSettings from "@/components/Admin/Settings/AdminSettings";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const metadata: Metadata = {
    title:
        "ListAn Dashboard",
    description: "This is a management system or Company Users",
};

export default function Home() {
    return (
        <>
            <DefaultLayout>
                <Breadcrumb pageName="各種設定" />
                <AdminSettings />
            </DefaultLayout>
        </>
    );
}
