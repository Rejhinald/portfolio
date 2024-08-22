"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Boxes } from "@/components/ui/background-boxes";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { Mail } from "lucide-react";
import githubIcon from "@/components/images/icons/github-icon.svg";
import linkedinIcon from "@/components/images/icons/linkedin-icon.svg";
// ADDED VERCEL ENVIRONMENT VARIABLES
export function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setStatus("Sending...");

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.status === 200) {
        setFormData({ name: "", email: "", message: "" });
        setStatus("Message sent successfully!");
      } else {
        setStatus("Failed to send message. Please try again.");
      }
    } catch (error) {
      setStatus("Failed to send message. Please try again.");
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-gray-900 font-sans overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900 pt-5 md:pt-30 flex flex-col justify-center items-center transform scale-90 md:scale-100">
        <Boxes />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative z-20 flex flex-col items-center justify-center space-y-10 p-8 w-full"
        >
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
            <motion.a
              href="mailto:arwinmiclat@gmail.com"
              className="flex items-center justify-center p-6 bg-gray-800 rounded-md space-x-3 hover:bg-gray-700 md:col-span-2 shadow-lg"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Mail className="w-6 h-6 text-white" />
              <span className="text-white">arwinmiclat@gmail.com</span>
            </motion.a>
            <motion.a
              href="https://github.com/rejhinald"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-5 bg-gray-800 rounded-md space-y-3 hover:bg-gray-700 md:row-span-2 md:col-span-1 shadow-lg"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Image src={githubIcon} alt="GitHub" className="w-7 h-7" />
              <div className="text-center text-white pt-4">
                <h3 className="font-bold text-lg">GitHub Profile</h3>
                <p className="text-sm text-gray-400">Browse my repositories!</p>
              </div>
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/arwin-miclat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-6 bg-gray-800 rounded-md space-x-3 hover:bg-gray-700 md:col-span-2 shadow-lg"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Image src={linkedinIcon} alt="LinkedIn" className="w-6 h-6" />
              <span className="text-white">LinkedIn</span>
            </motion.a>
          </motion.div>

          <motion.div
            className="relative z-20 text-center text-white w-full max-w-4xl pt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
          >
            <h1 className={cn("md:text-4xl text-xl font-bold")}>
              Send me a message
            </h1>
            <p className="mt-2 text-neutral-300">
              Feel free to reach out to me using the form below.
            </p>
            <motion.form
              className="space-y-4 mt-6 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              onSubmit={handleSubmit}
            >
              <motion.div whileHover={{ scale: 1.05 }}>
                <label className="block text-left text-sm font-medium text-neutral-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full mt-1 p-3 rounded-md bg-gray-800 border-gray-600 text-white shadow-lg"
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <label className="block text-left text-sm font-medium text-neutral-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="w-full mt-1 p-3 rounded-md bg-gray-800 border-gray-600 text-white shadow-lg"
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <label className="block text-left text-sm font-medium text-neutral-300">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message here"
                  className="w-full mt-1 p-3 rounded-md bg-gray-800 border-gray-600 text-white resize-none shadow-lg"
                  rows={5}
                ></textarea>
              </motion.div>
              <motion.button
                type="submit"
                className="w-full p-3 bg-blue-600 rounded-md text-white hover:bg-blue-700 shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                Send Message
              </motion.button>
            </motion.form>
            {status && <p className="mt-4 text-white">{status}</p>}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
