class Superstore{
    constructor(data){

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

class SuperstoreRepository {
    constructor() {
            this.superstores = [];
    }

    async loadData(path) {
        try {
            const response = await fetch(`${path}`);
            const data = await response.json();
            data.forEach(element => {
                this.create(element)
            });
        } catch {
            return {
                id: path,
                name: 'Não Encontrado',
            };
        }
    };
    
    create(data) {
        const superstore = new Superstore(data);

        this.superstores.push(superstore);
    }


}


async function main() {
    const data_path = './dataset/superstore.json'

    let repository = new SuperstoreRepository();
    
    await repository.loadData(data_path);

    console.log(repository.superstores[0])

  }
  
  main();