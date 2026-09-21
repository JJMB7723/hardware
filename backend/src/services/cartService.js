const prisma = require('../config/prisma');

class CartService {
  async getCart(userId = null) {
    const items = await prisma.cartItem.findMany({
      where: userId ? { userId } : {},
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      specifications: item.product.specifications,
      unitPrice: item.product.price,
      quantity: item.quantity,
      totalPrice: item.product.price * item.quantity,
      availableStock: item.product.availableQuantity
    }));

    const grandTotal = summary.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      items: summary,
      grandTotal,
      itemCount: summary.length
    };
  }

  async addToCart(data) {
    const { productId, quantity = 1, userId = null } = data;
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.availableQuantity < quantity) {
      throw new Error(`Requested quantity (${quantity}) exceeds available stock (${product.availableQuantity})`);
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        productId,
        ...(userId ? { userId } : {})
      }
    });

    if (existing) {
      const newQty = existing.quantity + parseInt(quantity);
      if (product.availableQuantity < newQty) {
        throw new Error(`Cannot add more. Total in cart (${newQty}) exceeds stock (${product.availableQuantity})`);
      }
      return await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: true }
      });
    }

    return await prisma.cartItem.create({
      data: {
        productId,
        quantity: parseInt(quantity),
        userId: userId ? parseInt(userId) : null
      },
      include: { product: true }
    });
  }

  async updateQuantity(id, quantity) {
    const qty = parseInt(quantity);
    if (qty <= 0) {
      return await this.removeItem(id);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: { product: true }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (cartItem.product.availableQuantity < qty) {
      throw new Error(`Requested quantity (${qty}) exceeds stock (${cartItem.product.availableQuantity})`);
    }

    return await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: qty },
      include: { product: true }
    });
  }

  async removeItem(id) {
    return await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });
  }

  async clearCart(userId = null) {
    return await prisma.cartItem.deleteMany({
      where: userId ? { userId } : {}
    });
  }
}

module.exports = new CartService();
