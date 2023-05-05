import Team from "./Team"

let id = 1
export default class Driver {
  id: string
  team?: Team

  MAX_ATTRIBUTE = 20
  attributes = {
    acceleration: 10,
    braking: 10,
    fastCorners: 10,
    slowCorners: 10,
    tyreEfficiency: 10,
    fuelEfficiency: 10,
  }

  constructor(
    public name: string,
    public ticker: string,
    attributes?: Partial<Driver["attributes"]>
  ) {
    this.attributes = { ...this.attributes, ...attributes }
    this.id = `driver-${id++}`
  }
}
