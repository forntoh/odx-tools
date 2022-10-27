import { XCircleIcon } from "@heroicons/react/24/solid";
import { saveAs } from "file-saver";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useFileLoader } from "../lib/helpers.file";
import { useODXMerger } from "../lib/odx-merger";

const Home: NextPage = () => {
  const [files, loadFile, removeFile] = useFileLoader();
  const [longName, setLongName] = useState("Steering_Assist_BAS_GEN2_MQB41");

  const [result, fileName, mergeFile, clearResult] = useODXMerger();

  useEffect(() => {
    clearResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const downloadMergeResult = () => {
    var blob = new Blob([result], {
      type: "application/ODX;charset=utf-8",
    });
    saveAs(blob, fileName + ".odx");
  };

  return (
    <div className="container flex flex-col gap-6 py-8">
      <Head>
        <title>ODX EV Merger</title>
      </Head>
      <h2>ODX EV Merger</h2>
      <div>
        <label
          className="block mb-2 text-sm font-medium text-gray-900"
          htmlFor="file_input"
        >
          Upload file
        </label>
        <input
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer file:bg-gray-300 file:border-none file:py-1 file:px-4 file:mr-4 focus:ring-transparent"
          id="file_input"
          type="file"
          accept=".odx"
          onChange={loadFile}
        />
      </div>

      <div>
        <label
          className="block mb-2 text-sm font-medium text-gray-900"
          htmlFor="LONG-NAME"
        >
          Long name
        </label>
        <input
          id="LONG-NAME"
          type="text"
          name="LONG-NAME"
          className="bg-gray-50 rounded-lg border border-gray-300 text-sm py-1 w-full"
          placeholder="LONG-NAME"
          defaultValue={longName}
          onChange={(e) => {
            setLongName(e.target.value);
          }}
        />
      </div>

      <div className="rounded px-4 py-5 border flex flex-col gap-2">
        {Array.from(files.keys()).map((key, i) => (
          <div
            className="rounded border-2 border-sky-200 font-semibold px-4 py-1 bg-sky-50 flex justify-between"
            key={key}
          >
            {key}
            <XCircleIcon
              className="w-6 h-6 text-red-500 inline-block cursor-pointer"
              onClick={() => removeFile(key)}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-12">
        <button
          className="bg-sky-500 shadow-sky-800/20"
          onClick={() => {
            mergeFile(files, longName);
          }}
          disabled={
            files.size <= 1 ||
            result.trim().length > 0 ||
            longName.trim().length <= 3
          }
        >
          Merge
        </button>
        <button
          disabled={result.trim().length <= 0}
          onClick={downloadMergeResult}
          className="bg-emerald-500 shadow-emerald-800/20"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default Home;
