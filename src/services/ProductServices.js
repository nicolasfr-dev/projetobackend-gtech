const Product = require('../models/ProductModel.js');
const Category = require('../models/CategoryModel.js');
const ProductImage = require('../models/ProductImage.js');
const ProductOption = require('../models/ProductOptions.js');
const { Op, Sequelize } = require('sequelize');

class ProductService {
  async search(query) {
    const { limit = 12, page = 1, fields, match, category_ids, 'price-range': priceRange } = query;
    const findOptions = { where: {}, include: [], distinct: true }; 

    if (limit !== '-1') {
        findOptions.limit = parseInt(limit);
        findOptions.offset = (parseInt(page) - 1) * parseInt(limit);
    }

    if (match) {
        findOptions.where[Op.or] = [
            { nome: { [Op.like]: `%${match}%` } },
            { description: { [Op.like]: `%${match}%` } },
        ];
    }
    
    if (category_ids) {
        findOptions.include.push({
            model: Category, as: 'categories',
            where: { id: { [Op.in]: category_ids.split(',') } },
            attributes: [], through: { attributes: [] }
        });
    }

    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        findOptions.where.preco = { [Op.between]: [min, max] };
    }
    
    for (const key in query) {
        if (key.startsWith('option[')) {
            const optionId = key.match(/\[(\d+)\]/)[1];
            const optionValues = query[key].split(',');
            findOptions.include.push({
                model: ProductOption, as: 'options',
                where: {
                    id: optionId,
                    valores_do_produto: {
                        [Op.and]: optionValues.map(val => Sequelize.where(
                            Sequelize.fn('JSON_CONTAINS', Sequelize.col('valores_do_produto'), `"${val}"`), 1
                        ))
                    }
                },
            });
        }
    }

    findOptions.include.push(
        { model: ProductImage, as: 'images', attributes: ['id', 'path'] },
        { model: ProductOption, as: 'options' },
        { model: Category, as: 'categories', attributes: ['id'], through: { attributes: [] } }
    );

    if (fields) findOptions.attributes = fields.split(',');
    
    const { count, rows } = await Product.findAndCountAll(findOptions);

    const data = rows.map(product => {
        const plainProduct = product.get({ plain: true });
        return {
            ...plainProduct,
            category_ids: plainProduct.categories.map(cat => cat.id),
            images: plainProduct.images.map(img => ({ id: img.id, content: img.path }))
        };
    });

    return { data, total: count, limit: limit === '-1' ? count : parseInt(limit), page: limit === '-1' ? 1 : parseInt(page) };
  }

  async findById(id) {
    const product = await Product.findByPk(id, {
        include: [
            { model: ProductImage, as: 'images' },
            { model: ProductOption, as: 'options' },
            { model: Category, as: 'categories', through: { attributes: [] } }
        ]
    });

    if(!product) return null;

    const plainProduct = product.get({ plain: true });
    return {
        ...plainProduct,
        category_ids: plainProduct.categories.map(cat => cat.id),
        images: plainProduct.images.map(img => ({ id: img.id, content: img.path }))
    };
  }

  async create(data) {
    const { category_ids, images, options, ...productData } = data;
    const transaction = await Product.sequelize.transaction();
    try {
        const product = await Product.create(productData, { transaction });

        if (category_ids && category_ids.length > 0) {
            await product.setCategories(category_ids, { transaction });
        }
        if (images && Array.isArray(images)) {
            const imagePromises = images.map(img => ProductImage.create({
                product_id: product.id,
                path: `path/to/${product.slug}-${Date.now()}.${img.type.split('/')[1]}`
            }, { transaction }));
            await Promise.all(imagePromises);
        }
        if (options && Array.isArray(options)) {
            const optionPromises = options.map(opt => {
                const valores = opt.value || opt.values;
                return ProductOption.create({
                    product_id: product.id,
                    titulo: opt.title,
                    shape: opt.shape,
                    radius: opt.radius,
                    type: opt.type,
                    valores_do_produto: valores
                }, { transaction });
            });
            await Promise.all(optionPromises);
        }
        await transaction.commit();
        return product;
    } catch (error) {
        await transaction.rollback();
        console.error('Falha na criação do produto:', error);
        throw error;
    }
  }

  async update(id, data) {
    const { category_ids, images, options, ...productData } = data;
    const transaction = await Product.sequelize.transaction();
    
    try {
        const product = await Product.findByPk(id, { transaction });
        if (!product) {
            await transaction.rollback();
            return false;
        }

        await product.update(productData, { transaction });

        if (category_ids) {
            await product.setCategories(category_ids, { transaction });
        }

        if (images && Array.isArray(images)) {
            for (const image of images) {
                if (image.id && image.deleted) {
                    await ProductImage.destroy({ where: { id: image.id, product_id: product.id }, transaction });
                } else if (!image.id && image.content) {
                    await ProductImage.create({
                        product_id: product.id,
                        path: `path/to/${product.slug}-${Date.now()}.${image.type.split('/')[1]}`
                    }, { transaction });
                }
            }
        }

        if (options && Array.isArray(options)) {
            for (const option of options) {
                if (option.id && option.deleted) {
                    await ProductOption.destroy({ where: { id: option.id, product_id: product.id }, transaction });
                } else if (option.id) {
                    const updateData = { ...option };
                    delete updateData.id;
                    await ProductOption.update(updateData, { where: { id: option.id, product_id: product.id }, transaction });
                } else if (!option.id && option.title) {
                    await ProductOption.create({
                        product_id: product.id,
                        titulo: option.title,
                        shape: option.shape,
                        radius: option.radius,
                        type: option.type,
                        valores_do_produto: option.value || option.values
                    }, { transaction });
                }
            }
        }
        
        await transaction.commit();
        return true;

    } catch (error) {
        await transaction.rollback();
        console.error('Falha na atualização do produto:', error);
        throw error;
    }
  }

  async delete(id) {
    const result = await Product.destroy({ where: { id } });
    return result > 0;
  }
}

module.exports = new ProductService();
