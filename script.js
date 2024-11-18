class Superstore {
    constructor(data) {
        this.RowID = data["Row ID"];
        this.OrderID = data["Order ID"];
        this.OrderDate = data["Order Date"];
        this.ShipDate = data["Ship Date"];
        this.ShipMode = data["Ship Mode"];
        this.CustomerID = data["Customer ID"];
        this.CustomerName = data["Customer Name"];
        this.Segment = data["Segment"];
        this.City = data["City"];
        this.State = data["State"];
        this.Country = data["Country"];
        this.PostalCode = data["Postal Code"];
        this.Market = data["Market"];
        this.Region = data["Region"];
        this.ProductID = data["Product ID"];
        this.Category = data["Category"];
        this.SubCategory = data["Sub-Category"];
        this.ProductName = data["Product Name"];
        this.Sales = data["Sales"];
        this.Quantity = data["Quantity"];
        this.Discount = data["Discount"];
        this.Profit = data["Profit"];
        this.ShippingCost = data["Shipping Cost"];
        this.OrderPriority = data["Order Priority"];
    }
}

class SuperstoreAnalisys {
    constructor() {
        this.bars = [];
        this.width = 800;
        this.height = 600;

        this.createSvg();
    }

    createSvg() {
        this.svg = d3
            .select("#main")
            .append("svg")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", this.width)
            .attr("height", this.height);
    }

    createBars(data, attr) {
        this.bars = data.map((d) => {
            return {
                height: +d[attr]/20,
                lado: 30,
            };
        });
    }

    barsRender() {
        this.svg
            .selectAll("rect")
            .data(this.bars)
            .join("rect")
            .attr("x", (data, i) => i * data.lado * 1.3)
            .attr("y", (data) => this.height - data.height)
            .attr("width", (data) => data.lado)
            .attr("height", (data) => `${data.height}px`)
            .style("fill", "steelblue");
    }
}

class SuperstoreRepository {
    constructor() {
        this.superstores = [];
    }

    async loadData(path) {
        const response = await fetch(`${path}`);
        const data = await response.json();
        data.forEach((element) => {
            this.createSuperstore(element);
        });
    }

    createSuperstore(data) {
        const superstore = new Superstore(data);

        this.superstores.push(superstore);
    }

    aggregation_count(attr_group) {
        const dict_agg = {};

        let data = [];

        this.superstores.forEach((element) => {
            if (!dict_agg[element[attr_group]]) {
                dict_agg[element[attr_group]] = 1;
            } else {
                dict_agg[element[attr_group]] += 1;
            }
        });

        for (const [key, value] of Object.entries(dict_agg)) {
            data.push({
                attr: key,
                sum: value
            });
        }
        console.log(data);
        return data;
    }
}

async function main() {
    const data_path = "./dataset/superstoreT.json";

    let app = new SuperstoreAnalisys();

    const repository = new SuperstoreRepository();

    await repository.loadData(data_path);

    app.createBars(repository.aggregation_count("Region"), "sum");

    app.barsRender();
}

main();
