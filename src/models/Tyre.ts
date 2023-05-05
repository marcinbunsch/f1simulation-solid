export type TyreType = "soft" | "medium" | "hard"
const DURABILITIES = {
  soft: 60000 * 1.2,
  medium: 90000 * 1.2,
  hard: 120000 * 1.2,
  wet: 60000 * 1.2,
}
export default class Tyre {
  type: TyreType
  distance: number = 0
  remaining: number
  static soft = new Tyre("soft")
  static medium = new Tyre("medium")
  static hard = new Tyre("hard")

  constructor(type: TyreType) {
    this.type = type
    this.remaining = this.durability
  }

  // grip influences acceleration and braking
  //
  get grip() {
    if (this.type === "soft") return 1
    if (this.type === "medium") return 0.9
    if (this.type === "hard") return 0.8
    return 1
  }

  // in meters
  get durability() {
    if (this.type === "soft") return DURABILITIES.soft
    if (this.type === "medium") return DURABILITIES.medium
    if (this.type === "hard") return DURABILITIES.hard
    return DURABILITIES.hard
  }

  get usedPercent() {
    return Math.floor((this.distance / this.durability) * 10000) / 100
  }

  get leftPercent() {
    return Math.floor((this.remaining / this.durability) * 10000) / 100
  }

  get degradation() {
    // this will be driven by the car and driver
    // right now it's constant
    return 1
  }
}
