-- Test-Skript für die Session-Speicherung
-- Dieses Skript überprüft, ob die partial_surveys Tabelle korrekt funktioniert

-- 1. Prüfen ob die Tabelle existiert
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'partial_surveys' 
AND table_schema = 'public';

-- 2. Prüfen der Spalten-Struktur
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'partial_surveys' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Prüfen der Indizes
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'partial_surveys';

-- 4. Prüfen der Policies
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'partial_surveys';

-- 5. Test-Daten einfügen und abrufen
DO $$
DECLARE
    test_session_id TEXT := 'test_session_' || extract(epoch from now())::text;
    retrieved_record RECORD;
    test_answers JSONB := '{"age": "25-35", "gender": "male"}';
BEGIN
    RAISE NOTICE 'Starting partial_surveys functionality test...';
    
    -- INSERT Test
    INSERT INTO partial_surveys (session_id, current_step, answers, email)
    VALUES (test_session_id, 'demographics', test_answers, 'test@example.com');
    RAISE NOTICE 'INSERT: Successfully inserted test record';
    
    -- SELECT Test
    SELECT * INTO retrieved_record 
    FROM partial_surveys 
    WHERE session_id = test_session_id;
    
    IF retrieved_record.session_id = test_session_id THEN
        RAISE NOTICE 'SELECT: Successfully retrieved test record';
    ELSE
        RAISE EXCEPTION 'SELECT: Failed to retrieve test record';
    END IF;
    
    -- UPDATE Test (UPSERT)
    INSERT INTO partial_surveys (session_id, current_step, answers, email)
    VALUES (test_session_id, 'relationship', test_answers || '{"relationship": "single"}', 'test@example.com')
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        current_step = EXCLUDED.current_step,
        answers = EXCLUDED.answers,
        updated_at = NOW();
    
    SELECT * INTO retrieved_record 
    FROM partial_surveys 
    WHERE session_id = test_session_id;
    
    IF retrieved_record.current_step = 'relationship' THEN
        RAISE NOTICE 'UPSERT: Successfully updated test record';
    ELSE
        RAISE EXCEPTION 'UPSERT: Failed to update test record';
    END IF;
    
    -- DELETE Test
    DELETE FROM partial_surveys WHERE session_id = test_session_id;
    
    SELECT * INTO retrieved_record 
    FROM partial_surveys 
    WHERE session_id = test_session_id;
    
    IF retrieved_record.session_id IS NULL THEN
        RAISE NOTICE 'DELETE: Successfully deleted test record';
    ELSE
        RAISE EXCEPTION 'DELETE: Failed to delete test record';
    END IF;
    
    RAISE NOTICE 'All tests passed! partial_surveys table is working correctly.';
    
EXCEPTION
    WHEN OTHERS THEN
        -- Cleanup in case of error
        DELETE FROM partial_surveys WHERE session_id = test_session_id;
        RAISE EXCEPTION 'Test failed: %', SQLERRM;
END $$;

-- 6. Aktuelle Daten in der Tabelle anzeigen (nur zur Überprüfung)
SELECT 
    session_id,
    current_step,
    email,
    created_at,
    updated_at,
    expires_at,
    CASE 
        WHEN expires_at > NOW() THEN 'Active'
        ELSE 'Expired'
    END as status
FROM partial_surveys 
ORDER BY created_at DESC 
LIMIT 10;