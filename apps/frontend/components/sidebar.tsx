"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL } from "@/config";

export function Sidebar() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const response = await axios.get(`${BACKEND_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
        setProjects(data);
      } catch (err: any) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [getToken]);

  return (
    <div
      className="fixed top-0 left-0 h-full z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ width: open ? 224 : 8, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }}
    >
      
      <div className="absolute left-0 top-0 h-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200" style={{ width: 8, zIndex: 60 }} />
      
      {mounted && (
        <div
          className={`h-full bg-white shadow-lg border-r border-gray-200 flex flex-col absolute left-0 top-0 z-50 overflow-hidden transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ width: 224 }}
        >
          <div className="w-40 pl-4 pt-8 space-y-4">
            <h1 className="text-2xl font-bold">Pixel Pilot</h1>
            <div className="mt-6">
              <div className="text-xs text-gray-400 mb-2">Projects</div>
              {loading && <div className="text-xs text-gray-400">Loading...</div>}
              {error && <div className="text-xs text-red-400">{error}</div>}
              {!loading && !error && projects.length === 0 && (
                <div className="text-xs text-gray-400">No projects found</div>
              )}
              {!loading && !error && projects.map((project, idx) => (
                <div key={project.id || idx} className="truncate">
                  <Link href={`/project/${project.id}`} className="block text-gray-700 hover:text-blue-600 text-sm truncate">
                    {project.description || `Project ${project.id}`}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}