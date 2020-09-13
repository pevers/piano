import 'get-float-time-domain-data-polyfill'  // TODO: Fork pitch-detection to support Uint8Array and pass down byteTimeDomain
import { AutocorrelationDetector } from "mezmerize-detection-wasm";
import React, { Component } from "react";
import { Key, keyFromFrequency, randomKey, PianoStave } from "./Piano";
import { Score } from "./Score";

export type PitchState = {
  staves: PianoStave[];
  stream: MediaStream;
  finished: boolean;
};

export type PitchProps = {
  stream: MediaStream;
}

var AudioContext = window.AudioContext || window.webkitAudioContext;
export class PitchContainer extends Component<PitchProps, PitchState> {
  private buffer = new Float32Array(1024);
  private result = new Float32Array(2);
  private audioContext = new AudioContext();
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private detector = AutocorrelationDetector.new(1024, 1024 / 2);

  private keyBuffer: { key: Key; played: number }[] = [];
  private lastKeyPlayed: number = Date.now();
  private lastKey: Key | undefined = undefined;

  constructor(props: PitchProps) {
    super(props);
    this.state = {
      staves: this.generateRandomStaves(4),
      finished: false,
      ...props,
    };
  }

  componentDidMount = () => {
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.state.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024;
    this.mediaStreamSource.connect(this.analyser);

    // DEBUGGING
    document.addEventListener("keydown", this.keyDown, false);

    this.mainLoop();
  }

  keyDown = (event: KeyboardEvent) => {
    if (event.key === 'a') {
      this.setState({
        finished: true,
      });
    }
  }

  mainLoop = () => {
    requestAnimationFrame(this.mainLoop);
    this.updatePitch();
  };

  private updatePitch() {
    if (!this.analyser) {
      return;
    }
    this.analyser.getFloatTimeDomainData(this.buffer);

    // Move this constants to configurable settings
    this.detector.get_pitch(this.buffer, 44100, 0.25, 0.6, this.result);
    const frequency = this.result[0];
    const clarity = this.result[1];

    // This threshold should depend on the assignment size
    if (frequency > 200 && frequency < 500 && clarity > 0.8) {
      const key = keyFromFrequency(frequency);
      // console.log("key", key);
      // console.log("frequency", frequency);
      // console.log("clarity", clarity);

      // We currently have the assumption that two of the same notes cannot follow each other (TODO)
      const lastKey = this.lastKey;
      const now = Date.now();
      const lastTimeDiff = now - this.lastKeyPlayed;

      // TODO: Extract threshold and lag
      // 170 ms = audio stimulus threshold
      if (!lastKey || (lastKey !== key && lastTimeDiff > 170)) {
        this.lastKey = key;
        this.keyBuffer.push({
          key,
          played: now,
        });
        this.lastKeyPlayed = now;

        // TODO: For simplicity we just skip to the next at 4
        this.compareState();
        if (this.keyBuffer.length === 4) {
          this.setState({
            finished: true,
          });
        }
      }
    }
  }

  /**
   * Compare user input to the current state and update if necessary.
   */
  private compareState = () => {
    this.setState((oldState) => ({
      staves: oldState.staves.map((stave: PianoStave, index: number) => {
        const userInput = this.keyBuffer[index];
        if (!userInput) {
          return stave;
        }
        // TODO: Assume it is the first key on the stave
        if (userInput.key === stave.keys[0]) {
          return {
            ...stave,
            color: "#7fb800",
          };
        }
        return {
          ...stave,
          color: "#f6511d",
        };
      }),
    }));
  };

  /**
   * Generate random staves.
   * Note that we don't want 2 of the same keys proceding each other.
   * It is hard to distuingish the same tone repetitively (TODO).
   *
   * @param size size of the bar
   */
  private generateRandomStaves = (size: number): PianoStave[] => {
    if (size < 1) {
      throw new Error("Cannot generate random empty bar");
    }
    let staves: PianoStave[] = [];
    let lastKey = randomKey();
    staves.push({
      keys: [lastKey],
    });
    for (let i = 1; i < size; i++) {
      const key = randomKey();
      if (key === lastKey) {
        i--;
        continue;
      }
      staves.push({
        keys: [key],
      });
      lastKey = key;
    }
    return staves;
  };
  
  private nextStave = () => {
    this.setState((oldState: PitchState) => ({
      staves: oldState.finished ? this.generateRandomStaves(4) : oldState.staves,
      finished: false
    }));
    this.keyBuffer = [];
    this.lastKey = undefined;
  }

  public render() {
    return (
      <div className={this.state.finished ? "fadeOut" : "fadeIn"} onTransitionEnd={this.nextStave}>
        <Score staves={this.state.staves} />
      </div>
    );
  }
}
