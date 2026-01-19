import { Metadata } from "next";
import ClientDefaultLayout from "@/components/Layouts/ClientDefaultLayout";
import FormLayout from "@/components/ContactInfo";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const metadata: Metadata = {
    title:
        "ListAn Dashboard",
    description: "This is a management system or Company Users",
};

export default function Home() {
    return (
        <>
            <ClientDefaultLayout>
                <Breadcrumb pageName="契約情報" />
                <FormLayout />
            </ClientDefaultLayout>
        </>
    );
}
