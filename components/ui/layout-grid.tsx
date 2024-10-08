"use client";
import React, { useState, useCallback } from "react";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { motion } from "framer-motion";

type Card = {
  id: number;
  content: JSX.Element | React.ReactNode | string;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);

  const handleClick = useCallback(
    (card: Card) => {
      setLastSelected(selected);
      setSelected(card);
    },
    [selected]
  );

  const handleOutsideClick = useCallback(() => {
    setLastSelected(selected);
    setSelected(null);
  }, [selected]);

  return (
    <div className="w-full h-full p-10 grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-4 relative">
      {cards.map((card, i) => (
        <div key={i} className={cn(card.className, "")}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              card.className,
              "relative overflow-hidden cursor-pointer", // Added cursor-pointer here
              selected?.id === card.id
                ? "rounded-lg absolute inset-0 h-1/2 w-full md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col bg-slate-950"
                : lastSelected?.id === card.id
                ? "z-40 bg-slate-950 rounded-xl h-full w-full"
                : "bg-slate-950 rounded-xl h-full w-full"
            )}
            layout
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.1 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            {selected?.id === card.id && <SelectedCardMemo selected={selected} />}
            <BlurImageMemo card={card} />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0 bg-transparent opacity-0 z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 0.3 : 0 }}
      />
    </div>
  );
};

const BlurImage = ({ card }: { card: Card }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      src={card.thumbnail}
      height={500}
      width={500}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={cn(
        "object-cover object-top absolute inset-0 h-full w-full transition duration-200",
        loaded ? "blur-none" : "blur-md"
      )}
      alt="thumbnail"
    />
  );
};

const SelectedCard = ({ selected }: { selected: Card | null }) => {
  return (
    <div className="bg-transparent h-full w-full max-w-full max-h-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative px-4 sm:px-6 md:px-8 pb-4 pt-2 z-[70] max-w-full max-h-full overflow-auto"
        style={{ transform: 'scale(calc(1 - (0.002 * (600 - min(600, 100vh)))))', transformOrigin: 'bottom center' }}
      >
        {selected?.content}
      </motion.div>
    </div>
  );
};

const BlurImageMemo = React.memo(BlurImage);
const SelectedCardMemo = React.memo(SelectedCard);
