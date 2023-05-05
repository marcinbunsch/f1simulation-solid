import { Action, Behavior, BehaviorTree } from "../lib/BehaviorTree"
import { Run } from "../models/Run"

export const shouldPitBehaviorTree = new BehaviorTree<Run>(
  // is pitting now?
  new Behavior((run) => run.shouldPit || run.inPitlane, {
    // less than 20% tyre left?
    no: new Behavior((run) => run.car.tyre.leftPercent <= 20, {
      yes: new Action("pit"),
    }),
  })
)
