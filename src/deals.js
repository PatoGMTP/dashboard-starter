import MyDB from './database.js';

class Game
{
    title;
    id;

    constructor (input)
    {
        if (Array.isArray(input))
        {
            this.title = input[0];
            this.id = input[1];
        }
        else
        {
            Object.assign(this, input);
        }
    }
}

class Deals
{
    db;

    CheapShark_BaseURL;
    axios_CheapShark;

    constructor()
    {
        this.db = MyDB.getStandardAPIs();

        this.CheapShark_BaseURL = "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15";

        this.axios_CheapShark = axios.create({
            baseURL: this.CheapShark_BaseURL
        });
    }
}

export default Deals;