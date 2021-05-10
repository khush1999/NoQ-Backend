const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const { Transaction } = require("../models/transaction");
const { Invoice } = require("../models/invoice");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/orderHistory`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 }).limit(5);
  let user = req.query.userId;
  orderHistory = orderList.filter(orders => orders.user.user_id == user)
  console.log("#########", orderHistory);
  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

const discountedPrice = (price,qty,discount)=> ((price*qty)*discount)/100

router.post("/", async (req, res) => {
  let order;
  try {
    if(req.body.payment_id) {
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderitem) => {
        let newOrderItem = new OrderItem({
          quantity: orderitem.quantity,
          product: orderitem.product,
        });
  
        newOrderItem = await newOrderItem.save();
  
        return newOrderItem._id;
      })
    );
  
    const orderItemsIdsResolved = await orderItemsIds;
  
    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          ["product",
          "price"]
        );

        console.log("&&&&&&&&&&&&",orderItem);  
        // const totalDiscount = discountedPrice(orderItem.product.price,orderItem.quantity,orderItem.product.discount_percentage)  
        const totalPrice = orderItem.product.price * orderItem.quantity;
          
      return Math.round(totalPrice);
      })
    );
  
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  
    console.log(totalPrices);
  
    order = new Order({
      orderItems: orderItemsIdsResolved,
      address: req.body.address,
      phone: req.body.phone,
      status: "success",
      totalPrice: totalPrice,
      user: req.body.user,
      store_id: req.body.store_id,
    });
    order1 = await order.save();
    transaction = new Transaction({
      orders: order1._id,
      payment_id: req.body.payment_id,
    })
    transaction = await transaction.save();

    invoice = new Invoice ({
      orders: order1._id,
      transaction_id: transaction._id,
      user: order1.user,
    })

    invoice = await invoice.save();
  } else {
    return res.status(400).send("The transaction cannot happen!");
  }
  } catch (error) {
    console.log("Not Found");
    if (!order1) return res.status(400).send("the order cannot be created!"); 
  }
  
  let orders = await Order.findById(order1._id).populate(['address','user']);
  res.status(200).send(orders);
});

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalsales });
});

router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments((count) => count);

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount,
  });
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
