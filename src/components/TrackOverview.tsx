import { createSignal, For } from "solid-js"

import GameLoop from "../lib/GameLoop"
import Race from "../models/Race"
import { Run } from "../models/Run"
import Track from "../models/Track"

const Pitlane = (props: { track: Track }) => {
  const track = props.track
  if (track.pitEntryLocation < 0 && track.pitExitLocation > 0) {
    const part1size = ((-1 * track.pitEntryLocation) / track.length) * 100
    const part1x = 100 - part1size

    const part2size = (track.pitExitLocation / track.length) * 100
    const part2x = 0

    // we need two parts
    return (
      <>
        <div
          class="pitlane absolute top-3 h-3 bg-gray-300"
          style={{ width: `${part1size}%`, left: part1x + "%" }}
        ></div>
        <div
          class="pitlane absolute top-3 h-3 bg-gray-300"
          style={{ width: `${part2size}%`, left: part2x + "%" }}
        ></div>
      </>
    )
  }
}

function TrackView(props: { track: Track; run: Run; loop: GameLoop }) {
  const [location, setLocation] = createSignal(0)
  const [mode, setMode] = createSignal("cruising")
  const [time, setTime] = createSignal(0)
  const [laps, setLaps] = createSignal<number[]>([])
  const [isPitting, setIsPitting] = createSignal(false)

  props.loop.onRender((loop) => {
    setLocation(props.run.location)
    setMode(props.run.car.mode)
    setTime(props.run.elapsed)
    setIsPitting(props.run.isPitting)
    if (laps().length != props.run.laps.length) {
      setLaps([...props.run.laps])
    }
  })

  return (
    <div class="relative mt-1 mb-1">
      <Pitlane track={props.track} />
      <div class="track flex ">
        {props.track.sections.map((section, index) => {
          const size = (section.length / props.track.length) * 100
          return (
            <div
              class="h-5 bg-gray-300"
              style={{ width: `${size}%` }}
              classList={{
                "bg-green-300": section.type == "straight",
                "bg-red-300": section.type == "slow-corner",
                "bg-yellow-300": section.type == "fast-corner",
              }}
            >
              {/* {`section ${section.type} ${section.direction}`} */}

              <div
                class="car absolute top-0 left-0 w-5 h-5 rounded-full bg-blue-600"
                classList={{
                  "bg-red-500": mode() == "braking",
                  "bg-blue-500": mode() == "cruising",
                  "bg-green-500": mode() == "accelerating",
                }}
                style={{
                  top: isPitting() ? "5px" : "0px",
                  left: `${(location() / props.track.length) * 100}%`,
                  "margin-left": "-15px",
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TrackOverview(props: { race: Race }) {
  return (
    <For each={props.race.runs}>
      {(run) => {
        return (
          <TrackView
            track={props.race.track}
            run={run}
            loop={props.race.loop}
          />
        )
      }}
    </For>
  )
}
