import { Component } from "solid-js"

import Track from "../models/Track"
import EditorVisualization from "../editor/Visualization"

const track = new Track("Monaco")
track.trackPath =
  "M 50 10 L 140 10 Q 200 10 190 30 Q 180 50 150 70 Q 120 90 100 60 Q 86 40 60 60 Q 41 68 30 50 Q 0 10 50 10"
track.pitPath = "M 41 10 Q 43 5 46 5 L 73 5 Q 76 5 77 9"
track.addSection("straight", 1450, "max")
track.addSection("fast-corner", 250, 150)
track.addSection("slow-corner", 200, 60)
track.addSection("straight", 950, "max")
track.addSection("fast-corner", 300, 150)
track.addSection("straight", 300, "max")
track.addSection("slow-corner", 300, 10)
track.addSection("straight", 350, "max")
track.addSection("slow-corner", 250, 110)
track.addSection("straight", 400, "max")
track.addSection("fast-corner", 250, 200)
track.addSection("straight", 250, "max")
track.addPitlane(-110, 340)
track.freeze()

const Editor: Component = () => {
  return (
    <div>
      <div>
        <EditorVisualization track={track} />
      </div>
      Editor
    </div>
  )
}

export default Editor
