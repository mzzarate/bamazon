// --- mysql package --- \\
var mysql = require("mysql");
// --- inquirer package that allows developers to ask questions --- \\
var inquirer = require("inquirer");
// --- This is a table package that we can use to setup our list of items--- \\
var Table = require("cli-table");
// -- this is a package for colors -- \\
var colors = require("colors");


//MySQL connection information
var connection = mysql.createConnection({

    host: "localhost",

    port: 3306,

    user: "root",

    password: "rootroot",

    database: "bamazon_db"

});

// --- Connecting --- \\
connection.connect(function(err) {

    if (err) throw err;

    console.log("Hello :) You are connected as ".green + connection.threadId);

});


var products = function() {

    console.log("Welcome to Bamazon! Please, find our inventory bellow.".red);

   // --- Creating a table by selecting the items from data --- \\
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        // --- Creates a table using the package - also a constructor --- \\
        var table = new Table({
            head: ["Item ID", "Product Name", "Department", "Price", "Stock Quantity"]
        });


        // --- [for loop] that loops through the products --- \\
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name,
                res[i].price, res[i].stock_quantity
            ]);
        }
        // -- displays the product -- \\ 
        console.log(table.toString());

       // --- inquirer prompt to ask questions --- \\
        inquirer.prompt([{
            name: "itemId",
            type: "input",
            message: "Please, type the Item ID you would like to purchase?".blue,
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            name: "quantity",
            type: "input",
            message: "How many of this product would you like to buy?".blue,
            validate: function(value) {
             if (isNaN(value) === false) {
                 return true;
             } else {
                 return false;
             }
            }
        }]).then(function(answers) {
            var chosenId = answers.itemId;
            var chosenQuantity = answers.quantity;
            purchase(chosenId, chosenQuantity);
        });
    });
};
// --- purchase function and also update db --- \\
function purchase(ID, quantityNeeded) {

    connection.query("SELECT * FROM products WHERE item_id = " + ID, function(err, res) {
        if (err) throw err;
        //
        if (quantityNeeded <= res[0].stock_quantity) {
            var totalCost = res[0].price * quantityNeeded;

            console.log("Your total is $".bold + totalCost + ". Thank you for your purchase!".bold);

            //Update quantity in the DB
            connection.query("UPDATE products SET stock_quantity = stock_quantity - " + quantityNeeded + " WHERE item_id = " + ID);
        
        } else {

            console.log("We don't have enough of that item to fulfill your order.");
        };
        // --- this shows the updated products table --- \\
        products();
    })
}

//Callback to displayProducts function.
products();