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
        // console.log(resp.data);
        let arr = Array.from(resp.data.map(item => [item.gameID, item.external]));
        let set = new Set(arr);
        // console.log(set);
        // console.log(arr);

        return arr.map(item => {
            let obj = {}
            obj.id = item[0];
            obj.text = item[1];
            return obj;
        });
    }

    instantiateSearchItem(item)
    {
        let game_title = document.createElement("input");
        game_title.value = item.text;
        game_title.readOnly = true;
        game_title.style.display = "inline";

        let holder = document.createElement("div");
        holder.id = item.id;

        holder.addEventListener("dblclick", evt => {
            console.log(holder.id);
            this.displayHistoricDetails(holder.id);
        });

        holder.appendChild(game_title);

        return holder;
    }

    displaySearchResults()
    {
        this.home = false;

        this.content_element.innerHTML = "";

        this.content_element.appendChild(this.search_list[this.search_counter]);

        // this.content_element.innerHTML = "Loading...";
    }

    displayBestDeals()
    {
        this.home = false;

        this.content_element.innerHTML = "Loading...";
        
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
        this.content_element.appendChild(this.search_bar);

        this.initializeLists();

        // this.initializeForms();
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

        if (!this.search_bar)
        {
            let holder = document.createElement("div");
            holder.classList.add("search");

            let search_input = document.createElement("input");
            search_input.placeholder = "Enter Game Name";

            let search_button = document.createElement("button");
            search_button.innerHTML = "Search!";

            search_button.addEventListener("click", async evt => {
                if (this.search_bar.children[0].value !== this.last_search_item)
                {
                    this.last_search_item = this.search_bar.children[0].value;

                    this.content_element.innerHTML = "Loading...";
    
                    let resp = await this.searchDeals(this.search_bar.children[0].value);
    
                    let temp = resp;
    
                    this.search_list = [];
    
                    let count = 0;
                    this.search_counter = -1;
                    for (let item of temp)
                    {
                        if (count % 5 === 0)
                        {
                            this.search_counter++;
    
                            let holder = document.createElement("div");
                            holder.id = this.search_counter;
    
                            let left_button = document.createElement("button");
                            left_button.innerHTML = "Previous";
                            left_button.style.display = "inline";
    
                            if (count === 0) left_button.style.display = "none";
                    
                            left_button.addEventListener("click", evt => {
                                this.search_counter--;
                                this.displaySearchResults();
                            });
                            
                            let right_button = document.createElement("button");
                            right_button.innerHTML = "Next";
                            right_button.style.display = "inline";
                    
                            right_button.addEventListener("click", evt => {
                                this.search_counter++;
                                this.displaySearchResults();
                            });
    
                            let list = document.createElement("ol");
                            list.type = "1";
    
                            holder.appendChild(left_button);
                            holder.appendChild(list);
                            holder.appendChild(right_button);
    
                            this.search_list.push(holder);
                        }
                        this.search_list[this.search_counter].children[1].appendChild(this.instantiateSearchItem(item));
                        count++;
                    }
    
                    this.search_list[this.search_counter].children[2].style.display = "none";
    
                    this.search_counter = 0;
                }

                this.displaySearchResults();
            });

            holder.appendChild(search_input);
            holder.appendChild(search_button);

            this.search_bar = holder;
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

    initializeLists()
    {
        if (!this.search_list)
        {
            let list = document.createElement("ol");
            list.type = "1";
            this.search_list = list;
            // for (let item of this.active_tasks)
            // {
            //     this.active_list.appendChild(this.instantiateActiveTask(item));
            // }
        }

        // if (this.historic_list.length === 0)
        // {
        //     // console.log("Testing");
        //     this.reloadHistoricList("New");
        //     // console.log("Ended");
        // }

        // this.history_counter = 0;
    }

    // formMaker(title_label, body_label)
    // {
    //     let form = document.createElement("form");
    //     let label_title = document.createElement("label");
    //     label_title.innerHTML = title_label;
    //     let form_title = document.createElement("input");
    //     form_title.readOnly = true;

    //     let label_body = document.createElement("label");
    //     label_body.innerHTML = body_label;
    //     let form_body = document.createElement("textarea");
    //     form_body.readOnly = true;

    //     label_title.for = "title";
    //     form_title.name = "title";

    //     label_body.for = "body";
    //     form_body.name = "body";

    //     label_title.style.display = "block";
    //     label_body.style.display = "block";

    //     form.appendChild(label_title);
    //     form.appendChild(form_title);
    //     form.appendChild(label_body);
    //     form.appendChild(form_body);

    //     return [form, form_title, form_body];
    // }

    // initializeForms()
    // {
    //     if (!this.form)
    //     {
    //         [this.form, this.form_title, this.form_body] = this.formMaker("Task Title", "Task Details");
    //     }
    // }
}

export default Deals;