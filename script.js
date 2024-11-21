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
                mes: d['attr'].slice(5),
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
                id: d.OrderID,
                r: 4.5
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
        
        
        if(yRangeAttr == "bars"){
            yExtent = d3.map(data, d => d['label']);
            this.yScale = d3.scaleBand().domain(yExtent).range([this.config.height, this.config.top]).padding(0.1);
            this.format = this.xScale.tickFormat(".2f", "%");
        }
        if(yRangeAttr == 'map'){
            
            const month = {
                "Janeiro": 1,
                "Fevereiro": 2,
                "Março": 3,
                "Abril": 4,
                "Maio": 5,
                "Junho": 6,
                "Julho": 7,
                "Agosto": 8,
                "Setembro": 9,
                "Outubro": 10,
                "Novembro": 11,
                "Dezembro": 12
            }

            yExtent = d3.sort(data, d => Number(month[d['mes']])).map(data => data['mes']);
            xExtent = d3.sort(data).map(data => data['year']);
            let colorExtend = d3.extent(data, d => d.quantity);

            this.colorScale = d3.scaleLinear().domain(colorExtend).range(["white", "steelblue"]);
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
    
        this.margins
        .append("g")
        .attr("transform", `translate(0,${this.config.height})`)
        .call(xAxis);
    
        this.margins
        .append("g")
        .attr("transform", `translate(${this.config.left},0)`)
        .call(yAxis);
    }

    mapRender(){
                        
        this.svg.append("g")
            .selectAll()
            .data(this.barsMap)
            .join("rect")
            .attr("x", d => this.xScale(d.year)+this.config.left)
            .attr("y", d => this.yScale(d.mes)+this.config.top)
            .attr("width", this.xScale.bandwidth())
            .attr("height", this.yScale.bandwidth())
            .style("fill", d => this.colorScale(d.quantity))
            .style("stroke", 'black')
            .style("stroke-width", 0.02)
            .on("mousemove", function(event, data) {
                d3.select(this).style("stroke", "black").style("stroke-width", 2);
                const [posX,posY] = [event.pageX,event.pageY];
                d3.select("#tooltip")
                    .attr('style',`left:${posX}px; top:${posY}px; visibility: visible;`)
                    .html(`${data.mes}-${data.year}<br/><strong>Pedidos: ${data.quantity}</strong>`)                    
            })
            .on("mouseout", function() {

                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", 0.05);

                d3.select("#tooltip").attr('style', 'visibility: hidden;');
 
            })

            



        this.legendaRender(300, 20, this.barsMap)
        this.labelRender("Quantidade de pedidos por ano e mês", "Ano", "Mês")
    }

    barsRender() {
        this.svg
            .append("g")
            .selectAll()
            .data(this.bars)
            .join("rect")
            .attr("x", this.xScale(0)+this.config.left)
            .attr("y",(data) => this.yScale(data.label)+this.config.top)
            .attr("width", (data) => this.xScale(data.sum) - this.xScale(0))
            .attr("height", this.yScale.bandwidth())
            .style("fill", "steelblue");

        this.svg.append("g")
                .attr("fill", "white")
                .attr("text-anchor", "end")
                .selectAll()
                .data(this.bars)
                .join("text")
                .attr("class", "bars-text")
                .attr("x", (d) => this.xScale(d.sum)+this.config.left)
                .attr("y", (d) => this.yScale(d.label) + this.config.top)
                .attr("dy", +22)
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
                    .attr("class", "circle-dispersao")
                    .attr('cx', d => this.xScale(d.cx)+this.config.left)
                    .attr('cy', d => this.yScale(d.cy)+this.config.top)
                    .attr('r' , d => d.r)
                    // .attr('fill', d => this.colScale(d.col));
                    .attr('fill', 'steelblue')
                    .on("mousemove", function(event, data) {
                        
                        
                        d3.select(this).attr("class", "this-circle")
                        .style("stroke-width", 3)
                        .style("stroke", "black")
                        .attr('r' , data.r + 1.5);
                        
                        // d3.selectAll(".circle-dispersao").style("opacity", "0.4");
                        
                        let color = data.cy > 0 ? "green" : "red"

                        const [posX,posY] = [event.pageX,event.pageY];
                        
                        d3.select("#tooltip")
                            .attr('style',`left:${posX+120}px; top:${posY}px; visibility: visible;`)
                            .html(`ID: ${data.id}<br/><strong>Venda: ${data.cx}</strong>
                                <br/><strong class='${color}' >Lucro: ${data.cy}</strong>`)                    
                    })
                    .on("mouseout", function(e, data) {

                        d3.select("#tooltip").attr('style', 'visibility: hidden;');
                        
                        // d3.selectAll(".circle-dispersao").style("opacity", "1");

                        d3.select(this).attr("class", "circle-dispersao")
                            .style("stroke-width", 0.7)
                            .style("stroke", "rgb(62, 62, 62)")
                            .attr('r' , data.r);

         
                    });
        
        this.gridRender()

        this.labelRender("Gráfico de dispersão: Lucro x Preço de Venda", "Preço de Venda", "Lucro")
        
    }

    labelRender(title, labelx, labely){
        this.margins.append("text")
        .attr("text-anchor", "start")
        .attr("id", "title")
        .attr("x", 0)
        .attr("y", 0)
        .text(title);
        
        this.margins.append("text")
        .attr("text-anchor", "start")
        .attr("class", "label")
        .attr("x", this.config.width/2)
        .attr("y", this.config.height + this.config.bottom - 2)
        .text(labelx);

        this.margins.append("text")
        .attr("text-anchor", "end")
        .attr("class", "label")
        .attr("x", -1*this.config.height/2)
        .attr("y", 3)
        .attr("transform", "rotate(-90)")
        .text(labely);
    }

    legendaRender(width, height, data){

        let legend = this.margins.append("g")
            .attr("transform", `translate(${(this.config.width - width)}, ${this.config.height + height})`);
        
        let defs = this.margins.append("defs");
        
        let linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient");

        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white");

        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "steelblue");

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
        this.margins.append("g")
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

    aggregation(agg_data, attr_group, attr_sum, format, func) {
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

            if(attr_sum != ''){
                value_sum = element[attr_sum];
            };

            if (!dict_agg[func(element[attr_group])]) {
                dict_agg[func(element[attr_group])] = value_sum;
            } else {
                dict_agg[func(element[attr_group])] += value_sum;
            }
        });

        for (const [key, value] of Object.entries(dict_agg)) {
            data.push({
                attr: key,
                sum: (value/format)
            });
        }
        
        
        return data;
    }
}

