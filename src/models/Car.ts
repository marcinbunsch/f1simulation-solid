import Driver from "./Driver"
import Tyre from "./Tyre"

let carId = 1
export default class Car {
  speed: number = 0 // m/s
  mode: "accelerating" | "cruising" | "braking" = "cruising"
  tyre: Tyre = new Tyre("soft")
  fuelLoad: number = 110 // in kg
  id: string
  color: string

  MIN_ACCELERATION = 8.0 // m/s^2
  MAX_ACCELERATION = 12.0 // m/s^2

  static MIN_POSSIBLE_SPEED = 300
  static MAX_POSSIBLE_SPEED = 350

  MIN_BRAKING = 30.0 // m/s^2
  MAX_BRAKING = 50.0 // m/s^2

  FUEL_USAGE = 33.0 // l/100km
  FUEL_USAGE_PER_M = this.FUEL_USAGE / 100_000

  MAX_ATTRIBUTE = 20
  attributes = {
    // attribute 0-20 - it's a ratio of what the max possible acceleration is, with the max possible acceleration being 10-12,
    // so acceleration 10/20 will give a max acceleration of 11
    acceleration: 10,
    // attribute 0-20 - it's a ratio of what the max possible speed is, with the max possible speed being 300-350,
    // so speed 10/20 will give a max speed of 325
    speed: 10,
    braking: 10,
    fastCorners: 10,
    slowCorners: 10,
    // aerodynamics is a ratio of how much the car is slowed down by the air
    // 0 = max slowdown, 10 = 50% slowdown, 20 = no slowdown
    // max slowdown is 10% of the speed
    // so in other words, 0 = 10% slowdown, 10 = 5% slowdown, 20 = 0% slowdown
    // aero also affects acceleration
    // we're ignoring the fact that aero affects braking - the speed at which we brake is so high that it doesn't matter
    aerodynamics: 10,
    tyreEfficiency: 10,
    fuelEfficiency: 10,
  }

  constructor(public driver: Driver, attributes?: Partial<Car["attributes"]>) {
    this.attributes = { ...this.attributes, ...attributes }
    this.id = `car-${carId++}`
    this.color = Math.floor(Math.random() * 16777215).toString(16)
  }

  get team() {
    return this.driver.team
  }

  get aeroModifier() {
    const ratio = this.attributes.aerodynamics / this.MAX_ATTRIBUTE
    const ratioBase = 0.15
    return 1 - (ratioBase - ratio * ratioBase)
  }

  get acceleration() {
    const ratio = this.attributes.acceleration / this.MAX_ATTRIBUTE
    const calculated =
      this.MIN_ACCELERATION +
      (this.MAX_ACCELERATION - this.MIN_ACCELERATION) * ratio

    return calculated * this.aeroModifier * this.tyre.grip
  }

  get maxSpeed() {
    const ratio = this.attributes.speed / this.MAX_ATTRIBUTE
    const calculated =
      Car.MIN_POSSIBLE_SPEED +
      (Car.MAX_POSSIBLE_SPEED - Car.MIN_POSSIBLE_SPEED) * ratio
    return calculated * this.aeroModifier
  }

  get braking() {
    const ratio = this.attributes.braking / this.MAX_ATTRIBUTE
    return (
      this.MIN_BRAKING +
      (this.MAX_BRAKING - this.MIN_BRAKING) * ratio * this.tyre.grip
    )
  }

  speedRatio() {
    return this.attributes.speed / this.MAX_ATTRIBUTE
  }

  get speedInKph() {
    return this.speed * 3.6
  }

  getFastCornerSpeed(expectedSpeed: number) {
    const ratio = this.attributes.fastCorners / this.MAX_ATTRIBUTE

    const margin = expectedSpeed * 0.1

    // the higher the ratio, the closer to the expected speed
    return expectedSpeed - margin + margin * ratio
  }

  getSlowCornerSpeed(expectedSpeed: number) {
    const ratio = this.attributes.slowCorners / this.MAX_ATTRIBUTE

    const margin = expectedSpeed * 0.1

    // the higher the ratio, the closer to the expected speed
    return expectedSpeed - margin + margin * ratio
  }

  brakingDistance(targetSpeedInKph: number) {
    if (targetSpeedInKph > this.speedInKph) return 0
    const targetSpeed = targetSpeedInKph / 3.6
    const speedDifference = this.speed - targetSpeed
    const averageSpeed = (this.speed + targetSpeed) / 2
    const timeNeededToBrake = speedDifference / this.braking // in seconds

    const brakingDistance = averageSpeed * timeNeededToBrake // in meters

    return brakingDistance
  }

  tyreModifier() {
    const ratio = this.attributes.tyreEfficiency / this.MAX_ATTRIBUTE

    return 0.5 * ratio
  }

  tyreDegredation(distance: number) {
    const ratio = this.attributes.tyreEfficiency / this.MAX_ATTRIBUTE

    const margin = distance * 0.2
    const modifier = margin * ratio

    const result = distance - modifier

    return result
  }

  distanceOnTyre(tyre: Tyre) {
    const ratio = this.attributes.tyreEfficiency / this.MAX_ATTRIBUTE

    const distance = tyre.durability
    const margin = distance * 0.2
    const modifier = margin - margin * ratio
    const result = distance - modifier

    return result
  }

  fuelUsage(distance: number) {
    const ratio = this.attributes.fuelEfficiency / this.MAX_ATTRIBUTE

    // distance is in meters, so given that we know l/100km, we now need to
    // calculate how much fuel used for the distance we just did
    const fuelUsed = distance * this.FUEL_USAGE_PER_M

    // the margin is 20%, and a high ratio means we have high fuel efficiency
    // so that means we use _less_ fuel
    const margin = fuelUsed * 0.2
    const modifier = margin * ratio

    const result = fuelUsed - modifier

    return result
  }
}
