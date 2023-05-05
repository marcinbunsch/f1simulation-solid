import Car from "./Car"
import TrackSection from "./TrackSection"

export default class Track {
  sections: TrackSection[] = []
  pitEntryLocation: number = -50
  pitExitLocation: number = 500
  trackPath: string = ""
  pitPath: string = ""
  private memoizedLength?: number

  constructor(public name: string) {}

  get calculatedLength() {
    return this.sections.reduce((total, section) => total + section.length, 0)
  }
  get length() {
    if (this.memoizedLength) return this.memoizedLength
    return this.calculatedLength
  }

  freeze() {
    this.memoizedLength = this.calculatedLength
  }

  get pitSpeedLimit() {
    return this.pitSpeedLimitInKph / 3.6
  }

  get pitSpeedLimitInKph() {
    return 80 // kph
  }

  addPitlane(entry: number, exit: number) {
    this.pitEntryLocation = entry
    this.pitExitLocation = exit
  }

  get pitlaneEntry() {
    if (this.pitEntryLocation < 0) {
      return this.length + this.pitEntryLocation
    } else {
      return this.pitEntryLocation
    }
  }

  get pitlaneExit() {
    if (this.pitExitLocation < 0) {
      return this.length + this.pitExitLocation
    } else {
      return this.pitExitLocation
    }
  }

  get pitlaneLength() {
    return Math.abs(this.pitEntryLocation) + Math.abs(this.pitExitLocation)
  }

  addSection(
    type: TrackSection["type"],
    length: number,
    expectedSpeedInKph: number | "max"
  ) {
    const startPoint = this.calculatedLength
    const expectedSpeed =
      expectedSpeedInKph === "max" ? Car.MAX_POSSIBLE_SPEED : expectedSpeedInKph
    const section = new TrackSection(type, length, expectedSpeed, startPoint)
    this.sections.push(section)
  }
}
