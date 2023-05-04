import React, { useState, useEffect } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Spinner from "~/components/Spinner";
import crypto from "crypto";
import { z } from "zod";
import { createZodFetcher } from "zod-fetch";
const fetchWithZod = createZodFetcher();

const ResponseSchema = z.object({
  status: z.string(),
  count: z.string(),
  results: z.array(
    z.object({
      inscriptionnumber: z.string().nullable(),
    })
  ),
});
type ResponseType = z.infer<typeof ResponseSchema>;

const Loader = () => {
  return (
    <div className="flex items-center gap-x-2 rounded-full border border-indigo-100 bg-indigo-200/50 px-2.5 py-1.5 text-sm text-gray-100">
      <Spinner />
      <span>Searching</span>
    </div>
  );
};

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");
  const [response, setResponse] = useState<ResponseType | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (response) {
      setResponse(null);
    }
    const value = e.target.value.toLowerCase();
    const cleanedInput = value.replace(/[^a-z0-9_]/g, "");
    setInput(cleanedInput);
  };
  const handleSearch = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const hash = crypto.createHash("sha256").update(input).digest("hex");
      setHash(hash);
      const result = await fetchWithZod(
        // The schema you want to validate with
        ResponseSchema,
        // Any parameters you would usually pass to fetch
        `https://api2.ordinalsbot.com/search?hash=${hash}`
      );
      console.log("result", result.results);
      setLoading(false);
      setResponse(result);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ordinal Names</title>
        <meta name="description" content="Check your username" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center  bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <nav className="fixed left-0 right-0 top-0 flex h-[65px] w-full items-center bg-purple-700/40 px-4 backdrop-blur-md sm:px-10">
          <h2 className="text-lg font-semibold text-fuchsia-200">
            Ordinal Names Checker
          </h2>
        </nav>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 pt-24 sm:pt-36 ">
          <h1 className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Check your{" "}
            <span className="text-[hsl(280,100%,70%)]">Username</span>
          </h1>
          <div className="flex w-full max-w-lg flex-col items-center gap-y-5 sm:pt-10">
            <div className="flex items-center gap-x-4">
              <div className="w-full">
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-lg text-indigo-500 sm:text-xl">
                      @
                    </span>
                  </div>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    className="block w-full rounded-md border-0 border-red-300 bg-indigo-800/80 py-3.5 pl-10 pr-10 text-lg text-indigo-200 outline-none ring-1 ring-inset ring-[hsl(290,60%,50%)] placeholder:text-indigo-400 focus:ring-2 focus:ring-inset focus:ring-[hsl(290,60%,40%)] sm:py-5 sm:text-xl sm:leading-6"
                    placeholder="username"
                    onChange={(e) => handleChange(e)}
                    value={input}
                  />
                </div>
              </div>
              <button
                onClick={() => void handleSearch()}
                disabled={!input || loading}
                className="relative shrink-0 overflow-hidden rounded-md bg-fuchsia-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-fuchsia-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                Check
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-fuchsia-600">
                    <Spinner />
                  </div>
                )}
              </button>
            </div>
            {/* {loading && <Loader />} */}
            {!!response &&
              (parseInt(response.count) === 0 ? (
                <div className="mt-3 flex max-w-xs flex-col gap-2 rounded-xl bg-white/10 p-4 text-white">
                  <h3 className="text-xl font-bold">Available! 🎉</h3>
                  <p className="break-all text-sm text-fuchsia-500">
                    <span className="font-medium text-fuchsia-50">Hash: </span>
                    {hash}
                  </p>
                  <div className="mt-3 text-sm text-fuchsia-200">
                    <span className="font-medium text-fuchsia-50">Note:</span>{" "}
                    This name may be currently pending in the mempool. Proceed
                    with caution.
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex max-w-xs flex-col gap-2 rounded-xl bg-white/10 p-4 text-white">
                  <h3 className="text-xl font-bold">{`Already Inscribed ${
                    parseInt(response.count) === 1
                      ? "1 time"
                      : `${response.count} times`
                  }`}</h3>

                  <div className="text-sm">
                    {response.results.map((r, i) => {
                      return (
                        <div className="" key={i}>
                          {r.inscriptionnumber}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="flex max-w-xs flex-col gap-2 rounded-xl bg-white/10 p-4 text-white">
              <h3 className="text-xl font-bold">Format</h3>
              <div className="text-sm">
                Usernames follow the twitter conventions of allowing
                alphanumeric characters and underscores (_). For comparision
                sake, all names are hashed all all lowercase.
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto flex justify-center pb-10 font-normal text-white/60">
          Powered by{" "}
          <a
            href="https://ordinalsbot.com/"
            target="_blank"
            rel="nonreferrer"
            className="mx-1 hover:underline"
          >
            OrdinalsBot.com&apos;s
          </a>
          api
        </div>
      </main>
    </>
  );
};

export default Home;
