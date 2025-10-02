import * as React from "react"
import { Button } from "@/components/ui/button"

const Intro = () => (
  <section className="relative py-16 sm:py-20 lg:py-24">
    {/* Mask background icons behind text to prevent collision */}
    <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(220px_140px_at_22%_44%,transparent_0,black_60%)]" />

    <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-10 grid grid-cols-1 md:[grid-template-columns:minmax(44ch,50ch)_260px] items-start gap-6 md:gap-10">
      {/* TEXT COLUMN */}
      <div className="max-w-[50ch]">
        <p className="font-semibold tracking-wide text-[13px] uppercase text-slate-900 mb-2 font-heading">
          Software × Hardware × Fabrication
        </p>

        <h1 className="font-heading font-extrabold tracking-[-0.015em] text-[clamp(30px,6vw,36px)] md:text-[clamp(36px,5vw,48px)] lg:text-[clamp(42px,4vw,56px)] leading-[1.18] md:leading-[1.12] lg:leading-[1.08] mb-3 text-slate-900">
          Josh Wentworth
        </h1>

        <p className="text-slate-600 text-[16px] md:text-[18px] leading-[1.55] mb-3 max-w-[46rem]">
          Senior full-stack and cloud engineer. I design reliable, observable systems and ship polished products—blending React/Angular with TypeScript on the front end, Node.js/Python on the back end, and Kubernetes on GCP.
        </p>

        <p className="text-slate-600 text-[15.5px] leading-[1.55] mb-4 max-w-[46rem]">
          Previously at Fulfil Solutions, I led cloud architecture and partner integrations for robotic grocery fulfillment. I also build electronics/lighting and digital-fabrication projects.
        </p>

        {/* Compact button group */}
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap mb-4">
          <Button asChild size="md">
            <a href="#projects">View case studies</a>
          </Button>
          <Button asChild variant="outline" size="md">
            <a href="#contact">Get in touch</a>
          </Button>
        </div>

        <p className="text-slate-500 text-[14px] m-0">
          React • Angular • TypeScript • Node.js • Python • Kubernetes • GCP • MySQL/Redis • Grafana/Loki/Elastic
        </p>
      </div>

      {/* AVATAR COLUMN */}
      <div className="relative w-[184px] md:w-[208px] lg:w-[232px] aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-[0_24px_60px_rgba(2,6,23,.10)]">
        <div className="absolute -inset-0.5 rounded-2xl bg-[linear-gradient(120deg,#7C3AED,#06B6D4)] blur-md opacity-20 -z-10" />
        <img src="/avatar.jpg" alt="Josh Wentworth headshot" className="w-full h-full object-cover" />
      </div>
    </div>
  </section>
)

export default Intro
