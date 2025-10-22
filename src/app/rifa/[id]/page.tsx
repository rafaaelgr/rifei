"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RifaPage() {
    const router = useRouter();
    useEffect(() => {
        router.push(`/12`);
    }, []);

    return (<></>);
}