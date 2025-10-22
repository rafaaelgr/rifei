"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RifaPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        if (!id) return;

        router.push(`/${id}`);
    }, [id, router]);

    return (<></>);
}