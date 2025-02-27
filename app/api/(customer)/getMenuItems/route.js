import { connectMongoDB } from '@/lib/mongodb';
import Menu from '@/models/menu';

export async function GET() {
    try {
        await connectMongoDB();
        const menuItems = await Menu.find({});
        // console.log(menuItems)
        return new Response(JSON.stringify(menuItems), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch menu' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}