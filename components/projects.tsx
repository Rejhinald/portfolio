// components/ProjectsDemo.js
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
    videoSrc: "https://www.youtube.com/embed/bKXlBtf8m7A",
  },
  {
    id: 2,
    title: "Magenta Kitchen",
    description:
      "Restaurant menu created with the purpose to have an elegant digital menu, with the capability to use it with QR code and show the elemental restaurant information and all the dishes available.",
    techStack: ["React", "Next.js", "CSS Modules", "Antd"],
    liveLink: "#",
    githubLink: "#",
    videoSrc: "https://www.youtube.com/embed/bKXlBtf8m7A",
  },
];

export function ProjectsDemo() {
  return (
    <section className="bg-gray-900 text-white min-h-screen py-12 px-4">
      <div className="container mx-auto grid md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video Placeholder */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative bg-gray-800 rounded-lg overflow-hidden h-[400px] md:h-[500px] lg:h-[600px]"
            >
              <iframe
                src={project.videoSrc}
                title={project.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>

            {/* Project Details */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 rounded-lg p-6 shadow-lg h-[400px] md:h-[500px] lg:h-[600px] flex flex-col"
            >
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
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
              </div>
              <div className="flex gap-4 mt-auto">
                <a
                  href={project.liveLink}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                  <FaLink className="text-xl" />
                  <span>Live Demo</span>
                </a>
                <a
                  href={project.githubLink}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                  <FaGithub className="text-xl" />
                  <span>GitHub</span>
                </a>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
