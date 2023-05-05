import { batch, createEffect, createMemo, createSignal, For } from "solid-js"

import Race from "../models/Race"
import { Run } from "../models/Run"
import { convertIntervalToFormat } from "../lib/util"
import SoftTyreImage from "../assets/tyre-icon-soft.png"
import MediumTyreImage from "../assets/tyre-icon-medium.png"
import HardTyreImage from "../assets/tyre-icon-hard.png"

const TYRE_IMAGES = {
  soft: SoftTyreImage,
  medium: MediumTyreImage,
  hard: HardTyreImage,
}

function LeaderboardEntry(props: { item: LeaderboardItem; mode: string }) {
  const imageUrl = createMemo(() => {
    const type = props.item.tyreType()
    const image = TYRE_IMAGES[type]
    return image
  })
  return (
    <tr>
      <td>{props.item.name}</td>
      <td>
        {props.item.position() === 1
          ? props.mode
          : convertIntervalToFormat(props.item.interval())}
      </td>
      <td class="pb-[3px]">
        <img width="32" height="32" src={imageUrl()} />
      </td>
      <td>{props.item.tyreLeft()}%</td>
    </tr>
  )
}

const convertRunsToItems = (runs: Run[], mode: string) => {
  const sorted = runs.sort((a, b) => {
    return a.currentDistance > b.currentDistance ? -1 : 1
  })

  return sorted.map((run, index) => {
    return buildItem(run, index + 1)
  })
}

function buildItem(run: Run, initialPosition: number) {
  const [interval, setInterval] = createSignal(0)
  const [position, setPosition] = createSignal(initialPosition)
  const [tyreType, setTyreType] = createSignal(run.car.tyre.type)
  const [tyreLeft, setTyreLeft] = createSignal(run.car.tyre.leftPercent)
  const [fuelLeft, setFuelLeft] = createSignal(run.car.fuelLoad)

  return {
    carId: run.car.id,
    name: run.car.driver?.name || "Unknown",
    interval,
    setInterval,
    position,
    setPosition,
    tyreType,
    setTyreType,
    tyreLeft,
    setTyreLeft,
    fuelLeft,
    setFuelLeft,
  }
}

type LeaderboardItem = ReturnType<typeof buildItem>

export default function Leaderboard(props: {
  race: Race
  mode: "leader" | "interval"
}) {
  const items = convertRunsToItems(props.race.runs, props.mode)
  const itemsByCarId: Record<string, LeaderboardItem> = {}
  items.forEach((item) => (itemsByCarId[item.carId] = item))

  const sortedItems = createMemo(() => {
    const sorted = items
      .sort((a, b) => {
        return a.position() < b.position() ? -1 : 1
      })
      .map((i) => i)
    return sorted
  })

  createEffect(() => {
    // console.log("order changed", sortedItems())
  })

  props.race.loop.onRender((self) => {
    batch(() => {
      const runs = props.race.runs
      const sorted = runs.sort((a, b) => {
        return a.currentDistance > b.currentDistance ? -1 : 1
      })
      let targetRun = sorted[0] // leader
      sorted.forEach((run, index) => {
        const item = itemsByCarId[run.car.id]
        if (!item) return
        const position = index + 1
        if (item.position() !== position) item.setPosition(position)
        const interval = run.getTimeToOtherRun(targetRun)
        if (props.mode === "interval") targetRun = run
        item.setInterval(interval)
        item.setTyreLeft(Math.floor(run.car.tyre.leftPercent))
        item.setTyreType(run.car.tyre.type)
        item.setFuelLeft(Math.floor(run.car.fuelLoad * 100) / 100)
      })
    })
  })

  return (
    <table class="w-50">
      <tbody>
        <For each={sortedItems()}>
          {(item, index) => {
            return <LeaderboardEntry item={item} mode={props.mode} />
          }}
        </For>
      </tbody>
    </table>
  )
}
