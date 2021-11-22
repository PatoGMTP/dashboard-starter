import MyDB from './database.js';

class Log
{
    date;
    priceUSD;
    id;

    constructor (input)
    {
        if (Array.isArray(input))
        {
            this.date = input[0];
            this.priceUSD = input[1];
            this.id = input[2];
        }
        else
        {
            Object.assign(this, input);
        }
    }
}

class Crypto
{
    db;

    CoinCapAPI_BaseURL;
    CoinCapAPI_Token;
    axios_CoinCap;

    millis_per_day = 86400000;
    refresh_rate;
    tablename = "crypto";

    current;
    previous;
    next;

    parent_element;
    title_element;
    buttons_element;
    content_element;

    constructor(parent)
    {
        this.db = MyDB.getStandardAPIs();

        this.CoinCapAPI_BaseURL = "https://api.coincap.io/v2/assets";
        this.CoinCapAPI_Token = "07c3baf6-c2c4-49fa-bcf4-163e0c763e7a";

        this.axios_CoinCap = axios.create({
            baseURL: this.CoinCapAPI_BaseURL
        });

        this.refresh_rate = this.millis_per_day;

        this.parent_element = parent;
        this.title_element = this.parent_element.querySelector(".title")
        this.buttons_element = this.parent_element.querySelector(".buttons")
        this.content_element = this.parent_element.querySelector(".content")
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
        
        this.previous = resp.data.records.find(item => item.id == "1");
        this.next = resp.data.records.find(item => item.id == "2");
        this.previous.date = new Date(this.previous.date);
        this.next.date = new Date(this.next.date);

        let now = new Date();

        // TODO: CHANGE THIS LATER
        this.refresh_rate = this.refresh_rate / 24 / 60 / 4;

        if (now.getTime() - this.next.date.getTime() > this.refresh_rate)
        {
            this.previous.date = this.next.date;
            this.previous.priceUSD = this.next.priceUSD;

            this.next.date = now;
            this.next.priceUSD = this.current;

            let query = {};
            query.table = this.tablename;
            query.record = this.previous;

            let resp = await this.db.update.post("", query);
            console.log("Previous has been updated:", resp);

            query.record = this.next;

            resp = await this.db.update.post("", query);
            console.log("Next has been updated:", resp);
        }
        else
        {
            // It's been less than "refresh_rate" milliseconds since I last logged on and had crypto updated, so nothing changes
        }
    }

    firstTimeSetup = async() =>
    {
        let query = {};
        query.table = this.tablename;
        let resp = await this.db.read.post("", query);

        if (resp.data.records.length === 0)
        {
            let new_time = new Date();

            let first = new Log(new_time, this.current, "1");
            query.record = first;
            resp = await this.db.create.post("", query);

            console.log(resp);
            
            let second = new Log(new_time, this.current, "2");
            query.record = second;
            resp = await this.db.create.post("", query);

            console.log(resp);
        }
        else
        {
            console.log("Data already initialized!");
        }
    }

    displayStart()
    {
        this.initializeButtons();

        this.title_element.innerHTML = "Crypto";

        this.content_element.innerHTML = "";
    }

    initializeButtons()
    {
        if (this.buttons_element.innerHTML === "")
        {
            console.log("Buttons will be added!");
        }
        else
        {
            console.log("Buttons are good!");
        }
    }
}

export default Crypto;