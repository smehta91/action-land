import init from 'ramda/es/init'

type Action<T = unknown, V = unknown> = [T, V]
type VNode = string

/**
 * Component Constructor
 * @param state : Any State object
 */
declare function COM<S>(state: S): Component<S, VNode>

/**
 * Component Type
 */
type Component<S1, V, IA1 = never, OA1 = never, C1 = unknown, P1 = never> = {
  matchR<AT extends string | number, AV, S2>(
    type: AT,
    cb: (v: AV, s: S1) => S2
  ): Component<S2, V, IA1 | Action<AT, AV>, OA1, C1, P1>

  matchC<AT extends string | number, AV, A extends Action>(
    type: AT,
    cb: (v: AV, s: S1) => A
  ): Component<S1, V, IA1 | Action<AT, AV>, OA1 | A, C1, P1>

  forward<K extends string | number, S2, IA2, OA2, C2, P2>(
    k: K,
    c: Component<S2, V, IA2, OA2, C2, P2>
  ): Component<
    S1 & {[k in K]: S2},
    V,
    IA1 | (IA2 extends never ? never : Action<K, IA2>),
    OA1 | (OA2 extends never ? never : Action<K, OA2>),
    C1 & {[k in K]: Component<S2, V, IA2, OA2, C2, P2>},
    P1
  >

  view(
    cb: (e: (act: IA1) => void, s: S1, v: {[k in keyof C1]: C1[k]}) => V
  ): Component<S1, V, IA1, OA1, C1, P1>

  render(props: P1): V

  initWith(
    spec: {[key in keyof S1]?: S1[key]}
  ): Component<S1, V, IA1, OA1, C1, P1>

  init(params?: {[key in keyof S1]?: S1[key]}): S1
}

/** EXAMPLES */

declare function h(
  type: string,
  props: {on?: {[s: string]: string}},
  children: [VNode]
): VNode

declare const c1: Component<
  {color: string},
  VNode,
  Action<'click', Event>,
  never
>

declare const c2: Component<
  {age: number},
  VNode,
  Action<'GQL', Response>,
  never,
  never,
  {name: string}
>

const a = c1
  .matchR('hover', (ev: MouseEvent, s) => ({
    color: s.color.toLowerCase()
  }))
  .matchR('hover', (ev: Response, s) => ({
    sign: s.color.toUpperCase()
  }))
  .matchC('gql', (res: Response, s) => ['abc', res])
  .forward('c2', c2)
  .view((e, s, v) => {
    return h('div', {}, [h('button', {}, [v.c2.render({name: 'tushar'})])])
  })

/**
 * Declare initial values for state
 * */

// Button component, with some initial state
const button = COM({bgColor: '#95a5a6', content: 'Hello World'})

// Red button, created by partially applying one of the state variables
const redButton = button.initWith({bgColor: 'red'})

// greenButton == greenButton2
const greenButton = button.initWith({bgColor: 'green'})
const greenButton2 = redButton.initWith({bgColor: 'green'})

// When I'm ready to get the state of that component
const state = redButton.init()

const orangeState = greenButton.init({bgColor: 'orange'})
