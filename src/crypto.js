import MyDB from './database.js';

class Crypto
{
    db = MyDB.getStandardAPIs();

    CoinCapAPI_BaseURL = "https://api.coincap.io/v2/assets";
    CoinCapAPI_Token = "07c3baf6-c2c4-49fa-bcf4-163e0c763e7a";

    axios_CoinCap = axios.create({
        baseURL: CoinCapAPI_BaseURL
    });

    constructor()
    {

    }
}

export default Crypto;