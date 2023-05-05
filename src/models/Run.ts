import Car from "./Car"
import Race from "./Race"
import Track from "./Track"
import TrackSection from "./TrackSection"
import Tyre, { TyreType } from "./Tyre"

export class Run {
  location: number // meters
  lapLength: number // meters
  lap: number = 0
  lapLimit: number
  stopped: boolean = false
  slowdown = 1 // 16x speedup
  elapsed = 0
  totalTime = 0
  laps: number[] = []
  checkpoints: Record<number, number> = {}
  lastCheckpoint: number = 0
  shouldPit: boolean = false
  isPitting: boolean = false
  pitStrategy: { tyre: Tyre["type"] } | undefined
  pitLaneTimeLeft = 0
  track: Track
  timeSinceLastAIDecision = 0
  stint: number = 0

  constructor(public car: Car, public race: Race) {
    this.location = 0
    const carPosition = race.cars.indexOf(car)
    this.location = 100 - 5 * carPosition
    this.lapLimit = race.laps
    this.track = race.track
    const pickedTyre = car.team?.pickTyre(this)
    // put on the first tyre
    // car.tyre = new Tyre(car.team.tyreStrategy[0])
    car.tyre = new Tyre(pickedTyre as Tyre["type"])
    // sum up the length of all the sections
    this.lapLength = this.track.length
  }

  get currentDistance() {
    return this.location + this.lap * this.lapLength
  }

  get distanceLeft() {
    return this.lapLimit * this.lapLength - this.currentDistance
  }

  get lapsLeft() {
    return this.lapLimit - this.lap
  }

  async run(callback?: (run: Run) => void) {
    this.stopped = false
    while (this.location < this.lapLength && !this.stopped) {
      callback?.(this)
      await new Promise((resolve) => setTimeout(resolve, 16))
      this.elapsed += 1 / this.slowdown
    }
  }

  stop() {
    this.stopped = true
  }

  pitNext() {
    this.shouldPit = true
    this.pitLaneTimeLeft = 10 // 10 seconds
    this.pitStrategy = { tyre: "soft" }
  }

  getSection() {
    const sectionIndex = this.getSectionIndex()
    return this.track.sections[sectionIndex]
  }

  getSectionIndex() {
    const meters = this.location
    const sections = this.track.sections.filter((section) => {
      return section.startPoint <= meters
    })
    return sections.length - 1
  }

  getNextSection() {
    const sectionIndex = this.getSectionIndex()
    if (sectionIndex === this.track.sections.length - 1) {
      return this.track.sections[0]
    }
    return this.track.sections[sectionIndex + 1]
  }

  distanceToNextSection() {
    const nextSection = this.getNextSection()
    let distance = nextSection.startPoint - this.location
    if (nextSection.startPoint === 0) {
      distance = this.lapLength - this.location
    }
    return Math.round(distance * 100) / 100
  }

  getTimeToOtherRun(otherRun: Run) {
    const timeAtLastCheckpoint = this.checkpoints[this.lastCheckpoint]
    const otherTimeAtLastCheckpoint = otherRun.checkpoints[this.lastCheckpoint]

    if (!timeAtLastCheckpoint || !otherTimeAtLastCheckpoint) return 0

    return otherTimeAtLastCheckpoint - timeAtLastCheckpoint
  }

  get inPitlane() {
    const entry = this.track.pitlaneEntry
    const exit = this.track.pitlaneExit
    const location = this.location
    if (exit < entry) {
      if (location > entry) return true
      if (location < exit) return true
    }
    return location > entry && location < exit
  }

  get shouldStopInPitlane() {
    const garagePitlaneLocation = this.track.pitlaneLength / 2
    const entry = this.track.pitlaneEntry
    const exit = this.track.pitlaneExit
    const trackLength = this.track.length
    let locationInPitlane = this.location - entry
    if (locationInPitlane < 0) {
      locationInPitlane = locationInPitlane + trackLength
    }
    let garageLocation = entry + garagePitlaneLocation
    if (garageLocation > trackLength) {
      garageLocation = garageLocation - trackLength
    }
    // are we are 50% of pitlane
    return locationInPitlane > garageLocation && this.pitLaneTimeLeft > 0
  }

  get locationInPitlane() {
    const entry = this.track.pitlaneEntry
    const trackLength = this.track.length
    let locationInPitlane = this.location - entry
    if (locationInPitlane < 0) {
      locationInPitlane = locationInPitlane + trackLength
    }
    return locationInPitlane
  }

