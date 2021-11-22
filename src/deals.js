import MyDB from './database.js';

class Game
{
    title;
    desired_price;
    alert;
    id;

    constructor (input)
    {
        if (Array.isArray(input))
        {
            this.title = input[0];
            this.id = input[1];
            this.desired_price = 0;
            this.alert = false;
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

    game_list;

    best_deals;

    tablename = "game";

    CheapShark_BaseURL;
    axios_CheapShark;

    other = "https://www.cheapshark.com/api/1.0/games?id=612";
    lettuce = "deals?storeID=1&upperPrice=15";

    parent_element;
    title_element;
    buttons_element;
    content_element;

    constructor(parent)
    {
        this.db = MyDB.getStandardAPIs();

        this.CheapShark_BaseURL = "https://www.cheapshark.com/api/1.0/";

        this.axios_CheapShark = axios.create({
            baseURL: this.CheapShark_BaseURL
        });

        this.game_list = [];

        this.parent_element = parent;
        this.title_element = this.parent_element.querySelector(".title")
        this.buttons_element = this.parent_element.querySelector(".buttons")
        this.content_element = this.parent_element.querySelector(".content")
    }

    makeNewGame = async(title, id) =>
    {
        let query = {};

        if (typeof(id) === "number") id = id.toString();

        let newGame = new Game([title, id]);

        query.table = this.tablename;
        query.record = newGame;

        let resp = await this.db.create.post("",query);

        this.game_list.push(newGame);
    }

    loadGames = async() =>
    {
        let query = {};
        query.table = this.tablename;
        query.orderBy = "title";

        let resp = await this.db.read.post("", query);
        this.game_list = resp.data.records.map(item=> new Game(item));
    }

    deleteGame = async(id) =>
    {
        let target = this.game_list.find(item=> item.id === id);

        let query = {}
        query.table = this.tablename;
        query.id = id;

        let resp = await this.db.delete.post("", query);

        this.game_list = this.game_list.filter(item=> item !== target);
    }

    getBestDeals = async() =>
    {
        let resp = await this.axios_CheapShark("deals");
        console.log(resp.data);
        return resp.data;
    }

    searchDeals = async(text) =>
    {
        let resp = await this.axios_CheapShark(`games?title=${text}`);
        console.log(resp.data);
        let arr = Array.from(resp.data.map(item => [item.gameID, item.external]));
        let set = new Set(arr);
        console.log(set);
        console.log(arr);
    }

    displayBestDeals()
    {
        this.home = false;

        this.content_element.innerHTML = "Loading..."
        
        this.getBestDeals().then(response => this.content_element.innerHTML = JSON.stringify(response));
    }

    displayStart()
    {
        this.home = true;

        this.initializeButtons();

        this.title_element.innerHTML = "Deals";

        this.content_element.innerHTML = "";

        this.initializeHome();

        this.content_element.appendChild(this.button_display);
    }

    initializeHome()
    {
        if (!this.button_display)
        {
            let button_display = document.createElement("button");
            button_display.innerHTML = "Best Deals";
            button_display.classList.add("showdeals");
            button_display.addEventListener("click", evt =>{
                this.displayBestDeals();
            });
            this.button_display = button_display;
        }
    }

    initializeButtons()
    {
        if (this.buttons_element.innerHTML === "")
        {
            let button_exit = document.createElement("button");
            button_exit.innerHTML = "Exit";
            button_exit.classList.add("exit");
            button_exit.addEventListener("click", evt =>{
                if (!this.home) this.displayStart();
                else console.log("Unfocus!");
            });
    
            // this.parent_element.appendChild(title);
            this.buttons_element.appendChild(button_exit);
        }
        else
        {
            console.log("Buttons are good!");
        }
    }
}

export default Deals;