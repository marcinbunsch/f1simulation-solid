let trackSectionId = 0
export default class TrackSection {
  type: "straight" | "fast-corner" | "slow-corner"
  length: number // in meters
  startPoint: number // in meters
  expectedSpeed: number
  id: string
  // direction: "left" | "right" | "straight"

  constructor(
    type: TrackSection["type"],
    length: number,
    expectedSpeed: number,
    startPoint: number
    // direction: TrackSection["direction"]
  ) {
    this.id = `track-section-${trackSectionId++}`
    this.type = type
    this.length = length
    this.expectedSpeed = expectedSpeed
    this.startPoint = startPoint
  }
}
