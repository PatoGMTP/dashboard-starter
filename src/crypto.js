import MyDB from './database.js';

class Crypto
{
    db;

    CoinCapAPI_BaseURL;
    CoinCapAPI_Token;
    axios_CoinCap;

    millis_per_day = 86400000;
    tablename = "crypto";

    current;
    previous;
    next;

    constructor()
    {
        this.db = MyDB.getStandardAPIs();

        this.CoinCapAPI_BaseURL = "https://api.coincap.io/v2/assets";
        this.CoinCapAPI_Token = "07c3baf6-c2c4-49fa-bcf4-163e0c763e7a";

        this.axios_CoinCap = axios.create({
            baseURL: this.CoinCapAPI_BaseURL
        });
    }

    getCurrent = async() =>
    {
        let resp = await this.axios_CoinCap();
        let temp = resp.data.data.find(item=> item.id === 'bitcoin');
        console.log(temp);
        this.current = temp.priceUsd;
        console.log(this.current);
    }

    getPrevious = async() =>
    {
        let query = {};
        query.table = this.tablename;

        let resp = await this.db.read.post("", query);
        console.log(resp);
    }

    firstTimeSetup = async() =>
    {
        let first = {};
        first.date = new Date();
        first.priceUSD = this.current;
        first.id = 1
        
        let second = {};
        second.date = new Date();
        second.priceUSD = this.current;
        second.id = 2
    }
}

export default Crypto;