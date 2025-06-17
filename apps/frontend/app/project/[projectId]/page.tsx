"use client";
import { useParams } from "next/navigation";

export default function ProjectPage() {
    const {projectId} = useParams();
    return (
        <div>
            <h1>Project {projectId}</h1>
        </div>
    )
}