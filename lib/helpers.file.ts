import { ChangeEvent, useState } from "react";

export function useFileLoader(): [
  Map<string, string>,
  (e: ChangeEvent<HTMLInputElement>) => void,
  (key: string) => void
] {
  const [files, setFiles] = useState<Map<string, string>>(new Map());

  const showFile = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const reader = new FileReader();

    const file = e.target?.files?.[0];

    reader.onload = async (e) => {
      const text = e.target?.result as string | undefined;

      if (text && file?.name && file.size) {
        files.set(
          `${file.name} (${(file.size / 1024).toLocaleString()} KB)`,
          text
        );
        setFiles(new Map(files));
      }
    };

    if (file) reader.readAsText(file);
  };

  const removeFile = (key: string) => {
    files.delete(key);
    setFiles(new Map(files));
  };

  return [files, showFile, removeFile];
}
