import GameLoop from "../lib/GameLoop"
import Car from "./Car"
import { Run } from "./Run"
import Track from "./Track"

export default class Race {
  loop: GameLoop
  laps: number
  track: Track
  cars: Car[]
  runs: Run[]

  constructor(track: Track, laps: number, cars: Car[]) {
    this.loop = new GameLoop()
    this.track = track
    this.laps = laps
    this.cars = cars
    this.runs = cars.map((car) => new Run(car, this))
  }
}
