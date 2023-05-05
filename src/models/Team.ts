import { shouldPitBehaviorTree } from "../strategies/pit"
import { basicTyreStrategyBehaviorTree } from "../strategies/tyre"
import Driver from "./Driver"
import { Run } from "./Run"
import Tyre from "./Tyre"

let carId = 1
export default class Team {
  id: string
  drivers: Record<string, Driver> = {}

  constructor(public name: string) {
    this.id = `team-${carId++}`
  }

  addDriver(driver: Driver) {
    driver.team = this
    this.drivers[driver.ticker] = driver
  }

  pickTyre(run: Run) {
    const whichTyre = basicTyreStrategyBehaviorTree.decide(run)
    return whichTyre.type
  }

  makeAIDecision(run: Run) {
    const car = run.car
    const action = shouldPitBehaviorTree.decide(run)
    // do nothing if we're on the last laps
    if (run.lapsLeft < 2) return

    if (action.type === "pit") {
      const whichTyre = basicTyreStrategyBehaviorTree.decide(run)
      run.shouldPit = true
      run.pitStrategy = { tyre: whichTyre.type as Tyre["type"] }
      run.pitLaneTimeLeft = Math.floor(Math.random() * 5 + 2) // this should be determined by level of mechanics
      return
    }
  }
}
