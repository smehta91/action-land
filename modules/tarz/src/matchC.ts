/**
 * Created by tushar on 26/06/18
 */

import {Action, isAction, Nil} from '@action-land/core'
import {CurriedFunction2, curry2} from 'ts-curry'
import {CommandFunction} from './commandFunction'

export type MatchActionCSpec<State> = {
  [key: string]: CommandFunction<State>
}

export const matchC = <State>(
  spec: MatchActionCSpec<State>
): CurriedFunction2<any, State, Action<any>> =>
  curry2(
    (action: any, state: State): Action<{}> =>
      isAction(action) && spec[action.type]
        ? spec[action.type](action.value, state)
        : Nil()
  )
