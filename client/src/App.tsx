// A dependency graph that contains any wasm must all be imported
// asynchronously. This `index.js` file does the single async import, so
// that no one else needs to worry about it again.
import Button from "@material-ui/core/Button/Button";
import Container from "@material-ui/core/Container/Container";
import React, { useState } from "react";
import "./App.css";

import { PitchContainer } from "./components/PitchContainer";
import { SkillContainer } from "./components/SkillContainer";

function App() {
  // TODO: Maybe move all stream state to this component
  const [stream, setStream] = useState<MediaStream>();

  const getMic = () => {
    const options = {
      audio: {
        echoCancellation: true,
        autoGainControl: true,
        sampleRate: 44100,
      },
    };

    navigator.mediaDevices
      .getUserMedia(options)
      .then(gotStream)
      .catch(gotError);
  };

  const gotStream = (stream: MediaStream) => {
    setStream(stream);
  };

  // TODO: Show error to the user
  const gotError = (error: Error) => {
    console.error(error);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Container maxWidth="sm">
        <SkillContainer/>
          {/* {stream ? (
            <SkillContainer/>
            // <PitchContainer stream={stream}/>
          ) : (
            <Button variant="contained" color="primary" onClick={getMic}>
              Start
            </Button>
          )} */}
        </Container>
      </header>
    </div>
  );
}

export default App;
