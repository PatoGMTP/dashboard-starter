class Database
{
    token;
    baseURL;

    constructor(tkn, url)
    {
        this.token = tkn;
        this.baseURL = url;
    }

    getCustomInstance = (text) =>
    {
        const item = axios.create({
            method: "POST",
            baseURL: this.baseURL+text,
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${this.token}`
            }
        });

        return item;
    }

    getListTablesAPI = () =>
    {
        return this.getCustomInstance("ListTables");
    }

    getCreateAPI = () =>
    {
        return this.getCustomInstance("Create");
    }

    getDeleteAPI = () =>
    {
        return this.getCustomInstance("Delete");
    }

    getDropTableAPI = () =>
    {
        return this.getCustomInstance("DropTable");
    }

    getReadAPI = () =>
    {
        return this.getCustomInstance("Read");
    }

    getUpdateAPI = () =>
    {
        return this.getCustomInstance("Update");
    }

    getStandardAPIs = () =>
    {
        const obj = {};
        obj.create = this.getCreateAPI();
        obj.read = this.getReadAPI();
        obj.update = this.getUpdateAPI();
        obj.delete = this.getDeleteAPI();
        obj.list = this.getListTablesAPI();
        return obj;
    }
}

let m3oDB_Token = "NDg3NDVjNjUtMWZhOS00YTQwLTgwYWItNDFjMWRmMDZhNWEy";
let m3oDB_BaseULR = "https://api.m3o.com/v1/db/";

let MyDB = new Database(m3oDB_Token, m3oDB_BaseULR);

export default MyDB;