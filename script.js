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

    constructor(config, svgId) {
              this.config = config;
              this.id = svgId
          
              this.svg = null;
              this.margins = null;
          
              this.xScale = null;
              this.yScale = null;

              this.format = null
          
              this.bars = [];
              this.circles = [];
              this.barsMap = []
          
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
            .attr('id', this.id)
    }

    createMargins() {
              this.margins = this.svg
                .append('g')
                .attr("transform", `translate(${this.config.left},${this.config.top})`)
    }

    createBarsMap(data, attr){
        this.barsMap = data.map(d => {
            return {
                year: d['attr'].slice(0,4),
                category: d['attr'].slice(5),
                quantity: d[attr]
            }
        })
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

    createCircles(data){
        this.circles = data.map(d => {
            return {
                cx: +d.Sales,
                cy: +d.Profit,
                col: d.Discount,
                cat: d.Category,
                r: 4
            }
        });
              
        // this.circles = this.circles.slice(0, 1000);
                
    }

    createScales(data, xRangeAttr, yRangeAttr) {
        
        let yExtent = d3.extent(data, d => {
            return d[yRangeAttr];
        });
        
        let xExtent = d3.extent(data, d => {
            return d[xRangeAttr];
        });
        
        this.xScale = d3.scaleLinear().domain(xExtent).nice().range([this.config.left, this.config.width]);
        this.yScale = d3.scaleLinear().domain(yExtent).nice().range([this.config.height, this.config.top]);
        
        if(yRangeAttr == undefined){
            yExtent = d3.sort(data, d => d['sum']).map(data => data['label']);
            this.yScale = d3.scaleBand().domain(yExtent).range([this.config.height, this.config.top]).padding(0.1);
            this.format = this.xScale.tickFormat(".2f", "%");
        }
        if(yRangeAttr == 'map'){
            yExtent = d3.sort(data).map(data => data['category']);
            xExtent = d3.sort(data).map(data => data['year']);
            let colorExtend = d3.extent(data, d => d.quantity);

            this.colorScale = d3.scaleLinear().domain(colorExtend).range(["yellow", "red"]);
            this.yScale = d3.scaleBand().domain(yExtent).range([this.config.height, this.config.top]);
            this.xScale = d3.scaleBand().domain(xExtent).range([this.config.left, this.config.width]);

            this.format = this.colorScale.tickFormat()
        }

    
    }
    
    createAxis(format) {
        let xAxis = d3.axisBottom(this.xScale)
        .ticks(15, format);
    
        let yAxis = d3.axisLeft(this.yScale)
        .ticks(15);
    
        this.svg
        .append("g")
        .attr("transform", `translate(0,${this.config.height})`)
        .call(xAxis);
    
        this.svg
        .append("g")
        .attr("transform", `translate(${this.config.left},0)`)
        .call(yAxis);
    }

    mapRender(){

        let xScale = this.xScale;
        let yScale = this.yScale;
        let svg = this.svg;
        let barsMap = this.barsMap
                
        
        this.svg.append("g")
            .selectAll()
            .data(this.barsMap)
            .join("rect")
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.category))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", d => this.colorScale(d.quantity))
            .style("stroke", "none")
            .on("mouseover", function(event, data) {
                svg
                .append("g")
                .attr("id", "countMap")
                .attr("fill", "black")
                .attr("text-anchor", "middle");
                svg.select("#countMap")
                .append("text")
                .attr("x", xScale(data.year) + xScale.bandwidth()/2)
                .attr("y", yScale(data.category) + yScale.bandwidth()/2)
                .text(`${data.quantity} pedidos`)

                    
            })
            .on("mouseout", function(event) {
                if(event.toElement.tagName != 'text'){
                    svg.select("#countMap")
                    .remove()
                }
            })

            



        this.legendaRender(300, 20, this.barsMap)
        this.labelRender("Quantidade de pedidos por ano e categoria", "Ano", "Categoria")
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
        this.labelRender("Quanto cada região representa do total de pedidos", "Percentual", "Região")
    }

    circlesRender() {
        this.svg.selectAll('circle')
                    .data(this.circles)
                    .join('circle')
                    .attr('cx', d => this.xScale(d.cx))
                    .attr('cy', d => this.yScale(d.cy))
                    .attr('r' , d => d.r)
                    // .attr('fill', d => this.colScale(d.col));
                    .attr('fill', 'steelblue');
        
        this.gridRender()

        this.labelRender("Gráfico de dispersão: Lucro x Preço de Venda", "Preço de Venda", "Lucro")
        
    }

    labelRender(title, labelx, labely){
        this.svg.append("text")
        .attr("text-anchor", "end")
        .attr("id", "title")
        .attr("x", this.config.width - this.config.left - this.config.right)
        .attr("y", this.config.top/3)
        .text(title);
        
        this.svg.append("text")
        .attr("text-anchor", "end")
        .attr("class", "label")
        .attr("x", this.config.width/2 + this.config.left)
        .attr("y", this.config.height + this.config.bottom + 20)
        .text(labelx);

        this.svg.append("text")
        .attr("text-anchor", "end")
        .attr("class", "label")
        .attr("x", -1*this.config.height/2)
        .attr("y", this.config.left/3 - 10)
        .attr("transform", "rotate(-90)")
        .text(labely);
    }

    legendaRender(width, height, data){

        let legend = this.svg.append("g")
            .attr("transform", `translate(${(this.config.width - width)}, ${this.config.height + height})`);
        let defs = this.svg.append("defs");
        let linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient");

        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "yellow");

        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "red");

        legend.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "url(#legend-gradient)");

        let legendScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.quantity), d3.max(data, d => d.quantity)])
            .range([0, width]);

        let legendAxis = d3.axisBottom(legendScale)
            .ticks(5);

        legend.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(legendAxis);
    }

    gridRender(){
        this.svg.append("g")
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1)
        .call(g => g.append("g")
            .selectAll("line")
            .data(this.xScale.ticks())
            .join("line")
            .attr("x1", d => 0.5 + this.xScale(d))
            .attr("x2", d => 0.5 + this.xScale(d))
            .attr("y1",this.config.top)
            .attr("y2", this.config.height))
        .call(g => g.append("g")
            .selectAll("line")
            .data(this.yScale.ticks())
            .join("line")
            .attr("y1", d => 0.5 + this.yScale(d))
            .attr("y2", d => 0.5 + this.yScale(d))
            .attr("x1", this.config.left)
            .attr("x2", this.config.width));
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

    aggregation(agg_data, attr_group, attr_group2, attr_sum, format, func) {
        const dict_agg = {};

        let data = [];

        if(func == undefined){
            func = e => String(e)
        }

        switch(format){
            case "%":
                format = agg_data.length;
                break;
            default:
                format = 1;

        };

        agg_data.forEach((element) => {
            
            let value_sum = 1
            let value_attr2 = ''
            
            if(attr_sum != ''){
                value_sum = element[attr_sum];
            };

            if(attr_group2 != ''){
                value_attr2 = element[attr_group2];
            };



            if (!dict_agg[`${func(element[attr_group])}.${value_attr2}`]) {
                dict_agg[`${func(element[attr_group])}.${value_attr2}`] = value_sum;
            } else {
                dict_agg[`${func(element[attr_group])}.${value_attr2}`] += value_sum;
            }
        });
        for (const [key, value] of Object.entries(dict_agg)) {
            data.push({
                attr: key,
                sum: (value/format)
            });
        }
        
        console.log(data)
        return data;
    }
}

