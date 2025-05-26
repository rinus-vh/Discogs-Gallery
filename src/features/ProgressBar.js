import styles from './ProgressBar.module.css'

export function ProgressBar({ progress }) {
  return (
    <div className={styles.wrapper}>
      <ProgressFill progress={progress} />
      <ProgressLabel progress={progress} />
    </div>
  )
}

function ProgressFill({ progress }) {
  return (
    <div
      className={styles.fill}
      style={{ width: `${progress}%` }}
    />
  )
}

function ProgressLabel({ progress }) {
  return (
    <div className={styles.labelWrapper}>
      <span className={styles.labelText}>
        {Math.round(progress)}%
      </span>
    </div>
  )
}
