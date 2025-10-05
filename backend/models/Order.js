const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  }
});

const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'United States'
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'],
    default: 'Credit Card'
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    emailAddress: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  trackingNumber: {
    type: String
  },
  orderNotes: {
    type: String,
    maxlength: [500, 'Order notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Add index for user orders
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-populate user information
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email phone'
  }).populate({
    path: 'orderItems.product',
    select: 'name images'
  });
  next();
});

// Method to calculate order total
orderSchema.methods.calculateTotal = function() {
  this.itemsPrice = this.orderItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  
  // Calculate tax (8% for example)
  this.taxPrice = Math.round(this.itemsPrice * 0.08 * 100) / 100;
  
  // Calculate shipping (free shipping over $100, otherwise $10)
  this.shippingPrice = this.itemsPrice >= 100 ? 0 : 10;
  
  // Calculate total
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
};

module.exports = mongoose.model('Order', orderSchema);