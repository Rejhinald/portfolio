"use client";
import React, { useState, useRef, useEffect } from "react";
import { LayoutGrid } from "@/components/ui/layout-grid";

export function LayoutGridDemo() {
  return (
    <div className="h-screen py-20 w-full bg-slate-950">
      <LayoutGrid cards={cards} />
    </div>
  );
}

const SkeletonOne = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">House in the woods</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        A serene and tranquil retreat, this house in the woods offers a peaceful
        escape from the hustle and bustle of city life.
      </p>
    </div>
  );
};

const SkeletonTwo = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">House above the clouds</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Perched high above the world, this house offers breathtaking views and a
        unique living experience. It&apos;s a place where the sky meets home,
        and tranquility is a way of life.
      </p>
    </div>
  );
};

const SkeletonThree = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">Greens all over</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        A house surrounded by greenery and nature&apos;s beauty. It&apos;s the
        perfect place to relax, unwind, and enjoy life.
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
        A fourth year Computer Engineering student at Holy Angel University.
        I am 21 years old and I am from the Philippines.
      </p>
    </div>
  );
};

const SkeletonFive = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">House in the woods</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        A serene and tranquil retreat, this house in the woods offers a peaceful
        escape from the hustle and bustle of city life.
      </p>
    </div>
  );
};

const SkeletonSix = () => {
  return (
    <div>
      <p className="font-bold text-4xl text-white">House above the clouds</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Perched high above the world, this house offers breathtaking views and a
        unique living experience. It&apos;s a place where the sky meets home,
        and tranquility is a way of life.
      </p>
    </div>
  );
};

const SkeletonSeven = () => {
    return (
      <div>
        <p className="font-bold text-4xl text-white">House above the clouds</p>
        <p className="font-normal text-base text-white"></p>
        <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
          Perched high above the world, this house offers breathtaking views and a
          unique living experience. It&apos;s a place where the sky meets home,
          and tranquility is a way of life.
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
      "https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    content: <SkeletonTwo />,
    className: "col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1464457312035-3d7d0e0c058e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    content: <SkeletonThree />,
    className: "col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 4,
    content: <SkeletonFour />,
    className: "col-span-1",
    thumbnail:
      "https://lh3.googleusercontent.com/pw/AP1GczOxKDdW5sZg2Rnn16mJd-2gtyKepB4CPR7RDmPcaUDEhE6gH9jLJXMq3w02LviTNSv3L5-xqTlyYvJAvj3oyYAnSVDD-mmeA61wwDtry2nSyvP_CQKT0nj3PRRblIJT1aWnm-0GSMJDJsyVwi1NPy7bfv1dSZ_rzQ0uw_PEVh5-yO_ggn-PzoGg-CbftlhjiwbtETwFkw6HdoCxg5i-KzoPAAWr4ep4z9m3b_VCgY9Nfby9PiqDHjtmF_MJhI4Rs684IevgVSGjgBU64HdqEPColCvNaUf4w-amYsGtZMkQ6wSxqSaGlXsxEt8NkquGH4mH83pQwAGan-iT3geiczg3OHrpEo4q7xOwC5SIvwNVyLU0opwHTK0dZ1MTNliWsG5iveWGrMX_gwH6rWnYlMtHACDiwOebb4-pWOQzcl2bOlVYFaBUpuvEAk3XO7mZWLqOm3NmkZTd7GOYK0xwGSBIlDYH-aYv05RVv2id6KPPbDsPyo5lPwuoG4nqKnUDb8hiCuWagR7BG58TsbKyzrfAOsra8L4amZ4byQ0Kv5P_z3Kdp8SNqtcKrB6fwF_h3h0dOYVtYYWmc1yHYRpAppKTreHw1n6_rrcrhwSVVXyA1E4rM-9go8N-45bhmix9okE8PluTNbAtWS9onSI3-V8H6oRuvqW4rkNl2VhsvodLTenHNsYGhk2ojK80b7OqUP3ZI8-ncNXuyYbw_o6YIRlOR_F4-_UMw4p5-FoWWvhOoR074D_M96eHj1z0bsblH3w6h59qaX8gyeZUYVFkynSAPhQYN9anQ2Tzas48L7KiEQWlSck1BtFyoNUYt989HmCk9CbadrhevexF9nywPF7_AnOGe5mM64QxsE1yOZ16bqTBW5OhGQSk3RqaR3o2gvEsUOVeKTpHu-nM2Z2mRUHJQIT5z6maVQ-3Z93-Du5N2nk3KpKDjedMSlAN=w600-h400-s-no-gm?authuser=0",
  },
  {
    id: 5,
    content: <SkeletonFive />,
    className: "col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1475070929565-c985b496cb9f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 6,
    content: <SkeletonSix />,
    className: "col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 7,
    content: <SkeletonSeven />,
    className: "md:col-span-2",
    thumbnail:
      "https://images.unsplash.com/photo-1464457312035-3d7d0e0c058e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];
