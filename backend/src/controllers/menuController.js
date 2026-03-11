import prisma from '../utils/database.js';

class MenuController {
  async getMenuItems(req, res) {
    try {
      const { category, vendorId, isAvailable, search, page = 1, limit = 20 } = req.query;

      const where = {};
      if (category) where.category = category.toUpperCase();
      if (vendorId) where.vendorId = vendorId;
      if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const menuItems = await prisma.menuItem.findMany({
        where,
        include: {
          vendor: {
            select: { id: true, name: true, rating: true }
          }
        },
        orderBy: { name: 'asc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      });

      const total = await prisma.menuItem.count({ where });

      res.json({
        success: true,
        data: {
          items: menuItems,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get menu items error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch menu items'
      });
    }
  }

  async createMenuItem(req, res) {
    try {
      const vendorId = req.vendor.id;
      const { name, description, price, preparationTime, category, imageUrl } = req.body;

      const menuItem = await prisma.menuItem.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          preparationTime: parseInt(preparationTime) || 15,
          category: category.toUpperCase(),
          imageUrl,
          vendorId
        }
      });

      res.status(201).json({
        success: true,
        data: menuItem,
        message: 'Menu item created successfully'
      });
    } catch (error) {
      console.error('Create menu item error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create menu item'
      });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await prisma.menuItem.findMany({
        select: {
          category: true
        },
        distinct: ['category'],
        where: {
          isAvailable: true
        }
      });

      const categoryList = categories.map(cat => cat.category);

      res.json({
        success: true,
        data: categoryList
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      });
    }
  }

  async getFeaturedItems(req, res) {
    try {
      const featuredItems = await prisma.menuItem.findMany({
        where: {
          isAvailable: true,
          isFeatured: true
        },
        include: {
          vendor: {
            select: { id: true, name: true, rating: true }
          }
        },
        orderBy: { rating: 'desc' },
        take: 10
      });

      res.json({
        success: true,
        data: featuredItems
      });
    } catch (error) {
      console.error('Get featured items error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch featured items'
      });
    }
  }

  async getMenuItem(req, res) {
    try {
      const { itemId } = req.params;

      const menuItem = await prisma.menuItem.findUnique({
        where: { id: itemId },
        include: {
          vendor: {
            select: { id: true, name: true, rating: true, location: true }
          }
        }
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        data: menuItem
      });
    } catch (error) {
      console.error('Get menu item error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch menu item'
      });
    }
  }

  async getVendorMenuItems(req, res) {
    try {
      const vendorId = req.vendor.id;

      const menuItems = await prisma.menuItem.findMany({
        where: { vendorId },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: menuItems
      });
    } catch (error) {
      console.error('Get vendor menu items error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor menu items'
      });
    }
  }

  async updateMenuItem(req, res) {
    try {
      const { itemId } = req.params;
      const vendorId = req.vendor.id;
      const { name, description, price, preparationTime, category, imageUrl } = req.body;

      const menuItem = await prisma.menuItem.findUnique({
        where: { id: itemId }
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: 'Menu item not found'
        });
      }

      if (menuItem.vendorId !== vendorId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const updatedItem = await prisma.menuItem.update({
        where: { id: itemId },
        data: {
          name,
          description,
          price: price ? parseFloat(price) : undefined,
          preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
          category: category ? category.toUpperCase() : undefined,
          imageUrl
        }
      });

      res.json({
        success: true,
        data: updatedItem,
        message: 'Menu item updated successfully'
      });
    } catch (error) {
      console.error('Update menu item error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update menu item'
      });
    }
  }

  async deleteMenuItem(req, res) {
    try {
      const { itemId } = req.params;
      const vendorId = req.vendor.id;

      const menuItem = await prisma.menuItem.findUnique({
        where: { id: itemId }
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: 'Menu item not found'
        });
      }

      if (menuItem.vendorId !== vendorId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      await prisma.menuItem.delete({
        where: { id: itemId }
      });

      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error) {
      console.error('Delete menu item error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete menu item'
      });
    }
  }

  async toggleAvailability(req, res) {
    try {
      const { itemId } = req.params;
      const vendorId = req.vendor.id;

      const menuItem = await prisma.menuItem.findUnique({
        where: { id: itemId }
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: 'Menu item not found'
        });
      }

      if (menuItem.vendorId !== vendorId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const updatedItem = await prisma.menuItem.update({
        where: { id: itemId },
        data: {
          isAvailable: !menuItem.isAvailable
        }
      });

      res.json({
        success: true,
        data: updatedItem,
        message: 'Menu item availability updated successfully'
      });
    } catch (error) {
      console.error('Toggle availability error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update availability'
      });
    }
  }

  async getAllMenuItems(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const menuItems = await prisma.menuItem.findMany({
        include: {
          vendor: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      });

      const total = await prisma.menuItem.count();

      res.json({
        success: true,
        data: {
          items: menuItems,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all menu items error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch menu items'
      });
    }
  }
}

export default new MenuController();
