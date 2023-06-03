const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const seedData = require('./Seeds/products')
const Product = require('./model/product')

mongoose.connect('mongodb://127.0.0.1:27017/paulamedCafe', {
    // useNewUrlParser: true,
    // // useCreateIndex: true,
    // useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, " connection error:"));
db.once("open", () => {
    console.log("Database Connected");
})

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async (seedData) => {
    // await Product.deleteMany({});
    for (let i = 0; i < 200; i++) {


        const productData = sample(seedData);
        const prod = new Product({
            title: productData.title,
            description: productData.description,
            image: 'https://source.unsplash.com/collection/10623559',
            category: productData.category,
            price: productData.price,
            size: productData.size,
        });
        await prod.save();
    }
};





seedDB(seedData);