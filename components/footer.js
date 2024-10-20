import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link
              href="https://www.dtu.dk/english/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/dtu.svg"
                alt="Logo"
                width={48}
                height={70}
                className="mr-3 cursor-pointer"
              />
            </Link>
            <span className="text-gray-600 font-semibold">
              Declare Repository
            </span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-600 mb-2">
              Support:{" "}
              <a
                href="mailto:bartoszxziolkowski@gmail.com"
                className="text-blue hover:text-indigo"
              >
                bartoszxziolkowski@gmail.com
              </a>
            </p>
            <Link
              href="https://github.com/bartosz-ziolkowski"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 text-sm hover:text-blue"
            >
              Created by{" "}
              <span className="font-semibold">
                Bartosz Ziolkowski (s230080)
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;