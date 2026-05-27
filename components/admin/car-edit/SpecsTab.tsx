'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { Car } from '@/lib/types';
import styles from '../CarEditForm.module.css';

interface SpecsTabProps {
    register: UseFormRegister<Car>;
}

export default function SpecsTab({ register }: SpecsTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.field}>
                <label>Year</label>
                <input type="number" {...register('year', { valueAsNumber: true })} />
            </div>
            <div className={styles.field}>
                <label>Mileage (km)</label>
                <input type="number" {...register('mileage', { valueAsNumber: true })} />
            </div>
            <div className={styles.field}>
                <label>Fuel Type</label>
                <select {...register('fuel_type')}>
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                </select>
            </div>
            <div className={styles.field}>
                <label>Transmission</label>
                <select {...register('transmission')}>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                </select>
            </div>
            <div className={styles.field}>
                <label>Engine (cm³)</label>
                <input type="number" {...register('engine_cc', { valueAsNumber: true })} />
            </div>
            <div className={styles.field}>
                <label>Drive</label>
                <select {...register('drive')}>
                    <option value="4x4">4x4</option>
                    <option value="fwd">FWD</option>
                    <option value="rwd">RWD</option>
                </select>
            </div>
            <div className={styles.field}>
                <label>Exterior Color</label>
                <input {...register('color_exterior')} placeholder="e.g. Silver Metallic" />
            </div>
            <div className={styles.field}>
                <label>Interior Color</label>
                <input {...register('color_interior')} placeholder="e.g. Black Leather" />
            </div>
            <div className={styles.field}>
                <label>Body Type</label>
                <input {...register('body_type')} placeholder="e.g. SUV, Sedan" />
            </div>
            <div className={styles.field}>
                <label>Seats</label>
                <input type="number" {...register('seats', { valueAsNumber: true })} />
            </div>
        </div>
    );
}
