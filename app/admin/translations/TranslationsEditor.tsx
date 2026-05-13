'use client';

import { useState, useTransition } from 'react';
import { Save, Loader2, Search, Globe, ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';
import { updateI18nMessages } from '@/lib/actions/translations';

type Props = {
    locales: string[];
    initialMessages: Record<string, any>;
};

export default function TranslationsEditor({ locales, initialMessages }: Props) {
    const [activeLocale, setActiveLocale] = useState(locales[0]);
    const [messages, setMessages] = useState(initialMessages);
    const [search, setSearch] = useState('');
    const [isPending, startTransition] = useTransition();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        'common': true,
        'home': true
    });

    const currentData = messages[activeLocale] || {};

    const handleUpdate = (path: string[], value: string) => {
        setMessages(prev => {
            const next = { ...prev };
            let current = next[activeLocale];
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return next;
        });
    };

    const handleSave = () => {
        startTransition(async () => {
            const res = await updateI18nMessages(activeLocale, messages[activeLocale]);
            if (res.success) {
                alert('Traduceri salvate cu succes!');
            } else {
                alert('Eroare la salvare.');
            }
        });
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Recursive component to render nested keys
    const renderNode = (obj: any, path: string[] = []) => {
        return Object.entries(obj).map(([key, value]) => {
            const currentPath = [...path, key];
            const isObject = typeof value === 'object' && value !== null;
            const fullKey = currentPath.join('.');

            if (search && !fullKey.toLowerCase().includes(search.toLowerCase()) &&
                (typeof value === 'string' && !value.toLowerCase().includes(search.toLowerCase()))) {
                if (!isObject) return null;
                // If it's an object, we need to check if any children match
                const children = renderNode(value, currentPath);
                if (children.every(c => c === null)) return null;
            }

            if (isObject) {
                const sectionKey = currentPath.join('.');
                const isExpanded = expandedSections[sectionKey] || search;

                return (
                    <div key={fullKey} style={{ marginBottom: '10px' }}>
                        <button
                            type="button"
                            onClick={() => toggleSection(sectionKey)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                width: '100%', padding: '12px 16px', borderRadius: '10px',
                                background: '#f4f4f5', border: '1px solid #e4e4e7',
                                cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '14px'
                            }}
                        >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <span style={{ color: 'var(--color-primary)' }}>{key.toUpperCase()}</span>
                            <span style={{ fontSize: '12px', color: '#71717a', marginLeft: 'auto' }}>
                                {Object.keys(value).length} chei
                            </span>
                        </button>
                        {isExpanded && (
                            <div style={{ padding: '10px 0 10px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {renderNode(value, currentPath)}
                            </div>
                        )}
                    </div>
                );
            }

            return (
                <div key={fullKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <code style={{ fontSize: '12px', color: '#71717a' }}>{fullKey}</code>
                    </div>
                    <textarea
                        value={value as string}
                        onChange={(e) => handleUpdate(currentPath, e.target.value)}
                        rows={2}
                        style={{
                            width: '100%', padding: '10px 12px', borderRadius: '8px',
                            border: '1px solid #e4e4e7', fontSize: '14px', lineHeight: '1.5',
                            resize: 'vertical', fontFamily: 'inherit'
                        }}
                    />
                </div>
            );
        });
    };

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Editor Traduceri</h1>
                    <p style={{ color: '#71717a', fontSize: '14px' }}>Modifică textele site-ului fără a accesa fișierele JSON.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', borderRadius: '10px',
                        background: 'var(--color-primary)', color: 'white',
                        border: 'none', fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(192, 57, 43, 0.2)',
                        transition: 'all 0.2s'
                    }}
                >
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Salvează Traducerile
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', border: '1px solid #e4e4e7', borderRadius: '10px', background: 'white', padding: '4px' }}>
                    {locales.map(loc => (
                        <button
                            key={loc}
                            onClick={() => setActiveLocale(loc)}
                            style={{
                                padding: '8px 20px', borderRadius: '7px', border: 'none',
                                background: activeLocale === loc ? '#f4f4f5' : 'transparent',
                                color: activeLocale === loc ? 'var(--color-primary)' : '#71717a',
                                fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                                fontSize: '13px'
                            }}
                        >
                            {loc}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} size={16} />
                    <input
                        placeholder="Caută după cheie sau text..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px',
                            border: '1px solid #e4e4e7', fontSize: '14px'
                        }}
                    />
                </div>
            </div>

            <div style={{
                background: 'white', border: '1px solid #e4e4e7', borderRadius: '16px',
                padding: '24px', maxHeight: '70vh', overflowY: 'auto',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', marginBottom: '24px' }}>
                    <AlertCircle size={18} color="#d97706" />
                    <span style={{ fontSize: '13px', color: '#92400e' }}>
                        Atenție: Modificările sunt permanente. Se recomandă reîncărcarea paginii site-ului pentru a vedea textele noi.
                    </span>
                </div>
                {renderNode(currentData)}
            </div>
        </div>
    );
}
