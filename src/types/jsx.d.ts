import 'react'

declare global {
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {}
  }
}

// Suppress React 18 JSX component return type errors
declare module 'react' {
  type FC<P = {}> = FunctionComponent<P>
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null
  }
}
