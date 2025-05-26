import styles from './Button.module.css'

/**
 * @typedef {Object} ButtonProps
 * @property {'button' | 'submit'} [type] 
 * @property {() => void} onClick
 * @property {React.ReactNode} [Icon]
 * @property {string} [label]
 * @property {'sm' | 'md' | 'lg'} size
 * @property {boolean} [disabled]
 * @property {string} layoutClassName
 */

/** @param {ButtonProps} props */
export function ButtonOrange({ onClick, label, Icon, disabled, type = 'button', size = 'md', layoutClassName = undefined }) {
  return (
    <ButtonBase className={cx(styles.componentOrange, layoutClassName)} {...{ onClick, label, Icon, disabled, type, size }} />
  )
}

/** @param {ButtonProps} props */
export function ButtonGray({ onClick, label, Icon, disabled, type = 'button', size = 'md', layoutClassName = undefined }) {
  return (
    <ButtonBase className={cx(styles.componentGray, layoutClassName)} {...{ onClick, label, Icon, disabled, type, size }} />
  )
}

/** @param {ButtonProps} props */
export function ButtonRed({ onClick, label, Icon, disabled, type = 'button', size = 'md' }) {
  return (
    <ButtonBase className={styles.componentRed} {...{ onClick, label, Icon, disabled, type, size }} />
  )
}

/** @param {ButtonProps} props */
export function ButtonTransparent({ onClick, label, Icon, disabled, type = 'button', size = 'md' }) {
  return (
    <ButtonBase className={styles.componentTransparent} {...{ onClick, label, Icon, disabled, type, size }} />
  )
}

/**
 * @param {ButtonProps & { className: string }} props
 */
function ButtonBase({ type, onClick, label, Icon, disabled, size, className }) {
  return (
    <button className={cx(styles.componentBase, styles[size], className)} {...{ onClick, disabled, type }}>
      {Icon && <Icon size={getIconSize(size)} className={styles.icon} />}
      {label && <span>{label}</span>}
    </button>
  )
}

function getIconSize(size) {
  switch (size) {
    case 'sm': return 16
    case 'md': return 18
    case 'lg': return 24
    default: {
      console.error('Unknown button size: ', size)
      return 18
    }
  }
}
