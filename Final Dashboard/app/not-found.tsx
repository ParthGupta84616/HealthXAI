import Head from "next/head";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://cdn.materialdesignicons.com/6.5.95/css/materialdesignicons.min.css" />
      </Head>

      <div className="flex items-center justify-center min-h-screen bg-white py-48">
        <div className="flex flex-col">
          <div className="flex flex-col items-center">
            <div className="text-indigo-500 font-bold text-7xl">
              404
            </div>

            <div className="font-bold text-3xl xl:text-7xl lg:text-6xl md:text-5xl mt-10">
              This page does not exist
            </div>

            <div className="text-gray-400 font-medium text-sm md:text-xl lg:text-2xl mt-8">
              The page you are looking for could not be found.
            </div>
            <Link href={"/profile"}>
            <button className="bg-red-500  hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4">Home</button>
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
