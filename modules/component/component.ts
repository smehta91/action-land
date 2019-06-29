

type Action<T = unknown, V = unknown> = [T, V]
type Nil = Action<'@@nil', {}>
const NilAction: Nil = ['@@nil', {}] 
/**
 * Component Constructor
 * @param state : Any State object
 */
type COM<S> = (state: S) => Component<S>
function isAction(action: unknown): action is Action<string> {
  return Array.isArray(action) &&  (typeof action[0] === 'string' || typeof action[0] === 'number')  && action[1] !== undefined 
}


type iActionValue<A, T> = A extends Action<T, infer V> ? V : never

type outputActionValue<A, T, V> = iActionValue<A, T> extends never
  ? V
  : iActionValue<A, T> & V

type Component<
  S1,
  V = unknown,
  IA1 = Nil,
  OA1 = Nil,
  C1 = unknown,
  P1 = never
> = {
  matchR<AT extends string | number, S2 extends S1, AV>(
    type: AT,
    cb: (v: AV, s: S1) => S2
  ): Component<
    S2,
    V,
    | Exclude<IA1, Action<AT, iActionValue<IA1, AT>>>
    | Action<AT, outputActionValue<IA1, AT, AV>>,
    OA1,
    C1,
    P1
  >

  matchC<AT extends string | number, AV, OT extends string | number, OV>(
    type: AT,
    cb: (v: AV, s: S1) => Action<OT, OV>
  ): Component<
    S1,
    V,
    Exclude<IA1 | Action<AT, outputActionValue<IA1, AT, AV>>, ['click', Event]>,
    OA1 | Action<OT, OV>,
    C1,
    P1
  >

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
  execute(action: IA1, state: S1): [OA1, S1]
  view(
    cb: (e: (act: IA1) => void, s: S1, v: {[k in keyof C1]: C1[k]}) => V
  ): Component<S1, V, IA1, OA1, C1, P1>
  configure<S2 extends S1>(
    cb: (s: S1) => S2
  ): Component<S2, V, IA1, OA1, C1, P1>
  init(): S1
  render(props: P1): V
}

/** EXAMPLES */

type VNode = string
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
  Action<'GQL', Response> | Action<'click', Event>,
  never,
  never,
  {name: string}
>

const a = c1
  .matchR('hover', (ev: MouseEvent, s) => ({
    color: s.color.toLowerCase()
  }))
  .matchR('click', (ev: Response, s) => ({
    color: s.color.toLowerCase()
  }))
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

const button = COM({
  content: 'fixed'
})

const redButton = button.configure(s => ({
  type: s.content,
  content: 'sas'
}))

class ComponentClass<
S1,
V = unknown,
IA1 = never,
OA1 = never,
C1 = unknown,
P1 = never
> {
  constructor(
    private initialState: S1,
    private matchRSpec: any = {},
    private matchCSpec: any = {}
  ) {}

  init() {
    return this.initialState
  }

  matchR<AT extends string | number, S2 extends S1, AV>(
    type: AT,
    cb: (v: AV, s: S1) => S2
  ) {
    if (this.matchRSpec[type]) {
      this.matchRSpec[type].push(cb)
    } else {
      this.matchRSpec[type] = [cb]
    }
    return new ComponentClass(this.initialState, this.matchRSpec, this.matchCSpec)
  }

  matchC<AT extends string | number, AV, OT extends string | number, OV>(
    type: AT,
    cb: (v: AV, s: S1) => Action<OT, OV>
  ) {
    if (this.matchCSpec[type]) {
      this.matchCSpec[type].push(cb)
    } else {
      this.matchCSpec[type] = [cb]
    }
    return new ComponentClass(this.initialState, this.matchRSpec, this.matchCSpec)
  }

  update<S2 extends S1>(a: IA1, state: S1): S2 | S1 {
    if(isAction(a)){
      return this.matchRSpec[a[0]](a[1], state)
    }
    return state
  }

  command<OT, OV>(a: IA1, state: S1): OA1 | Nil {
    if(isAction(a)) {
      return this.matchCSpec[a[0]](a[1], state)
    }
    return NilAction
  }

  // command(a: IA1, state: S1)

  forward<K extends string | number, S2, IA2, OA2, C2, P2>(key: K, childComponent: ComponentClass<S2, V, IA2, OA2, C2, P2>): ComponentClass<
  S1 & {[k in K]: S2},
  V,
  IA1 | (IA2 extends never ? never : Action<K, IA2>),
  OA1 | (OA2 extends never ? never : Action<K, OA2>),
  C1 & {[k in K]: ComponentClass<S2, V, IA2, OA2, C2, P2>},
  P1
> {
   const newInitialState = {
     ...this.initialState,
     [key]: childComponent.init()
   }
   const newMatchRSpec = {
    ...this.matchRSpec,
    [key]: (a: Action<K, IA2>, s: S1 & {[k in K]: S2}): S1 & {[k in K]: S2} => {
      return {
        ...s,
        [key]: childComponent.update(a[1], s[key])
      }
    }
   }
   const newMatchCSpec = {
     ...this.matchCSpec,
     [key]: (a: Action<K, IA2>, s: S1 & {[k in K]: S2}): Action<K, OA2 | Nil> => {
       return [key, childComponent.command(a[1], s[key])]
     }
   }
   return new ComponentClass(newInitialState, newMatchRSpec)
  }

}