async function main() {
    const data_path = "./dataset/superstoreT.json";
    
    const repository = new SuperstoreRepository();
    
    await repository.loadData(data_path);
    
    let config = {div: '#main', width: 700, height: 600, top: 60, left: 80, bottom: 60, right: 80};
    let appBars = new SuperstoreAnalisys(config, "bars");
    appBars.createBars(repository.aggregation(repository.superstores, "Region", "", "", "%"), "sum");
    appBars.createScales(appBars.bars, "sum");
    appBars.createAxis('%');
    appBars.barsRender();


    let appCircles = new SuperstoreAnalisys(config, "circles");
    appCircles.createCircles(repository.superstores);
    appCircles.createScales(appCircles.circles, "cx", "cy");
    appCircles.createAxis();
    appCircles.circlesRender();

    
    let appMap = new SuperstoreAnalisys(config, "map");
    appMap.createBarsMap(repository.aggregation(repository.superstores, "OrderDate","Category", "", "normal", (e) => e.slice(-4)), 'sum')
    console.log(appMap.barsMap)
    appMap.createScales(appMap.barsMap, "year", 'map');
    appMap.createAxis()
    appMap.mapRender()
}

main();

// class Eixos {
//     constructor(config) {
//       this.config = config;
  
//       this.svg = null;
//       this.margins = null;
  
