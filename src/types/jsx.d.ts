import type * as React from "react"

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Element {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements {}
  }

  interface Window {
    __APP_VERSION__?: string
    __APP_NAME__?: string
  }
}

// Suppress React 18 JSX component return type errors
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  type FC<P = {}> = FunctionComponent<P>
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface FunctionComponent<P = {}> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: P, context?: any): React.ReactElement<any, any> | null
  }
}