async function main() {
    const data_path = "./dataset/superstore.json";
    
    const repository = new SuperstoreRepository();
    
    await repository.loadData(data_path);
    
    let config = {div: '#main', width: 700, height: 600, top: 60, left: 80, bottom: 60, right: 80};

    let appBars = new SuperstoreAnalisys(config);
    appBars.createBars(repository.aggregation(repository.superstores, "Region", "", "%"), "sum");
    appBars.createScales(appBars.bars, "sum", "bars");
    appBars.createAxis('%');
    appBars.barsRender();


    let appCircles = new SuperstoreAnalisys(config);
    appCircles.createCircles(repository.superstores);
    appCircles.createScales(appCircles.circles, "cx", "cy");
    appCircles.createAxis();
    appCircles.circlesRender();

    const dateFunction = (dateString) => {
        const delimiter =  dateString.includes('/') ? "/" : '-'
        dateString = dateString.split(delimiter)

        const month = {
            1: "Janeiro",
            2: "Fevereiro",
            3: "Março",
            4: "Abril",
            5: "Maio",
            6: "Junho",
            7: "Julho",
            8: "Agosto",
            9: "Setembro",
            10: "Outubro",
            11: "Novembro",
            12: "Dezembro"
        }

        return `${dateString[2]}.${month[Number(dateString[1])]}`
    }
    
    let appMap = new SuperstoreAnalisys(config);
    appMap.createBarsMap(repository.aggregation(repository.superstores, "OrderDate", "", "normal", dateFunction), 'sum')
    appMap.createScales(appMap.barsMap, "year", 'map');
    appMap.createAxis()
    appMap.mapRender()
}

main();