//       this.xScale = null;
//       this.yScale = null;
  
//       this.circles = []
  
//       this.createSvg();
//       this.createMargins();
//     }
  
//     createSvg() {
//       this.svg = d3.select(this.config.div)
//         .append("svg")
//         .attr('x', 10)
//         .attr('y', 10)
//         .attr('width', this.config.width + this.config.left + this.config.right)
//         .attr('height', this.config.height + this.config.top + this.config.bottom);
//     }
  
//     createMargins() {
//       this.margins = this.svg
//         .append('g')
//         .attr("transform", `translate(${this.config.left},${this.config.top})`)
//     }
  
//     async loadCSV(file) {
//       this.circles = await d3.csv(file, d => {
//         return {
//           cx: +d.Sales,
//           cy: +d.Profit,
//           col: d.Discount,
//           cat: d.Category,
//           r: 4
//         }
//       });
  
//       this.circles = this.circles.slice(0, 1000);
//     }
  
//     createScales() {
//       let xExtent = d3.extent(this.circles, d => {
//         return d.cx;
//       });
//       let yExtent = d3.extent(this.circles, d => {
//         return d.cy;
//       });
//       let colExtent = d3.extent(this.circles, d => {
//         return d.col;
//       });
  
//       const cats = this.circles.map(d => {
//         return d.cat;
//       });
//       let catExtent = d3.union(cats);
  
//       this.xScale = d3.scaleLinear().domain(xExtent).nice().range([0, this.config.width]);
//       this.yScale = d3.scaleLinear().domain(yExtent).nice().range([this.config.height, 0]);
  
//       this.colScale = d3.scaleSequential(d3.interpolateOrRd).domain(colExtent);
//       this.catScale = d3.scaleOrdinal().domain(catExtent).range(d3.schemeTableau10);
//     }
  
//     createAxis() {
//       let xAxis = d3.axisBottom(this.xScale)
//         .ticks(15);
  
//       let yAxis = d3.axisLeft(this.yScale)
//         .ticks(15);
  
//       this.margins
//         .append("g")
//         .attr("transform", `translate(0,${this.config.height})`)
//         .call(xAxis);
  
//       this.margins
//         .append("g")
//         .call(yAxis);
//     }
  
//     renderCircles() {
//       this.margins.selectAll('circle')
//         .data(this.circles)
//         .join('circle')
//         .attr('cx', d => this.xScale(d.cx))
//         .attr('cy', d => this.yScale(d.cy))
//         .attr('r' , d => d.r)
//         .attr('fill', d => this.colScale(d.col));
//         // .attr('fill', d => this.catScale(d.cat));
//     }
//   }
  
  
//   async function main() {
//     let c = {div: '#dispersao', width: 800, height: 600, top: 30, left: 50, bottom: 30, right: 30};
    
//     let a = new Eixos(c);
//     await a.loadCSV('../dataset/superstore.csv');
    
//     a.createScales();
//     a.createAxis();
//     a.renderCircles();
//   }
  
//   main();