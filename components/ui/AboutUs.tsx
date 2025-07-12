"use client";

// import { useState } from "react";
import {
  Hospital,
  ShieldCheck,
  Users,
  Brain,
  Newspaper,
//   Linkedin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const AboutUs = () => {
  return (
    <div className="fixed md:static top-0 right-0 z-50 h-full w-full md:w-[calc(100%-260px)] bg-white/90 dark:bg-[#1c1c1c]/90 backdrop-blur-xl rounded-none md:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 overflow-y-auto no-scrollbar transition-all duration-300">

      {/* Close Button */}
      {/* <div className="flex justify-end">
        <button onClick={onClose} className="text-gray-700 dark:text-gray-300 hover:text-red-500">
          <X className="w-6 h-6" />
        </button>
      </div> */}

      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          About ArogyaCompass
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
          ArogyaCompass is a modern healthcare platform built to transform the healthcare landscape of India. By streamlining communication between patients and hospitals, it bridges accessibility gaps and powers faster, organized, and reliable care delivery across the country.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Each Feature */}
        {[
          {
            icon: <ShieldCheck className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
            title: "Empowering Indian Healthcare",
            desc: "Bringing digital transformation to every tier of Indian healthcare—from rural PHCs to metropolitan super-specialty hospitals.",
          },
          {
            icon: <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
            title: "Organizing Patient Journeys",
            desc: "Helps patients discover, book, navigate, and manage healthcare appointments with ease, reducing wait times and inefficiencies.",
          },
          {
            icon: <Hospital className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
            title: "Enabling Hospitals to Scale",
            desc: "With real-time dashboards, staff workflows, verification, and map routing, hospitals can scale operations with clarity and control.",
          },
          {
            icon: <Brain className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
            title: "Smart Technology, Real Impact",
            desc: "Integrates AI routing, geolocation, assistant coordination, and digital records—all in a beautifully simple user interface.",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 bg-white dark:bg-[#2b2b2b] rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            {item.icon}
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* News + Relevance Section */}
      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <Newspaper className="w-6 h-6" />
          Why India Needs ArogyaCompass
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm sm:text-base space-y-2">
          <li>
            <strong>Rural Disparity:</strong> 70% of India’s population lives in rural areas but 80% of doctors are based in urban zones. ArogyaCompass bridges this divide digitally.
          </li>
          <li>
            <strong>Ayushman Bharat (PMJAY):</strong> With over 50 crore beneficiaries, hospitals need streamlined tech infrastructure to manage universal health coverage.
          </li>
          <li>
            <strong>NEET Admissions Surge:</strong> Record medical seat allocations demand better digital systems for internship, hospital deployment, and assistant coordination.
          </li>
          <li>
            <strong>Time-Sensitive Care:</strong> Delays in appointment booking or finding nearby labs/tests can be fatal. ArogyaCompass maps and routes patients quickly.
          </li>
        </ul>
      </div>

      {/* Founder Section */}
      <div className="mt-10 border-t border-gray-300 dark:border-gray-600 pt-6">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">Meet the Founder</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Image
            src="/assets/profile/aryaman.jpg"
            alt="Aryaman"
            width={90}
            height={90}
            className="rounded-full border-2 border-blue-400 shadow-md object-cover"
          />
          <div className="text-center sm:text-left">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              Aryaman
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Founder & CEO, ArogyaCompass<br />
              B.Tech CSE, GLA University (3rd Year) <br />
              V Scholar, IIT Gandhinagar
            </p>
            <Link
              href="https://www.linkedin.com/in/aryaman-ba8765281"
              target="_blank"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 mt-2 text-sm hover:underline"
            >
              {/* <Linkedin className="w-4 h-4" /> */}
              LinkedIn Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
