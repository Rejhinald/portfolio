"use client";
import { motion } from "framer-motion";
import { FaGithub, FaLink } from "react-icons/fa";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TracingBeam } from "@/components/ui/tracing-beam";

const projects = [
  {
    id: 1,
    title: "Delivio",
    description:
      "Delivio is a revolutionary web application designed to empower freelance truckers and businesses to connect and manage freight deliveries seamlessly. Built with cutting-edge technologies like Next.js for a smooth user experience and Supabase for a robust and scalable database, Delivio offers a one-stop solution for streamlining the freight delivery.",
    techStack: ["NextJS", "TypeScript", "Shadcn", "Tailwind", "Supabase", "2024"],
    liveLink: "https://delivio-web.vercel.app/",
    githubLink: "https://github.com/naigggs/delivio-web",
    videoSrc: "https://www.youtube.com/embed/5vGs2aWqKrI?autoplay=1&version=3&loop=1&playlist=5vGs2aWqKrI",
  },
  {
    id: 2,
    title: "Poem.io",
    description:
      "Gemini API AI Poem generator that includes the mood of the poem being generated. Made with NextJS, Material UI, Python, and TailwindCSS",
    techStack: ["NextJS", "Tailwind CSS", "Material UI", "Python", "2024"],
    liveLink: "#",
    githubLink: "https://github.com/Rejhinald/poem.io",
    videoSrc: "https://www.youtube.com/embed/LRmx_WcMLbA?autoplay=1&version=3&loop=1&playlist=LRmx_WcMLbA",
  },
  {
    id: 3,
    title: "Spotify Clone",
    description:
      "A Spotify clone built with Django, featuring user authentication, playlist creation, and music streaming. The interface is crafted using HTML/CSS, offering a seamless music experience with Django-powered backend functionality.",
    techStack: ["Python", "Django", "CSS", "HTML", "2023"],
    liveLink: "#",
    githubLink: "#",
    videoSrc: "https://www.youtube.com/embed/ohxN__j_FE8?autoplay=1&version=3&loop=1&playlist=ohxN__j_FE8",
  },
  {
    id: 4,
    title: "Hotel Management System",
    description:
      "A Hotel Management System built with Django, featuring user authentication, Booking, Active Bookings, Approve payments, and Admin Panels. The interface is crafted using HTML/CSS, offering a seamless music experience with Django-powered backend functionality.",
    techStack: ["Python", "Django", "CSS", "HTML", "2023"],
    liveLink: "#",
    githubLink: "#",
    videoSrc: "https://www.youtube.com/embed/Is2sRA3_Tp4?autoplay=1&version=3&loop=1&playlist=Is2sRA3_Tp4",
  },
  {
    id: 5,
    title: "San Luis Tourism",
    description:
      "This HTML, CSS page is created under the SOFTDEV1 subject as a 3rd year Computer Engineering Student. This page showcases the possible tourism spots in San Luis, Pampanga, Philippines.",
    techStack: ["HTML", "CSS", "2023"],
    liveLink: "https://rejhinald.github.io/sanluistourism/",
    githubLink: "https://github.com/Rejhinald/sanluistourism",
    videoSrc: "https://www.youtube.com/embed/a8ye7j-tTkY?autoplay=1&version=3&loop=1&playlist=a8ye7j-tTkY",
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
    <section className="relative min-h-screen py-12 px-4 bg-gray-900">
      {/* BackgroundBeams with bg-gray-900 */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <BackgroundBeams />
      </div>

      {/* TracingBeam Component */}
      <TracingBeam />

      <div className="relative z-10 container max-w-screen-lg mx-auto pt-24 space-y-8 text-white">
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
              <h3 className="text-2xl font-bold mb-2 text-white">
                {project.title}
              </h3>
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
