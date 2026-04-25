import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uwvfzzchowkftgdwzrum.supabase.co';
const supabaseKey = 'sb_publishable_JsVRun0cndMgrZUkpJDhpg_Rw79xTTg';

export const supabase = createClient(supabaseUrl, supabaseKey);
