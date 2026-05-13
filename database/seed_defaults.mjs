/**
 * Seeding script for SwissCars default homepage content and site config.
 * Run: node database/seed_defaults.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in env.
 * Note: needs the Supabase service role key OR authenticated session to write.
 * Best run via Supabase SQL Editor using default_content_seed.sql
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SITE_CONFIG = {
    site_title: 'SwissCars.md',
    site_description: 'Dealer autorizat de mașini din Elveția. Importăm automobile premium verificate cu istoric complet și garanție.',
    phone: '+41 78 323 31 50',
    whatsapp: '+41783233150',
    email: 'info@swisscars.md',
    address: 'Chișinău, Republica Moldova',
    max_car_images: 25,
    facebook: 'https://facebook.com/swisscars.md',
    instagram: '',
    gtm_id: '',
    logo_url: '',
    notification_email: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
};

const HOMEPAGE_CONTENT = {
    hero_slides: [
        {
            imageSrc: '/media/content/b-main-slider/slider.png',
            slogan: { ro: 'EȘTI GATA SĂ', ru: 'Готов к', en: 'Are you ready to' },
            title: { ro: 'CUMPERI O MAȘINĂ?', ru: 'Покупке авто?', en: 'Buy a car?' },
            cta: { ro: 'VEZI OFERTE', ru: 'Смотреть предложения', en: 'View offers' },
            ctaHref: '#offers',
        },
        {
            imageSrc: '/media/content/b-main-slider/bg.png',
            slogan: { ro: 'O NOUĂ VIZIUNE ASUPRA', ru: 'Новый взгляд на', en: 'A new vision on' },
            title: { ro: 'PIEȚEI AUTO!', ru: 'Автомобильный рынок!', en: 'The car market!' },
            cta: { ro: 'DESCOPERĂ', ru: 'Обнаружить', en: 'Discover' },
            ctaHref: '#offers',
        },
    ],
    about_section: {
        subtitle: { ro: 'Bun venit pe pagina oficială SwissCars.md', ru: 'Добро пожаловать на официальную страницу SwissCars.md', en: 'Welcome to the official SwissCars.md page' },
        title: { ro: 'CINE SUNTEM NOI', ru: 'КТО МЫ', en: 'WHO WE ARE' },
        text: {
            ro: 'SwissCars s-a angajat cu succes în transportul și vânzarea de mașini de peste 10 ani. Aducem la comandă orice automobil din Elveția, făcându-i, mai întâi, un control minuțios. Suntem o echipă receptivă, profesionistă și care vă poate ghida și consulta la necesitate.',
            ru: 'SwissCars успешно занимается транспортировкой и продажей автомобилей уже более 10 лет.',
            en: 'SwissCars has been successfully engaged in the transport and sale of cars for over 10 years.',
        },
    },
    stats_section: {
        stats: [
            { count: 500, suffix: '+', label: { ro: 'Automobile Aduse', ru: 'Импортированных авто', en: 'Cars Imported' } },
            { count: 265, suffix: '', label: { ro: 'Serviciul de transport', ru: 'Перевезенных авто', en: 'Transport Services' } },
            { count: 1450, suffix: '', label: { ro: 'Automobile la reducere', ru: 'Автомобилей со скидкой', en: 'Discounted Cars' } },
        ],
        partnerships: {
            title: { ro: 'Cu peste', ru: 'Более', en: 'Over' },
            count: 150,
            suffix: { ro: 'parteneriate', ru: 'партнерств', en: 'partnerships' },
            text: {
                ro: 'Importăm mașini din Elveția și la necesitate asigurăm consultanță și suport la înregistrarea automobilului.',
                ru: 'Импортируем автомобили из Швейцарии и при необходимости обеспечиваем консультации.',
                en: 'We import cars from Switzerland and when needed provide consulting and support.',
            },
        },
    },
    services_section: {
        title: { ro: 'Serviciile Noastre', ru: 'Наши Услуги', en: 'Our Services' },
        imageSrc: '/media/content/b-services/fig-1.png',
        services: [
            {
                icon: '🔍',
                name: { ro: 'Investigare auto', ru: 'Поиск авто', en: 'Car Search' },
                short: { ro: 'Căutăm cele mai bune soluții.', ru: 'Лучшие решения.', en: 'Best market solutions.' },
                full: {
                    ro: 'Căutăm cele mai bune soluții de pe piața externă. Negociem cel mai bun preț cu vânzătorul și oferim transparență tranzacțiilor.',
                    ru: 'Мы находим лучшие решения на внешнем рынке. Мы договариваемся о наилучшей цене с продавцом и обеспечиваем прозрачность сделок.',
                    en: 'We find the best solutions on the external market. We negotiate the best price with the seller and provide full transaction transparency.',
                },
            },
            {
                icon: '🔧',
                name: { ro: 'Verificare automobil', ru: 'Проверка авто', en: 'Vehicle Inspection' },
                short: { ro: 'Verificare amănunțită.', ru: 'Тщательная проверка.', en: 'Thorough inspection.' },
                full: {
                    ro: 'Efectuăm o verificare amănunțită a automobilului care urmează a fi importat în țară. Defecțiunile sunt remediate înaintea tranzacției.',
                    ru: 'Мы проводим тщательную проверку автомобиля. В случае обнаружения дефектов они устраняются до заключения сделки.',
                    en: 'We conduct a thorough inspection of the vehicle to be imported. Defects are fixed before the purchase transaction.',
                },
            },
            {
                icon: '🚚',
                name: { ro: 'Transport', ru: 'Транспорт', en: 'Transport' },
                short: { ro: 'Transport sigur.', ru: 'Безопасная доставка.', en: 'Safe transport.' },
                full: {
                    ro: 'Transportăm în siguranță orice tip de automobil. Dacă ați găsit o mașină în Elveția, asigurăm verificarea și transportarea acesteia.',
                    ru: 'Мы безопасно транспортируем любой тип автомобиля. Если вы нашли машину в Швейцарии — обеспечиваем проверку и доставку.',
                    en: 'We safely transport any type of vehicle. If you find a car in Switzerland, we ensure inspection and transportation.',
                },
            },
            {
                icon: '🏷️',
                name: { ro: 'Vânzare auto', ru: 'Продажа авто', en: 'Car Sales' },
                short: { ro: 'Automobile originale.', ru: 'Оригинальные авто.', en: 'Original cars.' },
                full: {
                    ro: 'Căutăm pe piața Elveției cele mai bune oferte de automobile, pe care le importăm în Moldova. Vindem automobilele fără modificarea parcursului.',
                    ru: 'Ищем лучшие предложения на швейцарском рынке и импортируем в Молдову. Продаём в оригинальном состоянии, без вмешательства в показания одометра.',
                    en: 'We find the best deals on the Swiss market and import to Moldova. We sell cars in original condition, without tampering with the odometer.',
                },
            },
            {
                icon: '⚙️',
                name: { ro: 'Mentenanță', ru: 'Техобслуживание', en: 'Maintenance' },
                short: { ro: 'Suport complet.', ru: 'Полная поддержка.', en: 'Full support.' },
                full: {
                    ro: 'Oferim mentenanță pe durata transportării și suport în procesul de devamare și înregistrarea mașinii în Republica Moldova.',
                    ru: 'Техобслуживание в процессе транспортировки. Также оказываем поддержку при растаможке и регистрации в Молдове.',
                    en: 'We provide maintenance during transport and assist with customs clearance and vehicle registration in Moldova.',
                },
            },
            {
                icon: '🛡️',
                name: { ro: 'Suport tehnic', ru: 'Техническая поддержка', en: 'Technical Support' },
                short: { ro: 'Garanție completă.', ru: 'Полная гарантия.', en: 'Full guarantee.' },
                full: {
                    ro: 'În cazul identificării unei defecțiuni tehnice, garantăm suport tehnic în înlăturarea acestora.',
                    ru: 'В случае обнаружения технической неисправности — гарантируем поддержку в её устранении.',
                    en: 'If you identify a technical defect, we guarantee technical support in resolving it.',
                },
            },
        ],
    },
    leasing_section: {
        title: {
            ro: 'Principii de bază ale vânzărilor prin leasing',
            ru: 'Основные принципы лизинговых продаж',
            en: 'Basic Principles of Leasing Sales',
        },
        text1: {
            ro: 'Cumpărătorul achită o anumită parte din prețul mașinii (avans), iar apoi plătește o sumă lunară fixă pentru a achiziționa integral mașina într-o anumită perioadă (termenul de leasing).',
            ru: 'Покупатель оплачивает определённую часть стоимости автомобиля (первоначальный взнос), а затем выплачивает фиксированную ежемесячную сумму для полного приобретения автомобиля.',
            en: 'The buyer pays a certain portion of the car price (down payment), then pays a fixed monthly amount to fully acquire the car over a certain period.',
        },
        text2: {
            ro: 'Nu se solicită nicio garanție de la cumpărător. Mașina trebuie asigurată anual împotriva tuturor riscurilor (asigurare CASCO).',
            ru: 'От покупателя не требуется никакого залога. Автомобиль должен ежегодно страховаться от всех рисков (страхование КАСКО).',
            en: 'No collateral is required from the buyer. The car must be insured annually against all risks (CASCO insurance).',
        },
    },
    contact_banner: {
        title: { ro: 'Vezi cele mai bune oferte!', ru: 'Смотрите лучшие предложения!', en: 'See the best offers!' },
        text: { ro: 'Îți propunem o gamă variată de automobile, la preț avantajos și de o calitate pe măsură.', ru: 'Мы предлагаем широкий выбор автомобилей по конкурентным ценам.', en: 'We offer a wide range of cars at competitive prices and top quality.' },
        question: { ro: 'Ai o întrebare?', ru: 'Есть вопрос?', en: 'Have a question?' },
        cta: { ro: 'Apelează-ne!', ru: 'Позвоните нам!', en: 'Call Us!' },
    },
    why_us_section: {
        title: { ro: 'De ce noi?', ru: 'Почему мы?', en: 'Why Us?' },
        items: [
            {
                title: { ro: 'Vindem cele mai bune automobile', ru: 'Продаём лучшие автомобили', en: 'We sell the best cars' },
                text: { ro: 'Timp de 10 ani am demonstrat că suntem capabili să oferim servicii de calitate.', ru: 'За 10 лет мы доказали quality services.', en: 'For 10 years we have proven quality services.' },
            },
            {
                title: { ro: 'Transportăm în siguranță', ru: 'Безопасная транспортировка', en: 'We transport safely' },
                text: { ro: 'Odată ce ați găsit automobilul dorit, noi îl aducem în țară în siguranță.', ru: 'Как только вы нашли автомобиль — безопасно доставляем.', en: 'Once you find the car, we bring it safely.' },
            },
            {
                title: { ro: 'Asigurăm transparența negocierilor', ru: 'Прозрачность переговоров', en: 'Negotiation transparency' },
                text: { ro: 'În fiecare negociere asigurăm transparența tranzacțiilor.', ru: 'В каждых переговорах — прозрачность сделок.', en: 'In every negotiation, full transaction transparency.' },
            },
            {
                title: { ro: 'Livrăm orice model dorit', ru: 'Доставим любую модель', en: 'We deliver any model' },
                text: { ro: 'Cererea dumneavoastră — oferta noastră.', ru: 'Ваш запрос — наше предложение.', en: 'Your request is our offer.' },
            },
        ],
    },
};

async function seed() {
    console.log('🌱 Seeding SwissCars defaults...\n');

    // Seed site_config
    const { error: configError } = await supabase
        .from('site_settings')
        .upsert({ key: 'site_config', value: SITE_CONFIG }, { onConflict: 'key' });

    if (configError) {
        console.error('❌ Failed to seed site_config:', configError.message);
    } else {
        console.log('✅ site_config seeded successfully');
    }

    // Seed homepage_content
    const { error: homepageError } = await supabase
        .from('site_settings')
        .upsert({ key: 'homepage_content', value: HOMEPAGE_CONTENT }, { onConflict: 'key' });

    if (homepageError) {
        console.error('❌ Failed to seed homepage_content:', homepageError.message);
    } else {
        console.log('✅ homepage_content seeded successfully');
    }

    console.log('\n✨ Done! Refresh the admin panel to see the new data.');
}

seed();
