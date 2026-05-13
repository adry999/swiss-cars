-- ==========================================
-- MIGRATION: Default Homepage Content + Site Config
-- Run this on a fresh Supabase database to populate all default content
-- ==========================================

-- 1. Ensure site_settings table exists (in case this runs before schema)
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow public read on site_settings') THEN
    CREATE POLICY "Allow public read on site_settings" ON site_settings FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow authenticated updates on site_settings') THEN
    CREATE POLICY "Allow authenticated updates on site_settings" ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow authenticated inserts on site_settings') THEN
    CREATE POLICY "Allow authenticated inserts on site_settings" ON site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 3. Ensure leads_inquiries and subscribers tables exist
ALTER TABLE leads_inquiries
  ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Anyone can subscribe') THEN
    CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Authenticated users can manage subscribers') THEN
    CREATE POLICY "Authenticated users can manage subscribers" ON subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads_inquiries' AND policyname = 'Allow authenticated updates on leads_inquiries') THEN
    CREATE POLICY "Allow authenticated updates on leads_inquiries" ON leads_inquiries FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads_inquiries' AND policyname = 'Allow authenticated deletes on leads_inquiries') THEN
    CREATE POLICY "Allow authenticated deletes on leads_inquiries" ON leads_inquiries FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ==========================================
