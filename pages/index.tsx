import Link from "next/link";

export default function Home() {
  return (
    <div className="container pt-8 space-y-4">
      <h2>ODX Tools</h2>
      <p>This repo includes tools for manipulating ODX vehicle data</p>
      <ul className="list-inside list-disc space-y-3">
        <li className="space-y-2">
          <h5 className="font-semibold inline-block">
            <Link href="/odx-merger">ODX Merger</Link>
          </h5>
          <p className="pl-6">
            This tool merges multiple EV ODX to one EV, a comon use case is when
            the tool you use to generate odx data errors and ouptuts the result
            into multiple `.odx` files, you can use this tool to merge them
            together.
          </p>
        </li>
      </ul>
    </div>
  );
}
