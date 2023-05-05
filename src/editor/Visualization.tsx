import { Show, createMemo, createSignal, onMount } from "solid-js"
import Track from "../models/Track"

const COLORS = {
  straight: "green",
  "fast-corner": "yellow",
  "slow-corner": "orange",
}

export default function EditorVisualization(props: { track: Track }) {
  let path: SVGPathElement | undefined
  let pitPath: SVGPathElement | undefined
  let circles: Record<string, SVGCircleElement> = {}

  const [svgRotation, setSvgRotation] = createSignal<number | undefined>(
    undefined
  )

  const svgTransform = createMemo(() => {
    const rotation = svgRotation()
    if (rotation === undefined) return "none"
    return `rotateX(60deg) rotateZ(-45deg) rotate(${rotation}deg)`
  })

  const rotateRight = () => {
    const rotation = svgRotation()
    if (rotation === undefined) return
    if (rotation === 270) {
      setSvgRotation(0)
    } else {
      setSvgRotation(rotation + 90)
    }
  }

  const rotateLeft = () => {
    const rotation = svgRotation()
    if (rotation === undefined) return
    if (rotation === 0) {
      setSvgRotation(270)
    } else {
      setSvgRotation(rotation - 90)
    }
  }

  const changeToTopDown = () => {
    setSvgRotation(undefined)
  }

  const changeToIsometric = () => {
    setSvgRotation(0)
  }

  onMount(() => {
    if (!path) return
    if (!pitPath) return

    // pathLength = path.getTotalLength()
    // pitPathLength = pitPath.getTotalLength()

    props.track.sections.forEach((section) => {
      if (!path) return

      const circle = circles[section.id]
      if (!circle) return

      const locationInPercentage = section.startPoint / props.track.length
      let pathlength = path.getTotalLength()
      let pos = path.getPointAtLength(pathlength * locationInPercentage)

      circle.setAttributeNS(null, "cx", pos.x.toString())
      circle.setAttributeNS(null, "cy", pos.y.toString())
    })

    const pitlaneEntryCircle = circles["pitlane-entry"]
    if (pitlaneEntryCircle) {
      const pitEntryLocationInPercentage =
        props.track.pitlaneEntry / props.track.length
      let pathlength = path.getTotalLength()
      let pos = path.getPointAtLength(pathlength * pitEntryLocationInPercentage)

      pitlaneEntryCircle.setAttributeNS(null, "cx", pos.x.toString())
      pitlaneEntryCircle.setAttributeNS(null, "cy", pos.y.toString())
    }

    const pitlaneExitCircle = circles["pitlane-exit"]
    if (pitlaneExitCircle) {
      const pitEntryLocationInPercentage =
        props.track.pitlaneExit / props.track.length
      let pathlength = path.getTotalLength()
      let pos = path.getPointAtLength(pathlength * pitEntryLocationInPercentage)

      pitlaneExitCircle.setAttributeNS(null, "cx", pos.x.toString())
      pitlaneExitCircle.setAttributeNS(null, "cy", pos.y.toString())
    }
  })

  return (
    <div>
      <button class="btn btn-blue" onClick={changeToTopDown}>
        Top down
      </button>
      <button class="btn btn-blue" onClick={changeToIsometric}>
        Isometric
      </button>
      <Show when={svgRotation() !== undefined}>
        <button class="btn btn-blue" onClick={rotateLeft}>
          Rotate left
        </button>
        <button class="btn btn-blue" onClick={rotateRight}>
          Rotate right
        </button>
      </Show>
      <svg
        viewBox="0 0 200 90"
        style={{
          transform: svgTransform(),
        }}
      >
        <path
          id="path"
          d={props.track.pitPath}
          fill="none"
          stroke="gray"
          stroke-width="1"
          ref={pitPath}
        />
        <path
          id="path"
          d={props.track.trackPath}
          fill="none"
          stroke="black"
          stroke-width="2"
          ref={path}
        />
        {props.track.sections.map((section) => {
          return (
            <circle
              id={section.id}
              cx="-100"
              cy="=100"
              r="2"
              fill={COLORS[section.type]}
              ref={(el) => (circles[section.id] = el)}
            ></circle>
          )
        })}
        <circle
          id={"pitlane-entry"}
          cx="-100"
          cy="=100"
          r="2"
          fill={"gray"}
          ref={(el) => (circles["pitlane-entry"] = el)}
        ></circle>
        <circle
          id={"pitlane-exit"}
          cx="-100"
          cy="=100"
          r="2"
          fill={"gray"}
          ref={(el) => (circles["pitlane-exit"] = el)}
        ></circle>
      </svg>
    </div>
  )
}
