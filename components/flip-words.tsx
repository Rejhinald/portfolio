import React, { useState } from "react";
import { FlipWords } from "./ui/flip-words";

export function FlipWordsDemo() {
  const words = ["student", "programmer", "achiever", "explorer"];
  const name = "Arwin Miclat";
  const [article, setArticle] = useState("a");

  return (
    <div>
      <div className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-3xl font-medium tracking-tight text-transparent md:text-7xl">
        I am {name}, <br />
        I am {article}<FlipWords words={words} setArticle={setArticle} />
      </div>
    </div>
  );
}
