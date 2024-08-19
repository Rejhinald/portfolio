// @/components/data/data.tsx

import djangoIcon from "@/components/images/icons/django-icon.svg";
import javascriptIcon from "@/components/images/icons/javascript.svg";
import nextjsIcon from "@/components/images/icons/nextjs-icon.svg";
import postgresqlIcon from "@/components/images/icons/postgresql.svg";
import pythonIcon from "@/components/images/icons/python.svg";
import reactIcon from "@/components/images/icons/react.svg";
import shadcnIcon from "@/components/images/icons/shadcn-ui-seeklogo.svg";
import tailwindcssIcon from "@/components/images/icons/tailwindcss-icon.svg";
import typescriptIcon from "@/components/images/icons/typescript-icon.svg";
import facebookIcon from "@/components/images/icons/facebook.svg";
import githubIcon from "@/components/images/icons/github-icon.svg";
import linkedinIcon from "@/components/images/icons/linkedin-icon.svg";
import instagramIcon from "@/components/images/icons/instagram-icon.svg";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import React from "react";

export const technologyItems = [
  {
    id: 1,
    name: "JavaScript",
    designation: "Programming Language",
    image: javascriptIcon,
  },
  {
    id: 2,
    name: "TypeScript",
    designation: "Programming Language",
    image: typescriptIcon,
  },
  {
    id: 3,
    name: "React",
    designation: "JavaScript Library",
    image: reactIcon,
  },
  {
    id: 4,
    name: "Next.js",
    designation: "React Framework",
    image: nextjsIcon,
  },
  {
    id: 5,
    name: "shadcn",
    designation: "UI Library",
    image: shadcnIcon,
  },
  {
    id: 6,
    name: "Tailwind CSS",
    designation: "CSS Framework",
    image: tailwindcssIcon,
  },
  {
    id: 7,
    name: "Python",
    designation: "Programming Language",
    image: pythonIcon,
  },
  {
    id: 8,
    name: "PostgreSQL",
    designation: "Database",
    image: postgresqlIcon,
  },
  {
    id: 9,
    name: "Django",
    designation: "Web Framework",
    image: djangoIcon,
  },
];

export const socialItems = [
    {
      id: 1,
      name: "LinkedIn",
      designation: "Professional Network",
      image: linkedinIcon,
      url: "https://www.linkedin.com/in/arwin-miclat/",
    },
    {
      id: 2,
      name: "GitHub",
      designation: "Code Repository",
      image: githubIcon,
      url: "https://github.com/Rejhinald",
    },
    {
      id: 3,
      name: "Facebook",
      designation: "Social Media",
      image: facebookIcon,
      url: "https://www.facebook.com/Zeihji/",
    },
    {
      id: 4,
      name: "Instagram",
      designation: "Social Media",
      image: instagramIcon,
      url: "https://www.instagram.com/arwnmclt/",
    },
  ];
// Skeleton components
export const SkeletonOne = () => (
  <div>
    <p className="font-bold text-4xl text-white">Technologies</p>
    <p className="font-normal text-base text-white"></p>
    <p className="font-normal text-base my-4 max-w-lg text-neutral-200 pb-1">
      These are the technologies that I have used so far in my career.
    </p>
    <div className="flex flex-wrap gap-4 justify-around items-center">
        {technologyItems.map((item, index) => (
          <div key={index} className="p-1">
            <AnimatedTooltip items={[item]} />
          </div>
        ))}
    </div>
  </div>
);

export const SkeletonTwo = () => (
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

export const SkeletonThree = () => (
  <div>
    <p className="font-bold text-4xl text-white">Skills</p>
    <p className="font-normal text-base text-white"></p>
    <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
      As a BS Computer Engineering major, other than programming, I&apos;ve honed a diverse set of
      skills. In the technical realm, I excel in Routing and Switching, Logic
      Circuits and Design, Computer Building, and 3D Printing. My creative side
      shines through Graphic Designing, where I craft visually appealing
      solutions. On a personal level, I possess strong Analytical Skills,
      thrive on Problem Solving, and am a quick and eager learner.
    </p>
  </div>
);

export const SkeletonFour = () => (
    <div>
      <p className="font-bold text-4xl text-white">Arwin Miclat</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
      Hi, I&apos;m Arwin Miclat, a dedicated Computer Engineering student with a passion for technology. I&apos;m driven by a love for learning and a commitment to seeing things through. I&apos;m a fast learner, always eager to embrace new ideas and solve problems. I approach challenges with a positive attitude and a strong work ethic, ensuring that I give my best in everything I do.
      </p>
      <p className="font-bold text-base text-white">Socials</p>
      <div className="flex flex-wrap gap-1 justify-around items-center">
        {socialItems.map((item, index) => (
          <a
            key={index}
            href={item.url} // Adding the URL here
            target="_blank" // Opens the link in a new tab
            rel="noopener noreferrer" // Security measure to prevent access to window.opener
            className="p-5"
          >
            <AnimatedTooltip items={[item]} />
          </a>
        ))}
      </div>
    </div>
  );

export const SkeletonFive = () => (
  <div>
    <p className="font-bold text-4xl text-white">Work Experience</p>
    <p className="font-normal text-base text-white"></p>
    <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
      <p className="font-bold">Holy Angel University</p>Student Assistant{" "}
      <br />
      <span className="text-neutral-300"> July 2023 – November 2024</span>
      <br />
      <br />
      <p className="font-bold">Ninjafox Engineering</p> Product Assistant - R&D,
      3D Printing, E-Commerce Website (Shopify) <br />
      <span className="text-neutral-300"> June 2022 – April 2023</span>
      <br />
    </p>
  </div>
);

export const SkeletonSix = () => (
  <div>
    <p className="font-bold text-4xl text-white">Certifications</p>
    <p className="font-normal text-base text-white"></p>
    <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
      <br />
      <p className="font-bold">CompTIA IT Fundamentals (ITF+)</p>
      <span className="text-neutral-300">November 24, 2023</span>
      <br />
      <br />
      <p className="font-bold">
        CCNAv7: Enterprise Networking, Security, and Automation
      </p>
      <span className="text-neutral-300">August 08, 2023</span>
    </p>
  </div>
);

export const SkeletonSeven = () => (
  <div>
    <p className="font-bold text-4xl text-white">Education</p>
    <p className="font-normal text-base text-white"></p>
    <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
      <p className="font-bold">Holy Angel University</p>
      1 Holy Angel St, Angeles, 2009 Pampanga
      <br />
      <br />
      <p className="font-bold">
        Bachelor of Science in Computer Engineering
      </p>{" "}
      2021 - 2025
    </p>
  </div>
);

export const cards = [
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
