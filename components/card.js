"use client";

import Image from "next/image";
import Link from "next/link";

const Card = ({ title, description, src, url, btn, color, i, new_tab }) => {
  return (
    <div className="h-screen flex items-center justify-center sticky top-0 ">
      <div
        className="flex flex-col relative h-[500px] w-[1000px] rounded-[25px] p-[50px] transform-gpu origin-top"
        style={{ backgroundColor: color, top: `calc( 10vh + ${i * 25}px)` }}
      >
        <h2 className="text-center m-0 text-[28px]">{title}</h2>
        <div className="flex h-full mt-[50px] gap-[50px]">
          <div className="w-[40%] relative top-[4%]">
            {btn != "" ? (
              <span className="flex items-center gap-[5px] mb-4">
                <Link
                  href={`${url}`}
                  target={`${new_tab ? "_blank" : ""}`}
                  className="flex items-center text-sm text-white bg-blue px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 cursor-pointer"
                >
                  {btn}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-white ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </span>
            ) : null}
            <p className="text-lg leading-relaxed text-gray-800 break-words">
              {description}
            </p>
          </div>
          <div className="relative w-[60%] h-full rounded-[25px] overflow-hidden">
            <div className="w-full h-full">
              <Image
                fill
                src={`/images/${src}`}
                alt="image"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
