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

    getHistory = async() =>
    {
        let resp = await this.axios_CoinCap("/bitcoin/history?interval=m1");
        this.bitcoin_history_arr = resp.data.data;
    }

    getCurrent = async() =>
    {
        let resp = await this.axios_CoinCap("/bitcoin");
        // let temp = resp.data.data.find(item=> item.id === 'bitcoin');
        let temp = resp.data.data;
        // console.log(temp);
        this.bitcoin_live = temp;
        this.current = temp.priceUsd;
        return resp;
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

            query.record = this.next;

            resp = await this.db.update.post("", query);
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

    displayCurrent()
    {
        this.home = false;

        this.content_element.innerHTML = "";
        
        this.form_previous.value = this.previous.priceUSD;
        this.form_current.value = this.current;

        // this.content_element.appendChild(this.form);

        let div = document.createElement("div");

        let x_data = [];
        let y_data = [];

        for (let i = 0; i < 5; i++)
        {
            x_data.push(-4+i);
            y_data.push(this.bitcoin_history_arr[i].priceUsd)
        }

        console.log(this.bitcoin_history_arr[0]);

        let trace1 = {
            type: 'scatter',
            x: x_data,
            y: y_data,
            mode: 'lines',
            name: 'Red',
            line: {
              color: 'rgb(219, 64, 82)',
              width: 3
            }
          };
          
        let layout = {
            title: 'Line and Scatter Styling',
            width: 280,
            height: 255,
            showlegend: false,
            margin: {
              l: 55,
              r: 10,
              b: 25,
              t: 30,
              pad: 4
            },
        };

        // let config = {responsive: true}

        let config = {staticPlot: true}
          
        let data = [trace1];
          
        Plotly.newPlot(div, data, layout, config);

        div.id = "plot";

        // div.children[0].children[0].style = "";
          
        this.content_element.appendChild(div);
    }

    displayStart()
    {
        this.home = true;

        this.initializeButtons();

        this.title_element.innerHTML = "Crypto";

        this.content_element.innerHTML = "";

        this.initializeHome();

        this.content_element.appendChild(this.button_display);

        this.initializeForm();
    }

    initializeHome()
    {
        if (!this.button_display)
        {
            let button_display = document.createElement("button");
            button_display.innerHTML = "Check Crypto";
            button_display.classList.add("showcrypto");
            button_display.addEventListener("click", evt =>{
                this.displayCurrent();
            });
            this.button_display = button_display;
        }
    }

    initializeForm()
    {
        if (!this.form)
        {
            let form = document.createElement("form");
            let label_previous = document.createElement("label")
            label_previous.innerHTML = "Previously:"
            let form_previous = document.createElement("input");
            form_previous.readOnly = true;

            let label_current = document.createElement("label")
            label_current.innerHTML = "Currently:"
            let form_current = document.createElement("input");
            form_current.readOnly = true;

            label_previous.for = "previous";
            form_previous.name = "previous";
            form_previous.readOnly = true;

            label_current.for = "current";
            form_current.name = "current";
            form_current.readOnly = true;

            label_previous.style.display = "block";
            label_current.style.display = "block";

            form.appendChild(label_previous);
            form.appendChild(form_previous);
            form.appendChild(label_current);
            form.appendChild(form_current);

            this.form = form;
            this.form_previous = form_previous;
            this.form_current = form_current;
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

export default Crypto;