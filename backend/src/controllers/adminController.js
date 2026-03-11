import { prisma } from '../models/index.js';

const getModelName = (resource) => {
  const map = {
    users: 'user',
    orders: 'order',
    vendors: 'vendor',
    menu: 'menuItem',
    transactions: 'payment', // mapping transactions to payment or wallet
    reservations: 'reservation',
    reviews: 'review'
  };
  return map[resource] || resource;
};

// Map specific relations to include
const getIncludes = (modelName) => {
  switch (modelName) {
    case 'order':
      return { User: true, MenuItem: true, Payment: true };
    case 'menuItem':
      return { Vendor: true };
    case 'reservation':
      return { User: true };
    default:
      return undefined;
  }
};

export const getList = async (req, res) => {
  try {
    const { resource } = req.params;
    const modelName = getModelName(resource);
    
    // Parse query params for ra-data-simple-rest
    let { filter, range, sort } = req.query;
    
    // Default values
    let skip = 0;
    let take = 10;
    let orderBy = { id: 'desc' };
    let where = {};

    // Parse filter
    if (filter) {
      const parsedFilter = typeof filter === 'string' ? JSON.parse(filter) : filter;
      if (parsedFilter.id) {
        if (Array.isArray(parsedFilter.id)) {
          where.id = { in: parsedFilter.id.map(id => parseInt(id)) };
        } else {
          where.id = parseInt(parsedFilter.id);
        }
      }
      // Add more filters if needed (e.g., q for search)
      Object.keys(parsedFilter).forEach(key => {
        if (key !== 'id') {
          where[key] = parsedFilter[key];
        }
      });
    }

    // Parse range: [0, 9]
    if (range) {
      const [start, end] = JSON.parse(range);
      skip = parseInt(start);
      take = parseInt(end) - parseInt(start) + 1;
    }

    // Parse sort: ["id", "ASC"]
    if (sort) {
      const [field, order] = JSON.parse(sort);
      orderBy = { [field]: order.toLowerCase() };
    }

    const [data, total] = await Promise.all([
      prisma[modelName].findMany({
        where,
        skip,
        take,
        orderBy,
        include: getIncludes(modelName)
      }),
      prisma[modelName].count({ where })
    ]);

    const start = skip;
    const end = Math.min(skip + data.length - 1, total - 1);

    res.setHeader('Content-Range', `${resource} ${start}-${end}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json(data);
  } catch (error) {
    console.error(`getList ${req.params.resource} error:`, error);
    res.status(500).json({ error: error.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const { resource, id } = req.params;
    const modelName = getModelName(resource);
    
    const data = await prisma[modelName].findUnique({
      where: { id: parseInt(id) },
      include: getIncludes(modelName)
    });

    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (error) {
    console.error(`getOne ${req.params.resource} error:`, error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { resource, id } = req.params;
    const modelName = getModelName(resource);
    
    const data = await prisma[modelName].update({
      where: { id: parseInt(id) },
      data: req.body
    });

    res.json(data);
  } catch (error) {
    console.error(`update ${req.params.resource} error:`, error);
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { resource } = req.params;
    const modelName = getModelName(resource);
    
    const data = await prisma[modelName].create({
      data: req.body
    });

    res.json(data);
  } catch (error) {
    console.error(`create ${req.params.resource} error:`, error);
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { resource, id } = req.params;
    const modelName = getModelName(resource);
    
    const data = await prisma[modelName].delete({
      where: { id: parseInt(id) }
    });

    res.json(data);
  } catch (error) {
    console.error(`delete ${req.params.resource} error:`, error);
    res.status(500).json({ error: error.message });
  }
};
