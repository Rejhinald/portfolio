"use client";
import React, { useState, useRef, useEffect } from "react";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Image from "next/image";
import djangoIcon from "@/components/images/icons/django-icon.svg";
import javascriptIcon from "@/components/images/icons/javascript.svg";
import nextjsIcon from "@/components/images/icons/nextjs-icon.svg";
import postgresqlIcon from "@/components/images/icons/postgresql.svg";
import pythonIcon from "@/components/images/icons/python.svg";
import reactIcon from "@/components/images/icons/react.svg";
import shadcnIcon from "@/components/images/icons/shadcn-ui-seeklogo.svg";
import tailwindcssIcon from "@/components/images/icons/tailwindcss-icon.svg";
import typescriptIcon from "@/components/images/icons/typescript-icon.svg";

// TO DO: DIRECTION AWARE HOVER ON IMAGES, THEN ANIMATED TOOLTIPS TO ICONS

export function LayoutGridDemo() {
  return (
    <div className="h-screen py-20 w-full bg-slate-950 relative z-10">
      <LayoutGrid cards={cards} />
      <div className="absolute inset-0 -z-10">
        <BackgroundBeams />
      </div>
    </div>
  );
}

const SkeletonOne = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">Technologies</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200 pb-5">
        These are the technologies that I have used so far in my career.
      </p>
      <div className="flex flex-wrap gap-10 justify-center items-center">
        <div className="relative group">
          <Image
            src={javascriptIcon}
            alt="JavaScript Icon"
            width={50}
            height={50}
            className="shadow-md"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
            JavaScript
          </div>
        </div>
        <div className="relative group">
          <Image
            src={typescriptIcon}
            alt="TypeScript Icon"
            width={50}
            height={50}
            className="shadow-md"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
            TypeScript
          </div>
        </div>
        <div className="relative group">
          <Image
            src={reactIcon}
            alt="React Icon"
            width={50}
            height={50}
            className="shadow-md"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
            React
          </div>
        </div>
        <div className="relative group">
          <Image
            src={nextjsIcon}
            alt="Next.js Icon"
            width={50}
            height={50}
            className="shadow-md"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
            Next.js
          </div>
        </div>
        <div className="relative group">
          <Image
            src={shadcnIcon}
            alt="shadcn Icon"
            width={50}
            height={50}
            className="shadow-md"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
            shadcn
          </div>
        </div>
        <div className="relative group">
          <Image
            src={tailwindcssIcon}
            alt="Tailwind CSS Icon"
            width={50}
            height={50}
            className="shadow-md"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
            Tailwind CSS
          </div>
        </div>
        <div className="relative group">
          <Image
            src={pythonIcon}
            alt="Python Icon"
            width={50}
            height={50}
            className="shadow-md"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
            Python
          </div>
        </div>
        <div className="relative group">
          <Image
            src={postgresqlIcon}
            alt="PostgreSQL Icon"
            width={50}
            height={50}
            className="shadow-md"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
            PostgreSQL
          </div>
        </div>
        <div className="relative group">
          <Image
            src={djangoIcon}
            alt="Django Icon"
            width={50}
            height={50}
            className="shadow-md"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
            Django
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonTwo = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">Hobbies</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        I have quite a diverse range of interests! Exploring technology keeps me
        up-to-date with the latest advancements, and there&apos;s nothing like
        listening to music for a soothing escape. When I&apos;m in the mood for
        excitement, playing video games offers an immersive experience.
      </p>
    </div>
  );
};

const SkeletonThree = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">Skills</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        As a BS Computer Engineering major, I&apos;ve honed a diverse set of
        skills. In the technical realm, I excel in Routing and Switching, Logic
        Circuits and Design, Computer Building, and 3D Printing. My creative
        side shines through Graphic Designing, where I craft visually appealing
        solutions. On a personal level, I possess strong Analytical Skills,
        thrive on Problem Solving, and am a quick and eager learner.
      </p>
    </div>
  );
};

const SkeletonFour = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">Arwin Miclat</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        A fourth year Computer Engineering student at Holy Angel University. I
        am 21 years old and I am from the Philippines.
      </p>
    </div>
  );
};

const SkeletonFive = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">Work Experience</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        <p className="font-bold">Holy Angel University</p>Student Assistant <br />
        <span className="text-neutral-300"> July 2023 – November 2024</span>
        <br /> 
        <br />
        <p className="font-bold">Ninjafox Engineering</p> Product Assistant - R&D, 3D Printing, E-Commerce
        Website (Shopify) <br />
        <span className="text-neutral-300"> June 2022 – April 2023</span>
        <br />
      </p>
    </div>
  );
};

const SkeletonSix = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">Certifications</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        <br />
        <p className="font-bold">CompTIA IT Fundamentals (ITF+){" "}</p>
        <span className="text-neutral-300">November 24, 2023</span>
        <br /><br/>
        <p className="font-bold">CCNAv7: Enterprise Networking, Security, and Automation{" "}</p>
        <span className="text-neutral-300">August 08, 2023</span>
      </p>
    </div>
  );
};

const SkeletonSeven = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">Education</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
      <p className="font-bold">Holy Angel University</p>
        1 Holy Angel St, Angeles, 2009 Pampanga
        <br /><br />
        <p className="font-bold">Bachelor of Science in Computer Engineering</p> 2021 - 2025
      </p>
    </div>
  );
};

const cards = [
  {
    id: 1,
    content: <SkeletonOne />,
    className: "md:col-span-2",
    thumbnail:
      "https://i.ibb.co/gMxX8Qm/How-to-Choose-the-Right-Programming-Language-for-a-New-Project.jpg",
  },
  {
    id: 2,
    content: <SkeletonTwo />,
    className: "col-span-1",
    thumbnail: "https://i.ibb.co/0ZZ6TFV/istockphoto-1346129679-612x612.jpg",
  },
  {
    id: 3,
    content: <SkeletonThree />,
    className: "col-span-1",
    thumbnail: "https://i.ibb.co/vvgPVTW/istockphoto-1490859962-612x612.jpg",
  },
  {
    id: 4,
    content: <SkeletonFour />,
    className: "col-span-1",
    thumbnail: "https://i.ibb.co/f4qxMXD/Untitled-design-1.png",
  },
  {
    id: 5,
    content: <SkeletonFive />,
    className: "col-span-1",
    thumbnail:
      "https://i.ibb.co/8BFXgZk/workplace-with-laptop-cup-coffee-smartphone-table-office.jpg",
  },
  {
    id: 6,
    content: <SkeletonSix />,
    className: "col-span-1",
    thumbnail:
      "https://i.ibb.co/p2HtwWY/businessman-take-assessment-certificate-questionnaire-600nw-2245618595.jpg",
  },
  {
    id: 7,
    content: <SkeletonSeven />,
    className: "md:col-span-2",
    thumbnail:
      "https://i.ibb.co/pn95nkf/Holy-Angel-University-Main-Building-Santo-Rosario-Angeles-Pampanga-05-27-2023.jpg",
  },
];
