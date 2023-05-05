import { Show, createMemo, createSignal, onMount } from "solid-js"

import GameLoop from "../lib/GameLoop"
import Race from "../models/Race"

export default function TrackViz(props: { race: Race }) {
  const { loop, runs, track } = props.race
  let path: SVGPathElement | undefined
  let pitPath: SVGPathElement | undefined
  let circle: SVGCircleElement | undefined
  let circles: Record<string, SVGCircleElement> = {}
  let pathLength: number | undefined
  let pitPathLength: number | undefined

  const [svgRotation, setSvgRotation] = createSignal<number | undefined>(270)

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

  loop.onRender(() => {
    if (!path) return
    if (!pathLength) return

    runs.forEach((run) => {
      if (!path) return
      if (!pitPath) return
      if (!pathLength) return
      if (!pitPathLength) return
      const circle = circles[run.car.id]
      if (!circle) return

      const locationInPercentage = run.isPitting
        ? run.locationInPitlane / run.track.pitlaneLength
        : run.location / run.track.length
      const pathToUse = run.isPitting ? pitPath : path
      const usedPathLength = run.isPitting ? pitPathLength : pathLength

      const length = usedPathLength * locationInPercentage
      let pos = pathToUse.getPointAtLength(length)

      circle.setAttributeNS(null, "cx", pos.x.toString())
      circle.setAttributeNS(null, "cy", pos.y.toString())
    })
  })

  onMount(() => {
    if (!path) return
    if (!pitPath) return

    pathLength = path.getTotalLength()
    pitPathLength = pitPath.getTotalLength()

    runs.forEach((run) => {
      if (!path) return
      if (!pitPath) return
      if (!pathLength) return
      const circle = circles[run.car.id]
      if (!circle) return

      const locationInPercentage = run.location / run.track.length

      let pos = path.getPointAtLength(pathLength * locationInPercentage)

      circle.setAttributeNS(null, "cx", pos.x.toString())
      circle.setAttributeNS(null, "cy", pos.y.toString())
    })
  })

  return (
    <div class="mt-2">
      <button class="btn btn-blue mr-2" onClick={changeToTopDown}>
        Top down
      </button>
      <button class="btn btn-blue mr-2" onClick={changeToIsometric}>
        Isometric
      </button>
      <Show when={svgRotation() !== undefined}>
        <button class="btn btn-blue mr-2" onClick={rotateLeft}>
          Rotate left
        </button>
        <button class="btn btn-blue mr-2" onClick={rotateRight}>
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
          d={track.pitPath}
          fill="none"
          stroke="gray"
          stroke-width="1"
          ref={pitPath}
        />
        <path
          id="path"
          d={track.trackPath}
          fill="none"
          stroke="black"
          stroke-width="2"
          ref={path}
        />
        {runs.map((run) => {
          return (
            <circle
              id={run.car.id}
              cx="-100"
              cy="=100"
              r="2"
              fill={`#${run.car.color}`}
              ref={(el) => (circles[run.car.id] = el)}
            ></circle>
          )
        })}
      </svg>
    </div>
  )
}
