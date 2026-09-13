'use client';

import { ReactNode } from 'react';
import styles from './DataTable.module.css';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
    width?: string;
}

interface Props<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    actions?: (item: T) => ReactNode;
}

export default function DataTable<T extends { id?: string | number }>({
    data,
    columns,
    onRowClick,
    actions
}: Props<T>) {
    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} style={{ width: col.width }}>{col.header}</th>
                        ))}
                        {actions && <th className={styles.actionsHeader}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.empty}>
                                No data found
                            </td>
                        </tr>
                    ) : (
                        data.map((item, i) => (
                            <tr
                                key={item.id || i}
                                onClick={() => onRowClick?.(item)}
                                className={onRowClick ? styles.clickable : ''}
                            >
                                {columns.map((col, j) => (
                                    <td key={j}>
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(item)
                                            : (item[col.accessor] as ReactNode)}
                                    </td>
                                ))}
                                {actions && (
                                    <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                                        {actions(item)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
