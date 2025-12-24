import asyncHandler from "express-async-handler";

import Order from "../models/orderModel.js";
import Genre from "../models/genreModel.js";

//@desc create new order
//@route POST /api/orders
//@access Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("no order items");
  } else {
    // Validate stock availability before creating order
    for (const item of orderItems) {
      const product = await Genre.findById(item._id);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name || item._id}`);
      }
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.countInStock}, Requested: ${item.qty}`
        );
      }
    }

    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x._id,
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }

  // res.send("add order items");
});

//@desc GET logged in user orders
//@route GET /api/orders/myorders
//@access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);

  // res.send("get my orders");
});

//@desc GET orders by id
//@route GET /api/orders/:id
//@access Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(400);
    throw new Error("order not found");
  }

  // res.send("get orders by id");
});

//@desc Update order to paid
//@route PUT /api/orders/:id/pay
//@access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  // res.send("update order to paid");
  const order = await Order.findById(req.params.id);

  if (order) {
    // Deduct inventory for each product in the order
    for (const item of order.orderItems) {
      const product = await Genre.findById(item.product);
      if (product) {
        // Check if enough stock is available
        if (product.countInStock < item.qty) {
          res.status(400);
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.countInStock}, Requested: ${item.qty}`
          );
        }
        // Deduct the quantity from stock
        product.countInStock -= item.qty;
        await product.save();
      }
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

//@desc Update order to delivered
//@route PUT /api/orders/:id/deliver
//@access Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }

  // res.send("update order to delivered");
});

//@desc GET all orders
//@route GET /api/orders
//@access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");

  res.status(200).json(orders);
});

// const getOrders = asyncHandler(async (req, res) => {
//   const userId = req.user._id; // The ID of the logged-in user

//   console.log("Admin User ID:", userId); // Log the user ID

//   // Find orders where the user is NOT the owner
//   const orders = await Order.find({ user: { $ne: userId } });

//   console.log("Filtered Orders:", orders); // Log the orders to verify filtering

//   res.status(200).json(orders);
// });

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
};
