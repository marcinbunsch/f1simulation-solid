import { Action, Behavior, BehaviorTree } from "../lib/BehaviorTree"
import { Run } from "../models/Run"
import Tyre from "../models/Tyre"

export const basicTyreStrategyBehaviorTree = new BehaviorTree(
  new Behavior<Run>(
    (run) => {
      return run.car.distanceOnTyre(Tyre.soft) > run.distanceLeft
    },
    {
      yes: new Action("soft"),
      no: new Behavior(
        (run) => {
          return run.car.distanceOnTyre(Tyre.medium) > run.distanceLeft
        },
        {
          yes: new Action("medium"),
          no: new Behavior(
            (run) => {
              return (
                run.car.distanceOnTyre(Tyre.soft) +
                  run.car.distanceOnTyre(Tyre.medium) >
                run.distanceLeft
              )
            },
            {
              yes: new Action("medium"),
              no: new Behavior(
                (run) => {
                  return run.car.distanceOnTyre(Tyre.hard) > run.distanceLeft
                },
                {
                  yes: new Action("hard"),
                  no: new Behavior(
                    (run) => {
                      return (
                        run.car.distanceOnTyre(Tyre.hard) +
                          run.car.distanceOnTyre(Tyre.medium) >
                        run.distanceLeft
                      )
                    },
                    {
                      yes: new Action("hard"),
                      no: new Action("soft"),
                    }
                  ),
                }
              ),
            }
          ),
        }
      ),
    }
  )
)
