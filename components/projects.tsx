// components/ProjectsDemo.js

// TO DO: LOOPING VIDEOS, ADDING VIDEOS (RECORD), ADD ACTUAL PROJECTS, ADD MORE GIMMICKS (ANIMATED SCROLL FROM ACETERNITY),  fix weird bug on google.


"use client";
import { motion } from "framer-motion";
import { FaGithub, FaLink } from "react-icons/fa";

const projects = [
  {
    id: 1,
    title: "Shadcn Landing Page",
    description:
      "Landing page with essential sections to promote a particular product, service, event, or offer. It is fully responsive, customizable, has dark mode, meta tags and user-friendly interface.",
    techStack: ["React", "TypeScript", "Shadcn", "Tailwind"],
    liveLink: "#",
    githubLink: "#",
    videoSrc: "https://www.youtube.com/embed/bKXlBtf8m7A?autoplay=1",
  },
  {
    id: 2,
    title: "Magenta Kitchen",
    description:
      "Restaurant menu created with the purpose to have an elegant digital menu, with the capability to use it with QR code and show the elemental restaurant information and all the dishes available.",
    techStack: ["React", "Next.js", "CSS Modules", "Antd"],
    liveLink: "#",
    githubLink: "#",
    videoSrc: "https://www.youtube.com/embed/bKXlBtf8m7A?autoplay=1",
  },
  {
    id: 3,
    title: "Magenta Kitchen",
    description:
      "Restaurant menu created with the purpose to have an elegant digital menu, with the capability to use it with QR code and show the elemental restaurant information and all the dishes available.",
    techStack: ["React", "Next.js", "CSS Modules", "Antd"],
    liveLink: "#",
    githubLink: "#",
    videoSrc: "https://www.youtube.com/embed/bKXlBtf8m7A?autoplay=1",
  },
];

const fadeInFromLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export function ProjectsDemo() {
  return (
    <section className="bg-gray-900 text-white min-h-screen py-12 px-4">
      <div className="container max-w-screen-lg mx-auto pt-24 space-y-8">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="grid grid-cols-1 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInFromLeft}
          >
            {/* Video Placeholder */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative bg-gray-800 rounded-lg overflow-hidden h-[400px] md:h-[500px] lg:h-[600px]"
            >
              <iframe
                src={project.videoSrc}
                title={project.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>

            {/* Project Details */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col"
            >
              <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
              <p className="text-gray-400 mb-4">
                {project.description ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam."}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <motion.a
                  href={project.liveLink}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "#4ADE80",
                    color: "#1F2937",
                  }}
                  className="bg-gray-700 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center"
                >
                  <FaLink className="text-3xl" />
                </motion.a>
                <motion.a
                  href={project.githubLink}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "#60A5FA",
                    color: "#1F2937",
                  }}
                  className="bg-gray-700 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center"
                >
                  <FaGithub className="text-3xl" />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
