import type classNames from 'classnames'

declare global {
  const cx: typeof classNames
}

declare module '*.css' {
  const x: { [key: string]: string }
  export default x
}

declare module '*.png'
declare module '*.raw.svg' {
  const x: string
  export default x
}