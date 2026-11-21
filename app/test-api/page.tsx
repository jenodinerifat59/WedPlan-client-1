
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TestAPI() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Backend Connection</h1>

      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
