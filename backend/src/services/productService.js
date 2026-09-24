const prisma = require('../config/prisma');

const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      orderItems: {
        take: 5,
        orderBy: { id: 'desc' }
      }
    }
  });
  if (!product) {
    throw new Error(`Product ${id} not found`);
  }
  return product;
};

const createProduct = async (data) => {
  const count = await prisma.product.count();
  const generatedId = data.id || `PC-2026-${String(count + 1).padStart(6, '0')}`;
  
  return await prisma.product.create({
    data: {
      id: generatedId,
      name: data.name,
      description: data.description || '',
      specifications: data.specifications || '',
      price: parseFloat(data.price),
      availableQuantity: parseInt(data.availableQuantity || 0),
      reservedQuantity: parseInt(data.reservedQuantity || 0),
      warrantyMonths: parseInt(data.warrantyMonths || 12),
      status: data.status || 'AVAILABLE',
      assemblyId: data.assemblyId || null
    }
  });
};

const updateProduct = async (id, data) => {
  return await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      specifications: data.specifications,
      price: data.price !== undefined ? parseFloat(data.price) : undefined,
      availableQuantity: data.availableQuantity !== undefined ? parseInt(data.availableQuantity) : undefined,
      reservedQuantity: data.reservedQuantity !== undefined ? parseInt(data.reservedQuantity) : undefined,
      warrantyMonths: data.warrantyMonths !== undefined ? parseInt(data.warrantyMonths) : undefined,
      status: data.status
    }
  });
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id }
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
