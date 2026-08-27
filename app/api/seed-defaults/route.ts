import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ONE-TIME SEED ENDPOINT - DELETE AFTER USE
// Navigate to /api/seed-defaults to inject default content into Supabase
// Only works if the user is authenticated as admin

const SITE_CONFIG = {
    site_title: 'SwissCars.md',
    site_description: 'Dealer autorizat de mașini din Elveția. Importăm automobile premium verificate cu istoric complet și garanție.',
    phone: '+41 78 323 31 50',
    whatsapp: '+41783233150',
    email: 'info@swisscars.md',
    address: 'Chișinău, Republica Moldova',
    working_hours: 'Luni - Vineri: 09:00 - 18:00',
    working_days_closed: 'Sâmbătă, Duminică: Închis',
    google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d91026.48988013208!2d28.753993!3d47.0245117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97c3628b769a1%3A0x37d1d6305749fd3c!2sChisinau%2C%20Moldova!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s',
    max_car_images: 25,
    facebook: 'https://facebook.com/swisscars.md',
    instagram: '',
    gtm_id: '',
    logo_url: '',
    logo_height: 80,
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
            ru: 'SwissCars успешно занимается транспортировкой и продажей автомобилей уже более 10 лет. Мы привозим на заказ любой автомобиль из Швейцарии.',
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
                    ru: 'Мы находим лучшие решения на внешнем рынке. Мы договариваемся о наилучшей цене и обеспечиваем прозрачность сделок.',
                    en: 'We find the best solutions on the external market. We negotiate the best price and provide full transaction transparency.',
                },
            },
            {
                icon: '🔧',
                name: { ro: 'Verificare automobil', ru: 'Проверка авто', en: 'Vehicle Inspection' },
                short: { ro: 'Verificare amănunțită.', ru: 'Тщательная проверка.', en: 'Thorough inspection.' },
                full: {
                    ro: 'Efectuăm o verificare amănunțită a automobilului care urmează a fi importat. Defecțiunile sunt remediate înaintea tranzacției.',
                    ru: 'Проводим тщательную проверку. В случае дефектов — устраняем до заключения сделки.',
                    en: 'We conduct a thorough inspection. Defects are fixed before the purchase transaction.',
                },
            },
            {
                icon: '🚚',
                name: { ro: 'Transport', ru: 'Транспорт', en: 'Transport' },
                short: { ro: 'Transport sigur.', ru: 'Безопасная доставка.', en: 'Safe transport.' },
                full: {
                    ro: 'Transportăm în siguranță orice tip de automobil. Dacă ați găsit o mașină în Elveția, asigurăm verificarea și transportarea acesteia.',
                    ru: 'Безопасно транспортируем любой тип автомобиля. Если нашли машину в Швейцарии — обеспечиваем проверку и доставку.',
                    en: 'We safely transport any vehicle. If you find a car in Switzerland, we ensure inspection and transportation.',
                },
            },
            {
                icon: '🏷️',
                name: { ro: 'Vânzare auto', ru: 'Продажа авто', en: 'Car Sales' },
                short: { ro: 'Automobile originale.', ru: 'Оригинальные авто.', en: 'Original cars.' },
                full: {
                    ro: 'Căutăm pe piața Elveției cele mai bune oferte de automobile. Vindem automobilele fără modificarea parcursului.',
                    ru: 'Ищем лучшие предложения на рынке Швейцарии. Продаём без вмешательства в показания одометра.',
                    en: 'We find the best deals on the Swiss market. We sell cars without tampering with the odometer.',
                },
            },
            {
                icon: '⚙️',
                name: { ro: 'Mentenanță', ru: 'Техобслуживание', en: 'Maintenance' },
                short: { ro: 'Suport complet.', ru: 'Полная поддержка.', en: 'Full support.' },
                full: {
                    ro: 'Oferim mentenanță pe durata transportării și suport în procesul de devamare și înregistrarea mașinii în Republica Moldova.',
                    ru: 'Техобслуживание при транспортировке и поддержка при растаможке и регистрации в Молдове.',
                    en: 'Maintenance support during transport and assistance with customs clearance and registration in Moldova.',
                },
            },
            {
                icon: '🛡️',
                name: { ro: 'Suport tehnic', ru: 'Техническая поддержка', en: 'Technical Support' },
                short: { ro: 'Garanție completă.', ru: 'Полная гарантия.', en: 'Full guarantee.' },
                full: {
                    ro: 'În cazul identificării unei defecțiuni tehnice, garantăm suport tehnic în înlăturarea acestora.',
                    ru: 'При обнаружении технической неисправности — гарантируем поддержку в её устранении.',
                    en: 'If a technical defect is found, we guarantee technical support in resolving it.',
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
            ro: 'Cumpărătorul achită o anumită parte din prețul mașinii (avans), iar apoi plătește o sumă lunară fixă pentru a achiziționa integral mașina într-o anumită perioadă (termenul de leasing). Pentru serviciile sale, compania de leasing percepe un comision unic la semnarea contractului.',
            ru: 'Покупатель оплачивает часть стоимости автомобиля (аванс), затем выплачивает фиксированную ежемесячную сумму. Лизинговая компания взимает единовременную комиссию при подписании договора.',
            en: 'The buyer pays a portion of the car price (down payment), then pays a fixed monthly amount. The leasing company charges a one-time commission upon signing the agreement.',
        },
        text2: {
            ro: 'Nu se solicită nicio garanție de la cumpărător. Mașina trebuie asigurată anual împotriva tuturor riscurilor (asigurare CASCO). Costurile de asigurare sunt suportate de cumpărător.',
            ru: 'Залог от покупателя не требуется. Автомобиль ежегодно страхуется от всех рисков (КАСКО). Расходы на страхование несёт покупатель.',
            en: 'No collateral required. The car must be insured annually against all risks (CASCO). Insurance costs are borne by the buyer.',
        },
    },
    contact_banner: {
        title: { ro: 'Vezi cele mai bune oferte!', ru: 'Смотрите лучшие предложения!', en: 'See the best offers!' },
        text: { ro: 'Îți propunem o gamă variată de automobile, la preț avantajos și de o calitate pe măsură.', ru: 'Предлагаем широкий выбор автомобилей по конкурентным ценам.', en: 'We offer a wide range of cars at competitive prices and top quality.' },
        question: { ro: 'Ai o întrebare?', ru: 'Есть вопрос?', en: 'Have a question?' },
        cta: { ro: 'Apelează-ne!', ru: 'Позвоните нам!', en: 'Call Us!' },
    },
    why_us_section: {
        title: { ro: 'De ce noi?', ru: 'Почему мы?', en: 'Why Us?' },
        items: [
            {
                title: { ro: 'Vindem cele mai bune automobile', ru: 'Продаём лучшие автомобили', en: 'We sell the best cars' },
                text: { ro: 'Timp de 10 ani am demonstrat că suntem capabili să oferim servicii de calitate și răspundem prompt la fiecare cerere.', ru: 'За 10 лет доказали качество услуг и оперативность.', en: 'For 10 years we have proven quality services and prompt responses.' },
            },
            {
                title: { ro: 'Transportăm în siguranță', ru: 'Безопасная транспортировка', en: 'We transport safely' },
                text: { ro: 'Odată ce ați găsit automobilul dorit, noi îl aducem în țară în siguranță și acordăm suport la devamare.', ru: 'Как только нашли автомобиль — безопасно доставляем и помогаем с растаможкой.', en: 'Once you find the car, we bring it safely and assist with customs.' },
            },
            {
                title: { ro: 'Asigurăm transparența negocierilor', ru: 'Прозрачность переговоров', en: 'Negotiation transparency' },
                text: { ro: 'În fiecare negociere asigurăm transparența tranzacțiilor.', ru: 'В каждых переговорах — прозрачность сделок.', en: 'Full transaction transparency in every negotiation.' },
            },
            {
                title: { ro: 'Livrăm orice model dorit', ru: 'Доставим любую модель', en: 'We deliver any model' },
                text: { ro: 'Cererea dumneavoastră — oferta noastră. Căutăm cele mai bune automobile pe piața Elveției.', ru: 'Ваш запрос — наше предложение. Ищем лучшие авто на рынке Швейцарии.', en: 'Your request is our offer. We find the best cars on the Swiss market.' },
            },
        ],
    },
};

export async function POST() {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please log in as admin first.' }, { status: 401 });
        }

        const results: Record<string, string> = {};

        // Seed site_config (only if empty)
        const { data: existingConfig } = await supabase.from('site_settings').select('key').eq('key', 'site_config').maybeSingle();
        if (!existingConfig) {
            const { error } = await supabase.from('site_settings').insert({ key: 'site_config', value: SITE_CONFIG });
            results.site_config = error ? `❌ ${error.message}` : '✅ Inserted';
        } else {
            results.site_config = 'ℹ️ Already exists (not overwritten)';
        }

        // Seed homepage_content (upsert to always get full content)
        const { error: hpError } = await supabase
            .from('site_settings')
            .upsert({ key: 'homepage_content', value: HOMEPAGE_CONTENT }, { onConflict: 'key' });
        results.homepage_content = hpError ? `❌ ${hpError.message}` : '✅ Upserted with full content';

        return NextResponse.json({
            message: '🌱 Seed complete! Refresh your homepage.',
            results,
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
