type Action<T = unknown, V = unknown> = [T, V]

type iActionValue<A, T, D = never> = A extends Action<T, infer V> ? V : D

type VNode = string

declare function COM<S>(state: S): Component<S, VNode>

type Component<S1, V, IA1 = never, OA1 = never, C1 = unknown, P1 = never> = {
  matchR<AT extends string | number, S2, AV>(
    type: AT,
    cb: (v: iActionValue<IA1, AT, AV>, s: S1) => S2
  ): Component<S2, V, IA1 | Action<AT, AV>, OA1, C1, P1>

  matchC<AT extends string | number, AV, OT extends string | number, OV>(
    type: AT,
    cb: (v: AV, s: S1) => Action<OT, OV>
  ): Component<S1, V, IA1 | Action<AT, AV>, OA1 | Action<OT, OV>, C1, P1>

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

  setInit(cb: (a: S1) => S1): Component<S1, V, IA1, OA1, C1, P1>

  init<P1>(p : P1): S1
}

// declare const Btn: Component<{color: string, text: string}, VNode, Action<'click', MouseEvent>>
// const RedBtn = Btn.init({color: 'red'}) // RedBtn<{text: string}>

declare function h(
  type: string,
  props: {on?: {[s: string]: string}},
  children: VNode[]
): VNode

declare const c1: Component<
  {color: string},
  string,
  Action<'click', Event>,
  never
>

declare const c2: Component<
  {age: number},
  string,
  Action<'GQL', Response>,
  never,
  never,
  {name: string}
>

const a = c1
  .matchR('hover', (ev: MouseEvent, s) => ({
    color: s.color.toLowerCase()
  }))
  .matchR('hover', (ev: MouseEvent, s) => ({
    color: s.color.toLowerCase()
  }))
  .matchC('keydown', (v: KeyboardEvent, s: {color: string}) => [
    'set',
    v.charCode
  ])
  .setInit((p) => ({color: 'blue'}))
  .forward('c2', c2)
  .view((e, s, v) => {
    return h('div', {}, [
      h('button', {}, [v.c2.render({name: 'tushar'}), 'hello'])
    ])
  })

const b = c1.matchC('keydown', (v: KeyboardEvent, s: {color: string}) => [
  'set',
  v.charCode
])



//init(b, {name: 'hello'})
