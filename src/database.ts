import * as supabase from '@supabase/supabase-js'
import uuid4 from 'uuid4';
import { env } from './env';


const supabaseUrl = env('SUPABASE_URL');
const supabaseServiceRole = env('SUPABASE_SERVICE_ROLE');


export interface User {
    id: string;
    createdAt: any;
    displayName: string;
}

interface GoogleAuth {
    id: string;
    createdAt: any;
    userId: string;
}


class Database {

    private supabaseClient: supabase.SupabaseClient<any, "public", any>;


    constructor() {
        this.supabaseClient = supabase.createClient(supabaseUrl, supabaseServiceRole);
    }


    public async getUserForId(id: String): Promise<User | null> {

        const { error, data } = await this.supabaseClient
            .from('users')
            .select('*')
            .eq('id', id);

        if (error)
            throw error;

        if (data.length == 0)
            return null;

        return data[0];
    }


    public async getUserForGoogleId(id: string): Promise<User | null> {

        const { error, data } = await this.supabaseClient
            .from('googleAuth')
            .select('userId')
            .eq('id', id);

        if (error)
            throw error;

        if (data.length == 0) // Auth connected to no user...?
            return null;

        return await this.getUserForId(data[0].userId);
    }

    public async createUserForGoogleId(id: string): Promise<void> {

        const userId = uuid4();

        const googleAuth: Partial<GoogleAuth> = {
            id,
            userId,
        };

        const user: Partial<User> = {
            id: userId,
            displayName: 'Newborn',
        };

        // Should to use transaction here

        const { error: authInsertError } = await this.supabaseClient
            .from('googleAuth')
            .insert(googleAuth);

        if (authInsertError)
            throw authInsertError;

        const { error: userInsertError } = await this.supabaseClient
            .from('users')
            .insert(user);

        if (userInsertError)
            throw userInsertError;
    }

}


export const database = new Database();
