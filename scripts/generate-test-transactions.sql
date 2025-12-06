
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_account_ids UUID[];
    v_account_count INTEGER;
    v_transaction_id UUID;
    v_type TEXT;
    v_status TEXT;
    v_category TEXT;
    v_description TEXT;
    v_amount NUMERIC;
    v_date TIMESTAMPTZ;
    v_account_id UUID;
    i INTEGER;
    v_type_enum_name TEXT;
    v_status_enum_name TEXT;
    v_user_id_param TEXT := NULL;
    v_column_user_id TEXT;
    v_column_account_id TEXT;
    v_column_created_at TEXT;
    v_column_updated_at TEXT;
    categories_income TEXT[] := ARRAY['Зарплата', 'Премия', 'Дивиденды', 'Проценты по вкладу', 'Возврат средств', 'Подарок', 'Продажа', 'Доход от инвестиций'];
    categories_expense TEXT[] := ARRAY['Продукты', 'Транспорт', 'Кафе и рестораны', 'Одежда', 'Развлечения', 'Здоровье', 'Образование', 'Коммунальные услуги', 'Интернет', 'Мобильная связь', 'Покупка техники', 'Подарки', 'Путешествия', 'Спорт', 'Книги'];
    descriptions_income TEXT[] := ARRAY['Зарплата за месяц', 'Премия по итогам квартала', 'Дивиденды по акциям', 'Проценты по депозиту', 'Возврат за покупку', 'Подарок на день рождения', 'Продажа старой техники', 'Доход от фриланса'];
    descriptions_expense TEXT[] := ARRAY['Покупка продуктов в магазине', 'Оплата проезда в метро', 'Обед в ресторане', 'Покупка одежды', 'Билеты в кино', 'Визит к врачу', 'Оплата курсов', 'Коммунальные платежи', 'Оплата интернета', 'Пополнение мобильного', 'Покупка ноутбука', 'Подарок другу', 'Билеты на самолет', 'Абонемент в спортзал', 'Покупка книг'];
BEGIN
    v_user_id_param := current_setting('app.user_id', true);
    
    IF v_user_id_param IS NOT NULL AND v_user_id_param != '' THEN
        v_user_id := v_user_id_param::UUID;
        SELECT email INTO v_user_email FROM users WHERE id = v_user_id;
        IF v_user_email IS NULL THEN
            RAISE NOTICE 'Пользователь с ID % не найден.', v_user_id_param;
            RETURN;
        END IF;
    ELSE
        SELECT id, email INTO v_user_id, v_user_email FROM users ORDER BY "createdAt" DESC LIMIT 1;
    END IF;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Не найден пользователь. Убедитесь, что в базе есть хотя бы один пользователь.';
        RAISE NOTICE 'Для указания конкретного пользователя выполните: SET app.user_id = ''<user_id>''; перед запуском скрипта.';
        RETURN;
    END IF;
    
    SELECT column_name INTO v_column_user_id
    FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name IN ('userId', 'user_id')
    LIMIT 1;
    
    SELECT column_name INTO v_column_account_id
    FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name IN ('accountId', 'account_id')
    LIMIT 1;
    
    SELECT column_name INTO v_column_created_at
    FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name IN ('createdAt', 'created_at')
    LIMIT 1;
    
    SELECT column_name INTO v_column_updated_at
    FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name IN ('updatedAt', 'updated_at')
    LIMIT 1;
    
    IF v_column_user_id IS NULL OR v_column_account_id IS NULL THEN
        RAISE NOTICE 'Не найдены колонки userId/user_id или accountId/account_id в таблице transactions.';
        RETURN;
    END IF;
    
    EXECUTE format('SELECT ARRAY_AGG(id) FROM accounts WHERE %I = $1', v_column_user_id) USING v_user_id INTO v_account_ids;
    
    IF v_account_ids IS NULL OR array_length(v_account_ids, 1) = 0 THEN
        RAISE NOTICE 'Не найдены счета для пользователя %. Убедитесь, что у пользователя есть хотя бы один счет.', v_user_email;
        RETURN;
    END IF;
    
    SELECT t.typname INTO v_type_enum_name
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE e.enumlabel = 'INCOME'
    LIMIT 1;
    
    SELECT t.typname INTO v_status_enum_name
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE e.enumlabel = 'PENDING'
    LIMIT 1;
    
    IF v_type_enum_name IS NULL OR v_status_enum_name IS NULL THEN
        RAISE NOTICE 'Не найдены enum типы в базе данных. Проверьте схему базы данных.';
        RETURN;
    END IF;
    
    v_account_count := array_length(v_account_ids, 1);
    RAISE NOTICE 'Генерация транзакций для пользователя: % (email: %)', v_user_id, v_user_email;
    RAISE NOTICE 'Найдено счетов: %', v_account_count;
    RAISE NOTICE 'Используются enum типы: type=%, status=%', v_type_enum_name, v_status_enum_name;
    RAISE NOTICE 'Используются колонки: userId=%, accountId=%, createdAt=%, updatedAt=%', v_column_user_id, v_column_account_id, v_column_created_at, v_column_updated_at;
    
    FOR i IN 1..1000 LOOP
        IF random() < 0.7 THEN
            v_type := 'EXPENSE';
            v_category := categories_expense[1 + floor(random() * array_length(categories_expense, 1))::int];
            v_description := descriptions_expense[1 + floor(random() * array_length(descriptions_expense, 1))::int];
            v_amount := round((random() * 50000 + 50)::numeric, 2);
        ELSE
            v_type := 'INCOME';
            v_category := categories_income[1 + floor(random() * array_length(categories_income, 1))::int];
            v_description := descriptions_income[1 + floor(random() * array_length(descriptions_income, 1))::int];
            v_amount := round((random() * 200000 + 1000)::numeric, 2);
        END IF;
        
        IF random() < 0.8 THEN
            v_status := 'COMPLETED';
        ELSIF random() < 0.95 THEN
            v_status := 'PENDING';
        ELSE
            v_status := 'FAILED';
        END IF;
        
        v_date := NOW() - (random() * interval '180 days');
        v_transaction_id := gen_random_uuid();
        v_account_id := v_account_ids[1 + floor(random() * v_account_count)::int];
        
        EXECUTE format(
            'INSERT INTO transactions (id, type, amount, description, date, category, status, %I, %I, "isRecurring", %I, %I) VALUES ($1, $2::%I, $3, $4, $5, $6, $7::%I, $8, $9, $10, $11, $12)',
            v_column_user_id,
            v_column_account_id,
            v_column_created_at,
            v_column_updated_at,
            v_type_enum_name,
            v_status_enum_name
        ) USING v_transaction_id, v_type, v_amount, v_description || ' #' || i, v_date, v_category, v_status, v_user_id, v_account_id, false, v_date, v_date;
        
        IF i % 100 = 0 THEN
            RAISE NOTICE 'Создано транзакций: %', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Генерация завершена! Создано 1000 транзакций для пользователя: % (email: %)', v_user_id, v_user_email;
    RAISE NOTICE 'Проверьте, что вы авторизованы под этим пользователем в интерфейсе!';
END $$;