  tick(timePeriodInMs: number) {
    if (this.stopped) return
    const start = performance.now()

    // where are we?
    const section = this.getSection()
    if (!section) throw new Error("no section found")

    const run = this

    const nextSection = this.getNextSection()
    const nextSectionIsStraight = nextSection.type === "straight"
    const nextSectionIsCorner =
      nextSection.type === "fast-corner" || nextSection.type === "slow-corner"
    const sectionIsStraight = section.type === "straight"
    const distanceToNextSection = this.distanceToNextSection() * this.slowdown
    const nextCornerSpeed = nextSection.expectedSpeed
    const brakingDistance = this.car.brakingDistance(nextCornerSpeed)
    const car = this.car

    // detect we just left the pitlane
    if (this.isPitting && !this.inPitlane) this.isPitting = false

    // handle pitlane
    if (
      (this.shouldPit && this.inPitlane) ||
      (this.isPitting && this.inPitlane)
    ) {
      this.isPitting = true
      this.shouldPit = false
      if (this.shouldStopInPitlane) {
        // stop and do work
        if (this.pitStrategy) car.tyre = new Tyre(this.pitStrategy.tyre)
        car.speed = 0
        this.pitLaneTimeLeft -= timePeriodInMs
        if (this.pitLaneTimeLeft <= 0) {
          this.pitLaneTimeLeft = 0
          this.stint++
        }
      } else {
        car.speed = this.track.pitSpeedLimit
      }
    } else if (nextSectionIsCorner && distanceToNextSection < brakingDistance) {
      // are we withing breaking distance?
      this.handleCorner(timePeriodInMs, section)
    } else if (nextSectionIsStraight) {
      // if a straight, accelerate until max speed
      this.accelerate(timePeriodInMs)
    } else if (nextSectionIsCorner) {
      // if a corner, brake until we're at the right speed
      this.handleCorner(timePeriodInMs, section)
    }

    // move forward
    const distanceTravelled = this.car.speed * timePeriodInMs
    this.location += distanceTravelled
    this.elapsed += timePeriodInMs
    this.totalTime += timePeriodInMs

    car.tyre.distance += distanceTravelled
    car.tyre.remaining -= car.tyreDegredation(distanceTravelled)

    car.fuelLoad -= car.fuelUsage(distanceTravelled)

    // get the number floored to the nearest 250
    const lastCheckpoint = Math.floor(this.currentDistance / 250) * 250
    // crossed checkpoint?
    if (!this.checkpoints[lastCheckpoint]) {
      this.lastCheckpoint = lastCheckpoint
      this.checkpoints[lastCheckpoint] = this.totalTime
    }

    if (this.location > this.lapLength) {
      this.location = 0
      this.lap++
      this.laps.push(this.elapsed)
      if (this.laps.length === this.lapLimit) this.stop()
      this.elapsed = 0
    }

    this.timeSinceLastAIDecision += timePeriodInMs
    this.makeAIDecision()

    const finish = performance.now()
    const tickTimeTaken = finish - start
  }

  makeAIDecision() {
    // run AI decision making x seconds - there's no point doing it every tick
    if (this.timeSinceLastAIDecision < 5) return

    this.car.team?.makeAIDecision(this)
    this.timeSinceLastAIDecision = 0
  }

  accelerate(timePeriodInMs: number) {
    // we want to accelerate, but we don't want to go over the max speed

    // if we're not at the max speed, accelerate
    this.car.mode = "accelerating"
    this.car.speed += this.car.acceleration * timePeriodInMs

    // but if we're now over the max speed, set the speed to the max speed
    if (this.car.speedInKph > this.car.maxSpeed) {
      this.car.mode = "cruising"
      this.car.speed = this.car.maxSpeed / 3.6
    }
  }

  handleCorner(timePeriodInMs: number, section: TrackSection) {
    let maxCornerSpeed = section.expectedSpeed
    const car = this.car
    if (section.type === "fast-corner") {
      maxCornerSpeed = car.getFastCornerSpeed(maxCornerSpeed)
    } else if (section.type === "slow-corner") {
      maxCornerSpeed = car.getSlowCornerSpeed(maxCornerSpeed)
    }

    if (car.speedInKph > maxCornerSpeed) {
      const maxCornerSpeedInMps = maxCornerSpeed / 3.6
      const newSpeed = car.speed - car.braking * timePeriodInMs
      if (newSpeed < maxCornerSpeedInMps) {
        car.mode = "cruising"
        car.speed = maxCornerSpeedInMps
      } else {
        car.mode = "braking"
        car.speed = newSpeed
      }
    } else if (car.speedInKph < maxCornerSpeed) {
      const maxCornerSpeedInMps = maxCornerSpeed / 3.6
      const newSpeed = car.speed + car.acceleration * timePeriodInMs
      if (newSpeed > maxCornerSpeedInMps) {
        car.mode = "cruising"
        car.speed = maxCornerSpeedInMps
      } else {
        car.mode = "accelerating"
        car.speed = newSpeed
      }
      car.speed = newSpeed
    }
  }
}
