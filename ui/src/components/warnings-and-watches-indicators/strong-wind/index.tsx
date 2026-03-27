import styles from './strong-wind.module.css';

type StrongWindLevel = 'watch' | 'warning' | 'red warning';

interface StrongWindProps {
  level: StrongWindLevel;
}

export function StrongWind({ level }: StrongWindProps) {
  const getBorderShape = () => {
    switch (level) {
      case 'watch':
        return (
          <svg
            className={styles.circle}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className={styles.hexagon}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="50,20 150,20 190,100 150,180 50,180 10,100"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
            />
          </svg>
        );
      case 'red warning':
        return (
          <svg
            className={styles.triangle}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 100,30 Q 100,20 105,25 L 180,172 Q 185,182 175,182 L 25,182 Q 15,182 20,172 L 95,25 Q 100,20 100,30 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="15"
            />
          </svg>
        );
    }
  };

  const getColorClass = () => {
    switch (level) {
      case 'watch':
        return styles.yellow;
      case 'warning':
        return styles.orange;
      case 'red warning':
        return styles.red;
    }
  };

  const getImageWrapperClass = () => {
    switch (level) {
      case 'watch':
        return styles.imageWrapperCircle;
      case 'warning':
        return styles.imageWrapperHexagon;
      case 'red warning':
        return styles.imageWrapperTriangle;
    }
  };

  return (
    <div className={`${styles.container} ${getColorClass()}`}>
      {getBorderShape()}
      <div className={`${styles.imageWrapper} ${getImageWrapperClass()}`}>
        <img
          src="/watches_warnings/wind.png"
          alt="Strong wind icon"
          sizes="(max-width: 600px) 100vw, 50vw"
          className={styles.image}
        />
      </div>
    </div>
  );
}
