import { useState, useEffect, useMemo } from "react";
import debounce from "lodash.debounce";

export function useOptimisticFile(fileId: string) {
  const [content, setContent] = useState("");
  const [version, setVersion] = useState<number>(0);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch file khi mount
  useEffect(() => {
    fetch(`/api/files/${fileId}`)
      .then((res) => res.json())
      .then((file) => {
        setContent(file.content);
        setVersion(file.version);
      });
  }, [fileId]);

  // Debounce save
  const saveFile = useMemo(() => {
  return debounce(async (newContent: string, currentVersion: number) => {
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent, version: currentVersion }),
      });

      if (res.status === 409) {
        // const data = await res.json();
        setError("Conflict detected");
        return;
      }

      const updated = await res.json();
      setVersion(updated.version);
      setIsDirty(false);
    } catch {
      setIsDirty(true);
    }
  }, 3000);
}, [fileId]);

  // Khi user gõ
  const updateContent = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
    saveFile(newContent, version);
  };

  return { content, updateContent, isDirty, error };
}
