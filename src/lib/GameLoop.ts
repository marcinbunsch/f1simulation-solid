import { convertTimeToFormat } from "./util"

export class RenderEvent extends CustomEvent<{ loop: GameLoop }> {}
export class UpdateEvent extends CustomEvent<{
  loop: GameLoop
  deltaTime: number
}> {}

export default class GameLoop {
  fixedTimestep = 1 / 60 // fixed timestep of 1/60th of a second
  time = 0 // current time in the simulation
  accumulatedTime = 0 // time accumulated since last update
  realTime = 0 // real time since the game loop started
  timeScale = 1 // simulation speed, 1 is normal speed
  renderInterval = 1 // number of simulation steps between each render
  steps = 0 // number of simulation steps taken
  lastFrameTime = 0
  startTime = 0 // time the game loop started
  paused = false
  private onUpdateCallbacks = new Set<
    (loop: GameLoop, deltaTime: number) => void
  >()
  private onRenderCallbacks = new Set<(loop: GameLoop) => void>()

  onUpdate = (callback: (loop: GameLoop, deltaTime: number) => void) => {
    this.onUpdateCallbacks.add(callback)
  }

  offUpdate = (callback: (loop: GameLoop, deltaTime: number) => void) => {
    this.onUpdateCallbacks.delete(callback)
  }

  private emitUpdate(deltaTime: number) {
    this.onUpdateCallbacks.forEach((callback) => callback(this, deltaTime))
  }

  onRender = (callback: (loop: GameLoop) => void) => {
    this.onRenderCallbacks.add(callback)
  }

  offRender = (callback: (loop: GameLoop) => void) => {
    this.onRenderCallbacks.delete(callback)
  }

  private emitRender() {
    this.onRenderCallbacks.forEach((callback) => callback(this))
  }

  start() {
    if (this.startTime !== 0) throw new Error("Game loop already started")
    console.log("Game loop started")
    this.startTime = performance.now()
    this.lastFrameTime = performance.now()
    requestAnimationFrame(this.gameLoop)
  }

  stop() {
    console.log("Game loop stopped")
    this.renderGame()
    this.paused = true
    this.startTime = 0
  }

  pause() {
    console.log("Game loop paused")
    this.renderGame()
    this.paused = true
  }

  runSingleFrame() {
    for (let i = 0; i < this.renderInterval; i++) {
      this.update(this.fixedTimestep)
    }
  }

  resume() {
    this.paused = false
    this.lastFrameTime = performance.now()
    requestAnimationFrame(this.gameLoop)
  }

  gameLoop = async () => {
    // calculate the time since the last frame
    const now = performance.now()
    const deltaTime = (now - this.lastFrameTime) / 1000
    this.lastFrameTime = now

    // update the game
    await this.update(deltaTime)

    // request the next frame
    if (!this.paused) requestAnimationFrame(this.gameLoop)
  }

  async update(deltaTime: number) {
    this.realTime += deltaTime
    deltaTime *= this.timeScale // apply time scale
    this.accumulatedTime += deltaTime

    // update the simulation with fixed timestep until accumulated time is less than timestep
    while (this.accumulatedTime >= this.fixedTimestep) {
      // update the simulation
      this.updateState(this.fixedTimestep)
      this.time += this.fixedTimestep
      this.accumulatedTime -= this.fixedTimestep
    }

    this.steps++

    if (this.steps % this.renderInterval === 0) {
      this.steps = 0
      this.renderGame()
    }
  }

  updateState(deltaTime: number) {
    this.emitUpdate(deltaTime)
  }

  renderGame() {
    this.emitRender()
  }
}