-- 4. DEFAULT SITE CONFIG (contact, social, SEO, GTM, logo, notifications)
-- ==========================================
INSERT INTO site_settings (key, value)
VALUES (
    'site_config',
    '{
        "site_title": "SwissCars.md",
        "site_description": "Dealer autorizat de mașini din Elveția. Importăm automobile premium verificate cu istoric complet și garanție.",
        "phone": "+41 78 323 31 50",
        "whatsapp": "+41783233150",
        "email": "info@swisscars.md",
        "address": "Chișinău, Republica Moldova",
        "max_car_images": 25,
        "facebook": "https://facebook.com/swisscars.md",
        "instagram": "",
        "gtm_id": "",
        "logo_url": "",
        "notification_email": "",
        "telegram_bot_token": "",
        "telegram_chat_id": ""
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 5. DEFAULT HOMEPAGE CONTENT
-- ==========================================
INSERT INTO site_settings (key, value)
VALUES (
    'homepage_content',
    '{
        "hero_slides": [
            {
                "imageSrc": "/media/content/b-main-slider/slider.png",
                "slogan": { "ro": "EȘTI GATA SĂ", "ru": "Готов к", "en": "Are you ready to" },
                "title": { "ro": "CUMPERI O MAȘINĂ?", "ru": "Покупке авто?", "en": "Buy a car?" },
                "cta": { "ro": "VEZI OFERTE", "ru": "Смотреть предложения", "en": "View offers" },
                "ctaHref": "#offers"
            },
            {
                "imageSrc": "/media/content/b-main-slider/bg.png",
                "slogan": { "ro": "O NOUĂ VIZIUNE ASUPRA", "ru": "Новый взгляд на", "en": "A new vision on" },
                "title": { "ro": "PIEȚEI AUTO!", "ru": "Автомобильный рынок!", "en": "The car market!" },
                "cta": { "ro": "DESCOPERĂ", "ru": "Обнаружить", "en": "Discover" },
                "ctaHref": "#offers"
            }
        ],
        "about_section": {
            "subtitle": {
                "ro": "Bun venit pe pagina oficială SwissCars.md",
                "ru": "Добро пожаловать на официальную страницу SwissCars.md",
                "en": "Welcome to the official SwissCars.md page"
            },
            "title": {
                "ro": "CINE SUNTEM NOI",
                "ru": "КТО МЫ",
                "en": "WHO WE ARE"
            },
            "text": {
                "ro": "SwissCars s-a angajat cu succes în transportul și vânzarea de mașini de peste 10 ani. Aducem la comandă orice automobil din Elveția, făcându-i, mai întâi, un control minuțios. Suntem o echipă receptivă, profesionistă și care vă poate ghida și consulta la necesitate.",
                "ru": "SwissCars успешно занимается транспортировкой и продажей автомобилей уже более 10 лет. Мы привозим на заказ любой автомобиль из Швейцарии, предварительно проведя тщательную проверку. Мы — отзывчивая, профессиональная команда, которая может направить и проконсультировать вас при необходимости.",
                "en": "SwissCars has been successfully engaged in the transport and sale of cars for over 10 years. We order any car from Switzerland, first conducting a thorough inspection. We are a responsive, professional team that can guide and advise you as needed."
            }
        },
        "stats_section": {
            "stats": [
                { "count": 500, "suffix": "+", "label": { "ro": "Automobile Aduse", "ru": "Импортированных авто", "en": "Cars Imported" } },
                { "count": 265, "suffix": "", "label": { "ro": "Serviciul de transport", "ru": "Перевезенных авто", "en": "Transport Services" } },
                { "count": 1450, "suffix": "", "label": { "ro": "Automobile la reducere", "ru": "Автомобилей со скидкой", "en": "Discounted Cars" } }
            ],
            "partnerships": {
                "title": {
                    "ro": "Cu peste",
                    "ru": "Более",
                    "en": "Over"
                },
                "count": 150,
                "suffix": {
                    "ro": "parteneriate",
                    "ru": "партнерств",
                    "en": "partnerships"
                },
                "text": {
                    "ro": "Importăm mașini din Elveția și la necesitate asigurăm consultanță și suport la înregistrarea automobilului.",
                    "ru": "Импортируем автомобили из Швейцарии и при необходимости обеспечиваем консультации и поддержку при регистрации автомобиля.",
                    "en": "We import cars from Switzerland and when needed provide consulting and support for vehicle registration."
                }
            }
        },
        "services_section": {
            "title": {
                "ro": "Serviciile Noastre",
                "ru": "Наши Услуги",
                "en": "Our Services"
            },
            "imageSrc": "/media/content/b-services/fig-1.png",
            "services": [
                {
                    "icon": "🔍",
                    "name": { "ro": "Investigare auto", "ru": "Поиск авто", "en": "Car Search" },
                    "short": { "ro": "Căutăm cele mai bune soluții.", "ru": "Лучшие решения.", "en": "Best market solutions." },
                    "full": {
                        "ro": "Căutăm cele mai bune soluții de pe piața externă. Negociem cel mai bun preț cu vânzătorul și oferim transparență tranzacțiilor.",
                        "ru": "Мы находим лучшие решения на внешнем рынке. Мы договариваемся о наилучшей цене с продавцом и обеспечиваем прозрачность сделок.",
                        "en": "We find the best solutions on the external market. We negotiate the best price with the seller and provide full transaction transparency."
                    }
                },
                {
                    "icon": "🔧",
                    "name": { "ro": "Verificare automobil", "ru": "Проверка авто", "en": "Vehicle Inspection" },
                    "short": { "ro": "Verificare amănunțită.", "ru": "Тщательная проверка.", "en": "Thorough inspection." },
                    "full": {
                        "ro": "Efectuăm o verificare amănunțită a automobilului care urmează a fi importat în țară. În cazul identificării unor defecțiuni, sunt remediate înaintea efectuării tranzacției de vânzare-cumpărare.",
                        "ru": "Мы проводим тщательную проверку автомобиля, который планируется импортировать. В случае обнаружения дефектов они устраняются до заключения сделки.",
                        "en": "We conduct a thorough inspection of the vehicle to be imported. If any defects are found, they are fixed before the purchase transaction."
                    }
                },
                {
                    "icon": "🚚",
                    "name": { "ro": "Transport", "ru": "Транспорт", "en": "Transport" },
                    "short": { "ro": "Transport sigur.", "ru": "Безопасная доставка.", "en": "Safe transport." },
                    "full": {
                        "ro": "Transportăm în siguranță orice tip de automobil. În cazul identificării de către dvs a unei mașini în Elveția, noi vă asigurăm verificarea automobilului și transportarea acestuia.",
                        "ru": "Мы безопасно транспортируем любой тип автомобиля. Если вы нашли машину в Швейцарии, мы обеспечиваем её проверку и доставку.",
                        "en": "We safely transport any type of vehicle. If you find a car in Switzerland, we ensure inspection and transportation."
                    }
                },
                {
                    "icon": "🏷️",
                    "name": { "ro": "Vânzare auto", "ru": "Продажа авто", "en": "Car Sales" },
                    "short": { "ro": "Automobile originale.", "ru": "Оригинальные авто.", "en": "Original cars." },
                    "full": {
                        "ro": "Căutăm pe piața Elveției cele mai bune oferte de automobile, pe care le importăm apoi în Republica Moldova. Vindem automobilele în starea lor originală, fără modificarea parcursului.",
                        "ru": "Мы ищем лучшие предложения на швейцарском рынке и импортируем их в Молдову. Мы продаём автомобили в оригинальном состоянии, без вмешательства в показания одометра.",
                        "en": "We search for the best deals on the Swiss market and import them to Moldova. We sell cars in their original condition, without tampering with the odometer."
                    }
                },
                {
                    "icon": "⚙️",
                    "name": { "ro": "Mentenanță", "ru": "Техобслуживание", "en": "Maintenance" },
                    "short": { "ro": "Suport complet.", "ru": "Полная поддержка.", "en": "Full support." },
                    "full": {
                        "ro": "Oferim mentenanță pe durata transportării. Deasemenea, oferim suport în procesul de negociere, devamare și înregistrarea mașinii în Republica Moldova.",
                        "ru": "Мы обеспечиваем техобслуживание в процессе транспортировки. Также оказываем поддержку при переговорах, растаможке и регистрации автомобиля в Молдове.",
                        "en": "We provide maintenance support during transport. We also assist with negotiations, customs clearance, and vehicle registration in Moldova."
                    }
                },
                {
                    "icon": "🛡️",
                    "name": { "ro": "Suport tehnic", "ru": "Техническая поддержка", "en": "Technical Support" },
                    "short": { "ro": "Garanție completă.", "ru": "Полная гарантия.", "en": "Full guarantee." },
                    "full": {
                        "ro": "În cazul identificării de către dvs a unei defecțiuni tehnice, garantăm suport tehnic în înlăturarea acestora.",
                        "ru": "В случае обнаружения технической неисправности мы гарантируем техническую поддержку в её устранении.",
                        "en": "If you identify a technical defect, we guarantee technical support in resolving it."
                    }
                }
            ]
        },
        "leasing_section": {
            "title": {
                "ro": "Principii de bază ale vânzărilor prin leasing",
                "ru": "Основные принципы лизинговых продаж",
                "en": "Basic Principles of Leasing Sales"
            },
            "text1": {
                "ro": "Cumpărătorul achită o anumită parte din prețul mașinii (avans), iar apoi plătește o sumă lunară fixă pentru a achiziționa integral mașina într-o anumită perioadă (termenul de leasing). Pentru serviciile sale, compania de leasing, de regulă, percepe cumpărătorului un comision unic la semnarea contractului de leasing.",
                "ru": "Покупатель оплачивает определённую часть стоимости автомобиля (первоначальный взнос), а затем выплачивает фиксированную ежемесячную сумму для полного приобретения автомобиля в течение определённого периода (срока лизинга). За свои услуги лизинговая компания, как правило, взимает с покупателя единовременную комиссию при подписании договора лизинга.",
                "en": "The buyer pays a certain portion of the car price (down payment), then pays a fixed monthly amount to fully acquire the car over a certain period (the lease term). For its services, the leasing company typically charges the buyer a one-time commission upon signing the lease agreement."
            },
            "text2": {
                "ro": "Nu se solicită nicio garanție de la cumpărător. Mașina trebuie asigurată anual împotriva tuturor riscurilor (asigurare CASCO). Costurile de asigurare sunt suportate de cumpărător. Costul asigurării poate varia în funcție de compania de leasing.",
                "ru": "От покупателя не требуется никакого залога. Автомобиль должен ежегодно страховаться от всех рисков (страхование КАСКО). Расходы на страхование несёт покупатель. Стоимость страхования может варьироваться в зависимости от лизинговой компании.",
                "en": "No collateral is required from the buyer. The car must be insured annually against all risks (CASCO insurance). Insurance costs are borne by the buyer. The insurance cost may vary depending on the leasing company."
            }
        },
        "contact_banner": {
            "title": { "ro": "Vezi cele mai bune oferte!", "ru": "Смотрите лучшие предложения!", "en": "See the best offers!" },
            "text": { "ro": "Îți propunem o gamă variată de automobile, la preț avantajos și de o calitate pe măsură.", "ru": "Мы предлагаем широкий выбор автомобилей по конкурентным ценам и высокого качества.", "en": "We offer a wide range of cars at competitive prices and top quality." },
            "question": { "ro": "Ai o întrebare?", "ru": "Есть вопрос?", "en": "Have a question?" },
            "cta": { "ro": "Apelează-ne!", "ru": "Позвоните нам!", "en": "Call Us!" }
        },
        "why_us_section": {
            "title": { "ro": "De ce noi?", "ru": "Почему мы?", "en": "Why Us?" },
            "items": [
                {
                    "title": { "ro": "Vindem cele mai bune automobile", "ru": "Продаём лучшие автомобили", "en": "We sell the best cars" },
                    "text": { "ro": "Timp de 10 ani am demonstrat că suntem capabili să oferim servicii de calitate și răspundem prompt la fiecare cerere.", "ru": "За 10 лет мы доказали, что способны оказывать качественные услуги и оперативно реагировать на каждый запрос.", "en": "For 10 years we have proven that we can provide quality services and respond promptly to every request." }
                },
                {
                    "title": { "ro": "Transportăm în siguranță", "ru": "Безопасная транспортировка", "en": "We transport safely" },
                    "text": { "ro": "Odată ce ați găsit automobilul dorit, noi îl aducem în țară în siguranță și acordăm suport la devamare acestuia.", "ru": "Как только вы нашли нужный автомобиль, мы безопасно доставляем его в страну и помогаем с растаможкой.", "en": "Once you find the car you want, we bring it to the country safely and provide support with customs clearance." }
                },
                {
                    "title": { "ro": "Asigurăm transparența negocierilor", "ru": "Прозрачность переговоров", "en": "We ensure negotiation transparency" },
                    "text": { "ro": "În fiecare negociere asigurăm transparența tranzacțiilor.", "ru": "В каждых переговорах мы обеспечиваем прозрачность сделок.", "en": "In every negotiation we ensure full transaction transparency." }
                },
                {
                    "title": { "ro": "Livrăm orice model dorit", "ru": "Доставим любую модель", "en": "We deliver any desired model" },
                    "text": { "ro": "Cererea dumneavoastră - oferta noastră. În baza discuțiilor, căutăm cele mai bune automobile pe piața Elveției, raportate atât la preț, cât și la calitate.", "ru": "Ваш запрос — наше предложение. На основе обсуждений мы находим лучшие автомобили на швейцарском рынке, учитывая как цену, так и качество.", "en": "Your request is our offer. Based on discussions, we find the best cars on the Swiss market, considering both price and quality." }
                }
            ]
        }
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- NOTE: Run "ON CONFLICT DO UPDATE" version below to RESET existing data
-- (uncomment if you want to overwrite existing homepage_content)
-- ==========================================
-- INSERT INTO site_settings (key, value) VALUES ('homepage_content', '...')
-- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
