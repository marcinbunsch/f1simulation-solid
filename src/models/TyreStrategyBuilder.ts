import { Run } from "./Run"
import Tyre, { TyreType } from "./Tyre"

export default class TyreStrategyBuilder {
  run: Run

  constructor(run: Run) {
    this.run = run
  }

  build() {
    const run = this.run
    const { car, lapLimit, lap, track } = run
    // calculate the tyre strategy
    // we look at current tyre wear and projected tyre wear and calculate the best strategy
    const lapsLeft = lapLimit - lap
    const tyre = car.tyre

    // we need to know the current tyre wear
    const currentTyreWear = car.tyre.leftPercent
    const tyreModifier = 1 + car.tyreModifier()
    const actuallyRemaining = tyre.remaining * tyreModifier

    // we need to know how many laps we have left on this tyre
    const lapsLeftOnTyre = Math.floor(actuallyRemaining / track.length)
    const lapsAfterwards = lapsLeft - lapsLeftOnTyre

    const fastestTyreStrategy = this.fastestTyreStrategy()
    const longestStintStrategy = this.longestStintStrategy()

    function calculateTimeForTyre(type: TyreType) {
      return track.sections
        .map((section) => {
          let speed: number
          if (section.type === "fast-corner") {
            speed = car.getFastCornerSpeed(section.expectedSpeed)
          } else if (section.type === "slow-corner") {
            speed = car.getSlowCornerSpeed(section.expectedSpeed)
          } else {
            speed = car.maxSpeed
          }
          const speedInMps = speed / 3.6
          const baseTime = section.length / speedInMps

          if (
            section.type === "fast-corner" ||
            section.type === "slow-corner"
          ) {
            return baseTime * (1 / new Tyre(type).grip)
          }

          return baseTime
        })
        .reduce((a, b) => a + b, 0)
    }
    // calculate time it takes to complete 1 lap
    const baseTime = track.sections
      .map((section) => {
        let speed: number
        if (section.type === "fast-corner") {
          speed = car.getFastCornerSpeed(section.expectedSpeed)
        } else if (section.type === "slow-corner") {
          speed = car.getSlowCornerSpeed(section.expectedSpeed)
        } else {
          speed = car.maxSpeed
        }
        const speedInMps = speed / 3.6
        const time = section.length / speedInMps
        return time
      })
      .reduce((a, b) => a + b, 0)

    const timeOnSoft = calculateTimeForTyre("soft")
    const timeOnMedium = calculateTimeForTyre("medium")
    const timeOnHard = calculateTimeForTyre("hard")

    console.log({
      baseTime,
      timeOnSoft,
      timeOnMedium,
      timeOnHard,
      fastestTyreStrategy,
      longestStintStrategy,
      tyreModifier: tyreModifier,
      lapsLeft,
      lapsAfterwards,
      actuallyRemaining,
      type: tyre.type,
      remaining: tyre.remaining,
      length: track.length,
      lapsLeftOnTyre,
    })

    return []
  }

  distancesOnTyre() {
    const tyreModifier = 1 + this.run.car.tyreModifier()
    const tyreTypes = ["hard", "medium", "soft"] as TyreType[]
    return tyreTypes.map((type) => {
      const tyre = new Tyre(type)
      const speed = 1 * tyre.grip
      return { type, distance: tyre.remaining * tyreModifier, speed }
    })
  }

  longestStintStrategy() {
    const { lapLimit, lap, track } = this.run
    const lapsLeft = lapLimit - lap

    const longest = this.distancesOnTyre().sort(
      (a, b) => b.distance - a.distance
    )
    const strategy = []
    let metersLeft = lapsLeft * track.length
    let breaker = 10
    while (metersLeft > 0) {
      breaker--
      if (breaker < 0) break
      const fastestTyre = longest[0]
      const fastestTyreDistance = fastestTyre.distance
      const secondFastestTyre = longest[1]
      const secondFastestTyreDistance = secondFastestTyre.distance
      if (fastestTyreDistance > metersLeft) {
        strategy.push(fastestTyre)
        metersLeft -= fastestTyreDistance
      } else if (secondFastestTyreDistance > metersLeft) {
        strategy.push(secondFastestTyre)
        metersLeft -= secondFastestTyreDistance
      } else {
        strategy.push(fastestTyre)
        metersLeft -= fastestTyre.distance
      }
    }

    return strategy
  }

  fastestTyreStrategy() {
    const { lapLimit, lap, track } = this.run
    const lapsLeft = lapLimit - lap

    const fastest = this.distancesOnTyre().sort((a, b) => b.speed - a.speed)
    const fastestTyreStrategy = []
    let fastestTyreStrategyLeft = lapsLeft * track.length
    let breaker = 10
    while (fastestTyreStrategyLeft > 0) {
      breaker--
      if (breaker < 0) break
      const fastestTyre = fastest[0]
      const fastestTyreDistance = fastestTyre.distance
      const secondFastestTyre = fastest[1]
      const secondFastestTyreDistance = secondFastestTyre.distance
      if (fastestTyreDistance > fastestTyreStrategyLeft) {
        fastestTyreStrategy.push(fastestTyre)
        fastestTyreStrategyLeft -= fastestTyreDistance
      } else if (secondFastestTyreDistance > fastestTyreStrategyLeft) {
        fastestTyreStrategy.push(secondFastestTyre)
        fastestTyreStrategyLeft -= secondFastestTyreDistance
      } else {
        fastestTyreStrategy.push(fastestTyre)
        fastestTyreStrategyLeft -= fastestTyre.distance
      }
    }

    return fastestTyreStrategy
  }
}
