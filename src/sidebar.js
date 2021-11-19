import MyDB from './database.js';

class Sidebar
{
    db;

    AnimeChan_BaseURL;
    axios_AnimeChan;

    AniAPI_Token;
    AniAPI_BaseURL;
    axios_AniAPI;

    constructor()
    {
        this.db = MyDB.getStandardAPIs();

        this.AnimeChan_BaseURL = "https://animechan.vercel.app/api/quotes/";

        this.axios_AnimeChan = axios.create({
            baseURL: this.AnimeChan_BaseURL
        });

        this.AniAPI_Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcxOSIsIm5iZiI6MTYzNzI3NDg3NCwiZXhwIjoxNjM5ODY2ODc0LCJpYXQiOjE2MzcyNzQ4NzR9.JVK1tJkEmhFttmGhXoi3gR5lUspLnRB0dfw0U1ibIy4";
        this.AniAPI_BaseURL = "https://api.aniapi.com/v1/";

        this.axios_AniAPI = axios.create({
            baseURL: this.AniAPI_BaseURL,
            headers: {
                'Content-Type' : 'Application/json',
                'Authorization': `Bearer ${this.AniAPI_Token}`,
                'Accept': 'application/json'
            }
        });
    }
}

export default Sidebar;