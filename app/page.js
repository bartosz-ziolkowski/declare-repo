"use client";

import { useEffect, useRef } from "react";

import Card from "../components/card";
import Lenis from "@studio-freight/lenis";
import { ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import { projects } from "@/utils/data/homeData";
import { useScroll } from "framer-motion";

export default function Home() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const firstText = useRef(null);
  const secondText = useRef(null);
  const slider = useRef(null);
  let xPercent = 0;

  const animate = () => {
    if (xPercent > 0) {
      xPercent = -100;
    }

    gsap.set(firstText.current, { xPercent: xPercent });

    gsap.set(secondText.current, { xPercent: xPercent });

    requestAnimationFrame(animate);

    xPercent += 0.1;
  };

  useEffect(() => {
    const lenis = new Lenis();
    gsap.registerPlugin(ScrollTrigger);

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    gsap.set(secondText.current, {
      left: secondText.current.getBoundingClientRect().width,
    });

    requestAnimationFrame(animate);

    requestAnimationFrame(raf, animate);
  }, []);

  return (
    <>
      <div className="fixed md:top-[8%] 2xl:top-[-5%]">
        <div ref={slider} className="relative whitespace-nowrap">
          <p
            ref={firstText}
            className="relative m-0 text-black text-[100px] 2xl:text-[230px] font-medium pr-[50px]"
          >
            Declare Models - Repository -
          </p>
          <p
            ref={secondText}
            className="absolute left-full top-0 m-0 text-black text-[100px] 2xl:text-[230px] font-medium pr-[50px]"
          >
            Declare Models - Repository -
          </p>
        </div>
      </div>
      <div
        ref={container}
        className="relative flex flex-col items-center justify-items-center pb-28 md:pt-[16%] xl:pt-0 "
      >
        {projects.map((project, i) => {
          const targetScale = 1 - (projects.length - i) * 0.5;
          return (
            <Card
              key={`p_${i}`}
              i={i}
              {...project}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </div>
    </>
  );
}
