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

    constructor(config) {
              this.config = config;
          
              this.svg = null;
              this.margins = null;
          
              this.xScale = null;
              this.yScale = null;

              this.format = null
          
              this.bars = [];
          
              this.createSvg();
              this.createMargins();
    }

    createSvg() {
        this.svg = d3.select(this.config.div)
            .append("svg")
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', this.config.width + this.config.left + this.config.right)
            .attr('height', this.config.height + this.config.top + this.config.bottom)
    }

    createMargins() {
              this.margins = this.svg
                .append('g')
                .attr("transform", `translate(${this.config.left},${this.config.top})`)
            }



    createBars(data, attr) {
        this.bars = data.map((d) => {
            return {
                height: 30,
                lado: +d[attr],
                sum: +d[attr],
                label: d['attr']
            };
        });
    }

    createScales(data, xRangeAttr, yRangeAttr) {
        
        let yExtent = d3.sort(data, d => d['sum']).map(data => data['label'])
  
        if(yRangeAttr != undefined){
            yExtent = d3.extent(data, d => {
                return d[yRangeAttr];
            });
        }
        
        let xExtent = d3.extent(data, d => {
            return d[xRangeAttr];
        });

        
        
        this.xScale = d3.scaleLinear().domain(xExtent).nice().range([this.config.left, this.config.width]);
        this.yScale = d3.scaleBand().domain(yExtent).rangeRound([this.config.height, this.config.top]).padding(0.1);

        this.format = this.xScale.tickFormat(".2f", "%")
    
    }
    
    createAxis() {
        let xAxis = d3.axisBottom(this.xScale)
        .ticks(10, '%');
    
        let yAxis = d3.axisLeft(this.yScale)
        .tickSizeOuter(0);
    
        this.svg
        .append("g")
        .attr("transform", `translate(0,${this.config.height})`)
        .call(xAxis);
    
        this.svg
        .append("g")
        .attr("transform", `translate(${this.config.left},0)`)
        .call(yAxis);
    }

    barsRender() {
        this.svg
            .append("g")
            .selectAll()
            .data(this.bars)
            .join("rect")
            .attr("x", this.xScale(0))
            .attr("y",(data) => this.yScale(data.label))
            .attr("width", (data) => this.xScale(data.sum) - this.xScale(0))
            .attr("height", this.yScale.bandwidth())
            .style("fill", "steelblue");

            this.svg.append("g")
            .attr("fill", "white")
            .attr("text-anchor", "end")
          .selectAll()
          .data(this.bars)
          .join("text")
            .attr("x", (d) => this.xScale(d.sum))
            .attr("y", (d) => this.yScale(d.label) + this.yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("dx", -4)
            .text((d) => this.format(d.sum))
          .call((text) => text.filter(d => this.xScale(d.sum) - this.xScale(0) < 50) // short bars
            .attr("dx", +4)
            .attr("fill", "black")
            .attr("text-anchor", "start"));
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
                sum: (value/this.superstores.length)
            });
        }
        console.log(data)
        return data;
    }
}

async function main() {
    const data_path = "./dataset/superstoreT.json";
    let config = {div: '#main', width: 800, height: 600, top: 60, left: 80, bottom: 60, right: 80};

    let app = new SuperstoreAnalisys(config);

    const repository = new SuperstoreRepository();

    await repository.loadData(data_path);

    app.createBars(repository.aggregation_count("Region"), "sum");

    app.createScales(app.bars, "sum");
    
    app.createAxis();

    app.barsRender();
}

main();

