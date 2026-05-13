import styles from './loading.module.css';

export default function AdminLoading() {
    return (
        <div className={styles.container}>
            {/* Title skeleton */}
            <div className={styles.titleSkeleton}></div>

            {/* Stats grid skeleton */}
            <div className={styles.statsGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={styles.statCard}>
                        <div className={styles.iconSkeleton}></div>
                        <div className={styles.statInfo}>
                            <div className={styles.labelSkeleton}></div>
                            <div className={styles.valueSkeleton}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sections skeleton */}
            <div className={styles.sections}>
                <div className={styles.section}>
                    <div className={styles.sectionTitleSkeleton}></div>
                    <div className={styles.listSkeleton}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={styles.listItemSkeleton}></div>
                        ))}
                    </div>
                </div>
                <div className={styles.section}>
                    <div className={styles.sectionTitleSkeleton}></div>
                    <div className={styles.listSkeleton}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={styles.listItemSkeleton}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
