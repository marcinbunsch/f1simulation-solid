import {
  Accessor,
  Component,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js"

import logo from "./logo.svg"
import styles from "./App.module.css"

import GameLoop, { RenderEvent, UpdateEvent } from "./lib/GameLoop"
import {
  convertIntervalToFormat,
  convertTimeToFormat,
  convertToFloatWithTwoDecimals,
} from "./lib/util"
import TrackViz from "./components/TrackViz"
import TrackOverview from "./components/TrackOverview"
import Leaderboard from "./components/Leaderboard"
import Car from "./models/Car"
import Track from "./models/Track"
import Race from "./models/Race"
import Driver from "./models/Driver"
import Team from "./models/Team"

// const track = new Track("Monaco")
// track.trackPath =
//   "M 50 10 L 140 10 Q 200 10 190 30 Q 180 50 150 70 Q 120 90 100 60 Q 86 40 60 60 Q 41 68 30 50 Q 0 10 50 10"
// track.pitPath = "M 41 10 Q 43 5 46 5 L 73 5 Q 76 5 77 9"
// track.addSection("straight", 200, "max")
// track.addSection("fast-corner", 300, 120)
// track.addSection("slow-corner", 200, 60)
// track.addSection("straight", 100, "max")
// track.addSection("slow-corner", 100, 50)
// track.addSection("fast-corner", 200, 150)
// track.addSection("straight", 100, "max")
// track.addSection("straight", 100, "max")
// track.addSection("slow-corner", 300, 60)
// track.addSection("straight", 1000, "max")
// track.addSection("slow-corner", 300, 65)
// track.addSection("straight", 500, "max")
// track.addPitlane(-50, 250)
// track.freeze()

const track = new Track("Monaco")
track.trackPath =
  "M 50 10 L 140 10 Q 200 10 190 30 Q 180 50 150 70 Q 120 90 100 60 Q 86 40 60 60 Q 41 68 30 50 Q 0 10 50 10"
track.pitPath = "M 41 10 Q 43 5 46 5 L 73 5 Q 76 5 77 9"
track.addSection("straight", 1450, "max")
track.addSection("fast-corner", 250, 150)
track.addSection("slow-corner", 200, 60)
track.addSection("straight", 950, 300)
track.addSection("fast-corner", 300, 150)
track.addSection("straight", 300, 270)
track.addSection("slow-corner", 300, 100)
track.addSection("straight", 350, 260)
track.addSection("slow-corner", 250, 110)
track.addSection("straight", 400, 280)
track.addSection("fast-corner", 250, 200)
track.addSection("straight", 250, 260)
track.addPitlane(-110, 340)
track.freeze()

const teams: Record<string, Team> = {}
teams.MERCEDES = new Team("Mercedes")
teams.RED_BULL = new Team("Red Bull Racing")
teams.MCLAREN = new Team("McLaren")
teams.ALFA_ROMEO = new Team("Alfa Romeo")
teams.FERRARI = new Team("Ferrari")
teams.ALPINE = new Team("Alpine")
teams.HAAS = new Team("Haas")
teams.ALPHA_TAURI = new Team("Alpha Tauri")
teams.WILLIAMS = new Team("Williams")
teams.ASTON_MARTIN = new Team("Aston Martin")

const drivers: Record<string, Driver> = {}
drivers["VER"] = new Driver("Verstappen", "VER")
drivers["HAM"] = new Driver("Hamilton", "HAM")
drivers["BOT"] = new Driver("Bottas", "BOT")
drivers["PER"] = new Driver("Perez", "PER")
drivers["LEC"] = new Driver("Leclerc", "LEC")
drivers["NOR"] = new Driver("Norris", "NOR")
drivers["SAI"] = new Driver("Sainz", "SAI")
drivers["RIC"] = new Driver("Ricciardo", "RIC")
drivers["ALO"] = new Driver("Alonso", "ALO")
drivers["OCO"] = new Driver("Ocon", "OCO")
drivers["VET"] = new Driver("Vettel", "VET")
drivers["GAS"] = new Driver("Gasly", "GAS")
drivers["STR"] = new Driver("Stroll", "STR")
drivers["GIO"] = new Driver("Giovinazzi", "GIO")
drivers["RAI"] = new Driver("Raikkonen", "RAI")
drivers["TSU"] = new Driver("Tsunoda", "TSU")
drivers["MAG"] = new Driver("Magnussen", "MAG")
drivers["LAT"] = new Driver("Latifi", "LAT")
drivers["RUS"] = new Driver("Russell", "RUS")
drivers["MSC"] = new Driver("Schumacher", "MSC")

// team assignments
teams.MERCEDES.addDriver(drivers.HAM)
teams.MERCEDES.addDriver(drivers.BOT)
teams.RED_BULL.addDriver(drivers.VER)
teams.RED_BULL.addDriver(drivers.PER)
teams.MCLAREN.addDriver(drivers.NOR)
teams.MCLAREN.addDriver(drivers.RIC)
teams.ALFA_ROMEO.addDriver(drivers.GIO)
teams.ALFA_ROMEO.addDriver(drivers.RAI)
teams.FERRARI.addDriver(drivers.SAI)
teams.FERRARI.addDriver(drivers.LEC)
teams.ALPINE.addDriver(drivers.ALO)
teams.ALPINE.addDriver(drivers.OCO)
teams.ASTON_MARTIN.addDriver(drivers.VET)
teams.ASTON_MARTIN.addDriver(drivers.STR)
teams.HAAS.addDriver(drivers.MSC)
teams.HAAS.addDriver(drivers.MAG)
teams.ALPHA_TAURI.addDriver(drivers.TSU)
teams.ALPHA_TAURI.addDriver(drivers.GAS)
teams.WILLIAMS.addDriver(drivers.LAT)
teams.WILLIAMS.addDriver(drivers.RUS)

const f1Grid = [
  // prettier-ignore
  new Car(drivers.VER, { acceleration: 19, braking: 18, speed: 19, slowCorners: 19, fastCorners: 18, aerodynamics: 20, tyreEfficiency: 20 }),
  // prettier-ignore
  new Car(drivers.HAM, { acceleration: 19, braking: 19, speed: 20, slowCorners: 18, fastCorners: 19, aerodynamics: 19, tyreEfficiency: 17 }),
  // prettier-ignore
  new Car(drivers.BOT, { acceleration: 18, braking: 17, speed: 18, slowCorners: 17, fastCorners: 18, aerodynamics: 20, tyreEfficiency: 18 }),
  // prettier-ignore
  new Car(drivers.PER, { acceleration: 19, braking: 18, speed: 18, slowCorners: 18, fastCorners: 17, aerodynamics: 19, tyreEfficiency: 17 }),
  // prettier-ignore
  new Car(drivers.LEC, { acceleration: 18, braking: 18, speed: 18, slowCorners: 19, fastCorners: 18, aerodynamics: 18, tyreEfficiency: 18 }),
  // prettier-ignore
  new Car(drivers.NOR, { acceleration: 18, braking: 18, speed: 18, slowCorners: 18, fastCorners: 19, aerodynamics: 18, tyreEfficiency: 17 }),
  // prettier-ignore
  new Car(drivers.SAI, { acceleration: 18, braking: 19, speed: 18, slowCorners: 18, fastCorners: 18, aerodynamics: 19, tyreEfficiency: 17 }),
  // prettier-ignore
  new Car(drivers.RIC, { acceleration: 18, braking: 18, speed: 18, slowCorners: 18, fastCorners: 18, aerodynamics: 18, tyreEfficiency: 16 }),
  // prettier-ignore
  new Car(drivers.ALO, { acceleration: 18, braking: 18, speed: 18, slowCorners: 18, fastCorners: 17, aerodynamics: 18 }),
  // prettier-ignore
  new Car(drivers.OCO, { acceleration: 18, braking: 18, speed: 18, slowCorners: 18, fastCorners: 17, aerodynamics: 18 }),
  // prettier-ignore
  new Car(drivers.VET, { acceleration: 17, braking: 18, speed: 17, slowCorners: 18, fastCorners: 17, aerodynamics: 18 }),
  // prettier-ignore
  new Car(drivers.STR, { acceleration: 17, braking: 18, speed: 18, slowCorners: 17, fastCorners: 17, aerodynamics: 18 }),
  // prettier-ignore
  new Car(drivers.GAS, { acceleration: 17, braking: 17, speed: 17, slowCorners: 17, fastCorners: 18, aerodynamics: 17 }),
  // prettier-ignore
  new Car(drivers.TSU, { acceleration: 18, braking: 17, speed: 16, slowCorners: 17, fastCorners: 17, aerodynamics: 16 }),
  // prettier-ignore
  new Car(drivers.RAI, { acceleration: 16, braking: 17, speed: 16, slowCorners: 16, fastCorners: 17, aerodynamics: 17 }),
  // prettier-ignore
  new Car(drivers.GIO, { acceleration: 16, braking: 17, speed: 16, slowCorners: 16, fastCorners: 17, aerodynamics: 16 }),
  // prettier-ignore
  new Car(drivers.MSC, { acceleration: 15, braking: 16, speed: 15, slowCorners: 15, fastCorners: 16, aerodynamics: 15 }),
  // prettier-ignore
  new Car(drivers.RUS, { acceleration: 15, braking: 16, speed: 14, slowCorners: 15, fastCorners: 16, aerodynamics: 14, tyreEfficiency: 12 }),
  // prettier-ignore
  new Car(drivers.LAT, { acceleration: 15, braking: 15, speed: 15, slowCorners: 15, fastCorners: 15, aerodynamics: 14, tyreEfficiency: 12 }),
]

const SimulationSpeeds: number[] = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]

