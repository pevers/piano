import React, { useRef, useEffect } from "react";
import VexFlow from "vexflow";
import { PianoStave } from "./Piano";

const VF = VexFlow.Flow;
const { Formatter, Renderer, Stave, StaveNote } = VF;

const clefAndTimeWidth = 60;

export type StavesType = (string | (string | number)[])[][];

export function Score({
  staves = [] as PianoStave[],
  clef = "treble",
  timeSignature = "1/4",
  width = 450,
  height = 150,
}) {
  const container = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<VexFlow.Flow.Renderer>();

  useEffect(() => {
    if (rendererRef.current == null) {
      rendererRef.current = new Renderer(
        container.current!,
        Renderer.Backends.SVG
      );
    }
    const renderer = rendererRef.current;
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.clearRect(0, 0, width, height);
    context.setFont("Arial", 10, 200);
    const staveWidth = (width - clefAndTimeWidth) / staves.length;

    let currX = 0;
    staves.forEach((pianoStave, i) => {
      const stave = new Stave(currX, 0, staveWidth);
      if (i === 0) {
        stave.setWidth(staveWidth + clefAndTimeWidth);
        stave.addClef(clef).addTimeSignature(timeSignature);
      }
      currX += stave.getWidth();
      stave.setContext(context).draw();

      const staveNote = new StaveNote({
        keys: pianoStave.keys,
        duration: pianoStave.duration ? String(pianoStave.duration) : "q",
      });
      if (pianoStave.color) {
        staveNote.setStyle({
          fillStyle: pianoStave.color,
          strokeStyle: pianoStave.color,
        });
      }

      Formatter.FormatAndDraw(context, stave, [staveNote], {
        auto_beam: true,
        align_rests: false,
      });
    });
  }, [staves]);

  return <div ref={container} />;
}
