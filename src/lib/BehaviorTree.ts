export class Action {
  isAction: boolean = true
  type: string
  isNoop: boolean

  constructor(type: string) {
    this.type = type
    this.isNoop = type === "noop"
  }
}

const NOTHING = new Action("noop")

export class Behavior<T> {
  yes: Behavior<T> | Action = NOTHING
  no: Behavior<T> | Action = NOTHING
  isAction = false

  constructor(
    protected evaluator: (run: T) => boolean,
    {
      yes = NOTHING,
      no = NOTHING,
    }: {
      yes?: Behavior<T> | Action
      no?: Behavior<T> | Action
    } = { yes: NOTHING, no: NOTHING }
  ) {
    this.yes = yes
    this.no = no
  }

  evaluate(run: T) {
    if (this.evaluator(run)) {
      return this.yes
    } else {
      return this.no
    }
  }
}

export class BehaviorTree<T> {
  root: Action | Behavior<T>
  constructor(root: Action | Behavior<T>) {
    this.root = root
  }

  decide(run: T): Action {
    let node = this.root
    while (node instanceof Behavior) {
      node = node.evaluate(run)
    }
    return node as Action
  }
}