const App: Component = () => {
  const [lap, setLap] = createSignal(1)
  const [raceDistance, setRaceDistance] = createSignal(0)
  const [simulationSpeed, setSimulationSpeed] = createSignal<number>(32) //
  const [simulationTime, setSimulationTime] = createSignal(0)
  const [realTime, setRealTime] = createSignal(0)
  const [running, setRunning] = createSignal(false)
  const [started, setStarted] = createSignal(false)
  const [leaderboardMode, setLeaderboardMode] = createSignal<
    "leader" | "interval"
  >("leader")
  const [visualization, setVisualization] = createSignal<"track" | "lanes">(
    "track"
  )

  const laps = 53
  const race = new Race(track, laps, f1Grid)

  const runs = race.runs

  const loop = race.loop
  loop.timeScale = simulationSpeed()
  // run the simulation at 120fps
  loop.fixedTimestep = 1 / 120
  // render the simulation at 60fps
  loop.renderInterval = 2

  // This is the glue, it should probably go into a Race object
  loop.onUpdate((self, deltaTime) => {
    setSimulationTime(self.time)
    setRealTime(self.realTime)
    for (const run of runs) {
      run.tick(deltaTime)
    }
  })

  const render = (self: GameLoop) => {
    const sorted = runs.sort((a, b) => {
      return a.currentDistance > b.currentDistance ? -1 : 1
    })
    let targetRun = sorted[0] // leader
    setRaceDistance(targetRun.currentDistance)
    setLap(targetRun.lap + 1)
    setSimulationTime(self.time)
    setRealTime(self.realTime)
  }

  loop.onRender(render)

  loop.onUpdate((self, delta) => {
    const allStopped = runs.every((run) => run.stopped)
    if (allStopped) {
      loop.stop()
      setRunning(false)
      render(loop)
    }
  })

  const changeSimulationSpeed = () => {
    const newSpeed = simulationSpeed() * 2
    const maxSimulationSpeed = Math.max(...SimulationSpeeds)

    if (newSpeed > maxSimulationSpeed) {
      loop.timeScale = 1
      setSimulationSpeed(1)
    } else {
      loop.timeScale = newSpeed
      setSimulationSpeed(newSpeed)
    }
  }

  onMount(() => {
    // loop.start()
  })

  onCleanup(() => {
    loop.stop()
  })

  const resume = () => {
    setStarted(true)
    loop.resume()
    setRunning(true)
  }

  const pause = () => {
    loop.pause()
    setRunning(false)
  }

  const runOneSecond = () => {
    resume()
    setTimeout(() => {
      pause()
    }, 100)
  }

  return (
    <div>
      <div>Simulation Time: {convertTimeToFormat(simulationTime())}</div>
      <div>Real Time: {convertTimeToFormat(realTime())}</div>
      <div>
        <span>
          Lap: {lap() > laps ? laps : lap()}/{laps}.
        </span>{" "}
        <span>Speed: {simulationSpeed()}x</span>{" "}
        <span>
          Distance {convertToFloatWithTwoDecimals(raceDistance())}m. Simulation
          speed:{" "}
        </span>
      </div>
      <div>
        <Show when={!running()}>
          <button class="ml-2 btn btn-blue" onClick={() => resume()}>
            {started() ? "Resume" : "Start"}
          </button>
        </Show>
        <Show when={running()}>
          <button class="ml-2 btn btn-blue" onClick={() => pause()}>
            Pause
          </button>
        </Show>
        <button class="btn btn-blue ml-2" onClick={() => loop.runSingleFrame()}>
          Run Frame
        </button>
        <button class="btn btn-blue ml-2" onClick={() => runOneSecond()}>
          Run 1 Second
        </button>
        <button
          class="btn btn-blue ml-2"
          onClick={() =>
            visualization() === "lanes"
              ? setVisualization("track")
              : setVisualization("lanes")
          }
        >
          Change Viz
        </button>
        <button
          class="btn btn-blue ml-2"
          onClick={() =>
            setLeaderboardMode(
              leaderboardMode() == "leader" ? "interval" : "leader"
            )
          }
        >
          Change Leaderboard Mode to{" "}
          {leaderboardMode() == "leader" ? "interval" : "leader"}
        </button>
        <button
          class="btn btn-blue ml-2"
          onClick={() => changeSimulationSpeed()}
        >
          Speed {simulationSpeed()}x
        </button>
      </div>
      <div class="flex flex-row w-full">
        <div class="flex-shrink-0 flex-grow-0 w-[300px]">
          <Leaderboard race={race} mode={leaderboardMode()} />
        </div>
        <div class="flex flex-col w-full pl-5 pr-5">
          <Show when={visualization() === "track"}>
            <TrackViz race={race} />
          </Show>
          <Show when={visualization() === "lanes"}>
            <TrackOverview race={race} />
          </Show>
        </div>

        <div class="flex-shrink-0 flex-grow-0 w-50">
          <table class="w-50">
            <tbody>
              <For each={runs}>
                {(run) => {
                  return (
                    <tr>
                      <td>{run.car.driver.name}</td>
                      <td>
                        <button
                          class="btn btn-blue"
                          onClick={() => {
                            run.pitNext()
                          }}
                        >
                          Pit
                        </button>
                      </td>
                    </tr>
                  )
                }}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App
