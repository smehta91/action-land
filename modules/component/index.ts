import {Action} from '@action-land/core'
import {Hoe} from '@action-land/smitten'
import {ReducerFunction, CommandFunction} from '@action-land/tarz'

export interface Component<State, Params, VNode> {
  init(p?: Partial<State>): State
  update: ReducerFunction<State>
  command: CommandFunction<State>
  view(e: Hoe, m: State, p: Params): VNode
}
