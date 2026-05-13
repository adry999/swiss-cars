import { useTranslations } from 'next-intl';
import {
    Calendar,
    Gauge,
    Fuel,
    Settings2,
    Zap,
    Palette,
    DoorOpen,
    User2,
    Navigation,
    Scale
} from 'lucide-react';
import { type Car } from '@/lib/types';
import styles from './CarSpecsGrid.module.css';

type Props = {
    car: Car;
};

export default function CarSpecsGrid({ car }: Props) {
    const t = useTranslations('car_detail');

    const specs = [
        { label: t('year'), value: car.year, icon: Calendar },
        { label: t('mileage'), value: `${car.mileage?.toLocaleString() || 0} km`, icon: Gauge },
        { label: t('fuel'), value: car.fuel_type, icon: Fuel },
        { label: t('transmission'), value: car.transmission, icon: Settings2 },
        { label: t('engine'), value: `${car.engine_cc?.toLocaleString() || 0} cm³`, icon: Zap },
        { label: t('drive'), value: car.drive, icon: Navigation },
        { label: t('color'), value: car.color_exterior, icon: Palette },
        { label: t('color_interior'), value: car.color_interior, icon: DoorOpen },
        { label: t('body_type'), value: car.body_type, icon: Scale },
        { label: t('seats'), value: car.seats, icon: User2 },
    ].filter(s => s.value !== null && s.value !== undefined);

    return (
        <div className={styles.grid}>
            {specs.map((spec) => (
                <div key={spec.label} className={styles.item}>
                    <div className={styles.iconWrapper}>
                        <spec.icon size={20} className={styles.icon} />
                    </div>
                    <div className={styles.text}>
                        <span className={styles.label}>{spec.label}</span>
                        <span className={styles.value}>{spec.value}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
