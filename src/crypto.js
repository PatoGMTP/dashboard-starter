import MyDB from './database.js';

class Crypto
{
    db;

    CoinCapAPI_BaseURL;
    CoinCapAPI_Token;
    axios_CoinCap;

    constructor()
    {
        this.db = MyDB.getStandardAPIs();

        this.CoinCapAPI_BaseURL = "https://api.coincap.io/v2/assets";
        this.CoinCapAPI_Token = "07c3baf6-c2c4-49fa-bcf4-163e0c763e7a";

        this.axios_CoinCap = axios.create({
            baseURL: this.CoinCapAPI_BaseURL
        });
    }
}

export default Crypto;