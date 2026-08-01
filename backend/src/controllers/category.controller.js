const prisma = require('../config/database');

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.task_Categories.findMany({ orderBy: { category_id: 'asc' } });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.', error: error.message });
  }
};

// POST /api/categories (Admin)
const createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name) return res.status(400).json({ success: false, message: 'category_name is required.' });

    const category = await prisma.task_Categories.create({ data: { category_name } });
    res.status(201).json({ success: true, message: 'Category created.', data: category });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, message: 'Category already exists.' });
    res.status(500).json({ success: false, message: 'Failed to create category.', error: error.message });
  }
};

module.exports = { getCategories, createCategory };
