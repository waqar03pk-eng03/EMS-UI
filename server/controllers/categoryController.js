const mongoose = require('mongoose');
const Category = require('../models/Category');
const Event = require('../models/Event');

function checkId(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid category id.' });
    return false;
  }
  return true;
}

const pick = b => ({ name: b.name, description: b.description });

exports.list = async (req, res) => {
  res.json(await Category.find().sort({ name: 1 }).collation({ locale: 'en', strength: 2 }));
};

exports.create = async (req, res) => {
  res.status(201).json(await Category.create(pick(req.body)));
};

exports.update = async (req, res) => {
  if (!checkId(req, res)) return;
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found.' });
  category.set(pick(req.body));
  await category.save();
  res.json(category);
};

exports.remove = async (req, res) => {
  if (!checkId(req, res)) return;
  const inUse = await Event.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    return res.status(409).json({
      message: `This category is used by ${inUse} event${inUse === 1 ? '' : 's'}. Move them to another category first.`,
    });
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found.' });
  res.status(204).end();
};
